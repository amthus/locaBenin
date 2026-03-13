import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface KycRequest {
  id: string;
  user_id: string;
  document_type: string;
  document_url: string;
  document_back_url: string | null;
  selfie_url: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  profile?: {
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    city: string | null;
  };
}

export interface KycStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export const useAdminKyc = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<KycRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<KycStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });

  const calculateStats = (data: KycRequest[]) => {
    const pending = data.filter(r => r.status === "pending").length;
    const approved = data.filter(r => r.status === "approved").length;
    const rejected = data.filter(r => r.status === "rejected").length;
    return { pending, approved, rejected, total: data.length };
  };

  const fetchRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("kyc_verifications")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each request
      const userIds = [...new Set((data || []).map((d: any) => d.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, avatar_url, city")
        .in("user_id", userIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const enrichedRequests: KycRequest[] = (data || []).map((d: any) => ({
        ...d,
        profile: profileMap.get(d.user_id),
      }));

      setRequests(enrichedRequests);
      setStats(calculateStats(enrichedRequests));
    } catch (err) {
      console.error("Error fetching KYC requests:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscribe to realtime KYC updates
  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("admin-kyc-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "kyc_verifications",
        },
        (payload) => {
          console.log("KYC realtime update:", payload);
          // Refresh data on any change
          fetchRequests();
          
          if (payload.eventType === "INSERT") {
            toast({
              title: "📋 Nouvelle demande KYC",
              description: "Une nouvelle demande de vérification vient d'être soumise.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

  const approveKyc = async (kycId: string, userId: string) => {
    try {
      // Update KYC status
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", kycId);

      if (kycError) throw kycError;

      // Update user profile verification
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_verified: true })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      // Send notification to user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Identité vérifiée ✓",
        message: "Félicitations ! Votre identité a été vérifiée avec succès. Le badge de confiance est maintenant actif sur votre profil.",
        type: "success",
        link: "/profil",
      });

      // Trigger email notification via edge function
      try {
        await supabase.functions.invoke("kyc-notification", {
          body: { userId, status: "approved" },
        });
      } catch {
        // Email notification is optional
      }

      toast({ title: "KYC approuvé", description: "L'utilisateur a été notifié." });
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  const rejectKyc = async (kycId: string, userId: string, reason: string) => {
    try {
      // Update KYC status
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update({
          status: "rejected",
          rejection_reason: reason,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", kycId);

      if (kycError) throw kycError;

      // Send notification to user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Vérification refusée",
        message: `Votre demande de vérification a été refusée. Motif: ${reason}. Vous pouvez soumettre de nouveaux documents.`,
        type: "error",
        link: "/profil",
      });

      // Trigger email notification via edge function
      try {
        await supabase.functions.invoke("kyc-notification", {
          body: { userId, status: "rejected", reason },
        });
      } catch {
        // Email notification is optional
      }

      toast({ title: "KYC rejeté", description: "L'utilisateur a été notifié." });
      fetchRequests();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    }
  };

  return {
    requests,
    stats,
    loading,
    approveKyc,
    rejectKyc,
    refresh: fetchRequests,
  };
};
