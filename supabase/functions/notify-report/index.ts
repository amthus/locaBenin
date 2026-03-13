import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { report_id, property_title, reason, reporter_name } = await req.json();

    if (!report_id || !property_title || !reason) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all admin users
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(
        JSON.stringify({ message: "No admins found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create notifications for all admins
    const notifications = adminRoles.map((admin) => ({
      user_id: admin.user_id,
      title: "🚨 Nouveau signalement",
      message: `L'annonce "${property_title}" a été signalée pour: ${reason}${reporter_name ? ` par ${reporter_name}` : ""}`,
      type: "warning",
      link: "/ctrl-panel-x?tab=reports",
    }));

    const { error: notifError } = await supabase.from("notifications").insert(notifications);

    if (notifError) {
      console.error("Error creating notifications:", notifError);
    }

    // If LOVABLE_API_KEY is available, we could send emails here
    // For now, we rely on in-app notifications which are created by the trigger

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${adminRoles.length} admin(s)`,
        notifications_created: notifications.length 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in notify-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
