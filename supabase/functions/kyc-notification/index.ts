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

    const { userId, status, reason } = await req.json();

    if (!userId || !status) {
      throw new Error("userId and status are required");
    }

    // Get user profile and email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, user_id")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      throw new Error(`Profile not found: ${profileError.message}`);
    }

    // Get user email from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !authUser?.user?.email) {
      console.log("Could not get user email, skipping email notification");
      return new Response(JSON.stringify({ success: true, message: "No email found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = authUser.user.email;
    const userName = profile?.full_name || "Utilisateur";

    // Prepare email content based on status
    let subject: string;
    let htmlContent: string;

    if (status === "approved") {
      subject = "✓ Votre identité a été vérifiée - LOCABENIN";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header .icon { font-size: 48px; margin-bottom: 15px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1f2937; margin-top: 0; }
            .content p { color: #4b5563; line-height: 1.8; }
            .badge { display: inline-block; background: #d1fae5; color: #059669; padding: 8px 16px; border-radius: 20px; font-weight: 600; margin: 20px 0; }
            .cta { display: inline-block; background: #10b981; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">✓</div>
              <h1>Identité vérifiée !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${userName},</h2>
              <p>Excellente nouvelle ! Votre demande de vérification d'identité a été <strong>approuvée</strong> par notre équipe.</p>
              <div class="badge">🛡️ Badge de confiance activé</div>
              <p>Votre profil affiche désormais le badge de confiance, ce qui renforce votre crédibilité auprès des autres utilisateurs de la plateforme.</p>
              <p>Vous avez maintenant accès à toutes les fonctionnalités de LOCABENIN.</p>
              <a href="https://locabenin.com/profil" class="cta">Voir mon profil</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LOCABENIN - Plateforme de location immobilière au Bénin</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = "Vérification d'identité refusée - LOCABENIN";
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header .icon { font-size: 48px; margin-bottom: 15px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #1f2937; margin-top: 0; }
            .content p { color: #4b5563; line-height: 1.8; }
            .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .reason-box strong { color: #dc2626; }
            .cta { display: inline-block; background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px 30px; text-align: center; font-size: 12px; color: #9ca3af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">✕</div>
              <h1>Vérification refusée</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${userName},</h2>
              <p>Nous avons examiné votre demande de vérification d'identité et nous ne pouvons malheureusement pas l'approuver pour le moment.</p>
              <div class="reason-box">
                <strong>Motif :</strong><br>
                ${reason || "Documents non conformes ou illisibles."}
              </div>
              <p>Vous pouvez soumettre une nouvelle demande avec des documents valides et lisibles.</p>
              <p><strong>Conseils :</strong></p>
              <ul>
                <li>Assurez-vous que le document est bien lisible</li>
                <li>Prenez la photo dans un endroit bien éclairé</li>
                <li>Le document doit être en cours de validité</li>
              </ul>
              <a href="https://locabenin.com/profil" class="cta">Soumettre de nouveaux documents</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LOCABENIN - Plateforme de location immobilière au Bénin</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Log the email attempt (actual sending would require an email service)
    console.log(`KYC Email notification prepared for ${userEmail}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Status: ${status}`);

    // TODO: Integrate with an email service (Resend, SendGrid, etc.)
    // For now, we just log and return success
    // The in-app notification is already sent from the hook

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email notification prepared",
        recipient: userEmail,
        status 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("KYC notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
