import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const dayOfMonth = now.getDate();

    // Only send reminders on the 1st and 5th of each month
    if (dayOfMonth !== 1 && dayOfMonth !== 5) {
      return new Response(JSON.stringify({ message: "Not a reminder day" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all active contracts
    const { data: activeContracts, error: cErr } = await supabase
      .from("contracts")
      .select("*")
      .eq("status", "active");

    if (cErr) throw cErr;
    if (!activeContracts?.length) {
      return new Response(JSON.stringify({ message: "No active contracts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let remindersCreated = 0;

    for (const contract of activeContracts) {
      // Check if payment already exists for this month
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("contract_id", contract.id)
        .eq("period_month", currentMonth)
        .eq("period_year", currentYear)
        .eq("status", "completed")
        .limit(1);

      if (existingPayment && existingPayment.length > 0) continue;

      // Create notification for tenant
      const { error: nErr } = await supabase.from("notifications").insert({
        user_id: contract.tenant_id,
        title: "Rappel de loyer",
        message: `Votre loyer de ${new Intl.NumberFormat("fr-BJ").format(contract.monthly_rent)} FCFA est dû pour le mois en cours.`,
        type: "payment_reminder",
        link: "/paiements",
      });

      if (!nErr) remindersCreated++;

      // Also notify owner if day 5 and still unpaid
      if (dayOfMonth === 5) {
        await supabase.from("notifications").insert({
          user_id: contract.owner_id,
          title: "Loyer en attente",
          message: `Le loyer de ${new Intl.NumberFormat("fr-BJ").format(contract.monthly_rent)} FCFA n'a pas encore été reçu pour ce mois.`,
          type: "payment_reminder",
          link: "/paiements",
        });
      }
    }

    return new Response(JSON.stringify({ success: true, remindersCreated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
