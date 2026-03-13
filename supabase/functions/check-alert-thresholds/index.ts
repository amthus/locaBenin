import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let isTest = false;
    try {
      const body = await req.json();
      isTest = body?.test === true;
    } catch {
      // No body or not JSON, that's fine
    }

    // Load settings
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", [
        "alerts_enabled",
        "alert_revenue_threshold",
        "alert_kyc_pending_threshold",
        "alert_unverified_users_threshold",
        "alert_email_recipient",
      ]);

    const config: Record<string, string> = {};
    (settings || []).forEach((s: any) => {
      config[s.key] = s.value;
    });

    if (config.alerts_enabled !== "true" && !isTest) {
      return new Response(
        JSON.stringify({ message: "Alerts disabled", alerts_triggered: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const revenueThreshold = parseInt(config.alert_revenue_threshold) || 100000;
    const kycThreshold = parseInt(config.alert_kyc_pending_threshold) || 5;
    const unverifiedThreshold = parseInt(config.alert_unverified_users_threshold) || 10;
    const emailRecipient = config.alert_email_recipient || "";

    // Check current values
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [paymentsRes, kycRes, profilesRes] = await Promise.all([
      supabase
        .from("payments")
        .select("amount")
        .eq("period_month", currentMonth)
        .eq("period_year", currentYear),
      supabase.from("kyc_verifications").select("id").eq("status", "pending"),
      supabase.from("profiles").select("id").eq("is_verified", false),
    ]);

    const monthlyRevenue = (paymentsRes.data || []).reduce(
      (sum: number, p: any) => sum + (p.amount || 0),
      0
    );
    const pendingKyc = (kycRes.data || []).length;
    const unverifiedUsers = (profilesRes.data || []).length;

    const alerts: string[] = [];
    const alertDetails: { type: string; message: string; current: number; threshold: number }[] = [];

    // Check revenue
    if (monthlyRevenue < revenueThreshold) {
      const msg = `Revenus mensuels (${monthlyRevenue.toLocaleString()} FCFA) inférieurs au seuil (${revenueThreshold.toLocaleString()} FCFA)`;
      alerts.push("Revenus bas");
      alertDetails.push({
        type: "revenue",
        message: msg,
        current: monthlyRevenue,
        threshold: revenueThreshold,
      });
    }

    // Check KYC
    if (pendingKyc > kycThreshold) {
      const msg = `${pendingKyc} demandes KYC en attente (seuil: ${kycThreshold})`;
      alerts.push("KYC en attente");
      alertDetails.push({
        type: "kyc",
        message: msg,
        current: pendingKyc,
        threshold: kycThreshold,
      });
    }

    // Check unverified users
    if (unverifiedUsers > unverifiedThreshold) {
      const msg = `${unverifiedUsers} utilisateurs non vérifiés (seuil: ${unverifiedThreshold})`;
      alerts.push("Utilisateurs non vérifiés");
      alertDetails.push({
        type: "unverified",
        message: msg,
        current: unverifiedUsers,
        threshold: unverifiedThreshold,
      });
    }

    if (alertDetails.length > 0) {
      // Send in-app notifications to all admins
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      const adminIds = (adminRoles || []).map((r: any) => r.user_id);

      for (const adminId of adminIds) {
        for (const alert of alertDetails) {
          await supabase.from("notifications").insert({
            user_id: adminId,
            title: `⚠️ Alerte: ${alert.type === "revenue" ? "Revenus bas" : alert.type === "kyc" ? "KYC en attente" : "Utilisateurs non vérifiés"}`,
            message: alert.message,
            type: "warning",
            link: "/ctrl-panel-x?tab=alerts",
          });
        }
      }

      // Send email if configured
      if (emailRecipient && RESEND_API_KEY) {
        const alertHtml = alertDetails
          .map(
            (a) => `
          <div style="padding: 15px; margin-bottom: 10px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <strong style="color: #856404;">⚠️ ${a.type === "revenue" ? "Revenus mensuels bas" : a.type === "kyc" ? "KYC en attente" : "Utilisateurs non vérifiés"}</strong>
            <p style="margin: 5px 0 0; color: #856404;">${a.message}</p>
          </div>
        `
          )
          .join("");

        const emailBody = `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; padding: 30px; background: #f8f9fa;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #1a1a1a; font-size: 22px; margin-bottom: 5px;">🔔 Alertes LOCABENIN</h1>
              <p style="color: #666; font-size: 14px; margin-bottom: 25px;">
                ${isTest ? "[TEST] " : ""}Rapport d'alertes du ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR")}
              </p>
              ${alertHtml}
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
              <p style="color: #999; font-size: 12px; text-align: center;">
                Vous pouvez modifier les seuils dans le panneau d'administration → Alertes.
              </p>
            </div>
          </body>
          </html>
        `;

        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "LOCABENIN Alertes <onboarding@resend.dev>",
            to: [emailRecipient],
            subject: `${isTest ? "[TEST] " : ""}⚠️ ${alertDetails.length} alerte(s) - LOCABENIN`,
            html: emailBody,
          }),
        });

        if (!emailRes.ok) {
          const errText = await emailRes.text();
          console.error("Resend error:", errText);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_triggered: alerts,
        details: alertDetails,
        values: { monthlyRevenue, pendingKyc, unverifiedUsers },
        is_test: isTest,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Alert check error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
