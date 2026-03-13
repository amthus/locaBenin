import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any>;
  created_at: string;
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Use raw query since types aren't regenerated yet
      const { data, error } = await supabase
        .from("admin_activity_logs" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs((data as unknown as ActivityLog[]) || []);
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await (supabase as any).from("admin_activity_logs").insert([
        {
          admin_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId || null,
          details: details || {},
        },
      ]);

      if (error) throw error;
      
      // Refresh logs after insert
      await fetchLogs();
    } catch (error: any) {
      console.error("Error logging activity:", error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, logActivity, refresh: fetchLogs };
}
