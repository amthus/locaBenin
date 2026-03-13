import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Report {
  id: string;
  property_id: string;
  reporter_id: string;
  reason: string;
  description: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  property?: {
    title: string;
    city: string;
  };
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(`
          *,
          property:properties(title, city)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports((data as unknown as Report[]) || []);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (
    propertyId: string,
    reason: string,
    description?: string
  ) => {
    if (!user?.id) {
      toast({ title: "Erreur", description: "Vous devez être connecté", variant: "destructive" });
      return false;
    }

    try {
      const { error } = await supabase.from("reports").insert([
        {
          property_id: propertyId,
          reporter_id: user.id,
          reason,
          description: description || null,
        },
      ]);

      if (error) throw error;
      
      toast({ title: "Signalement envoyé", description: "Merci pour votre signalement." });
      await fetchReports();
      return true;
    } catch (error: any) {
      console.error("Error creating report:", error);
      toast({ title: "Erreur", description: "Impossible d'envoyer le signalement", variant: "destructive" });
      return false;
    }
  };

  const updateReportStatus = async (
    reportId: string,
    status: "pending" | "reviewed" | "resolved" | "rejected"
  ) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      setReports(prev =>
        prev.map(r =>
          r.id === reportId
            ? { ...r, status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }
            : r
        )
      );

      toast({ title: "Statut mis à jour" });
      return true;
    } catch (error: any) {
      console.error("Error updating report:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour", variant: "destructive" });
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    createReport,
    updateReportStatus,
    refresh: fetchReports,
  };
}
