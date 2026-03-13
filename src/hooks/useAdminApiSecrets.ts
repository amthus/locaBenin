import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface ApiSecret {
  id: string;
  key_name: string;
  key_value: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useAdminApiSecrets = () => {
  const { user } = useAuth();
  const [secrets, setSecrets] = useState<ApiSecret[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecrets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("admin_api_secrets" as any)
        .select("*")
        .order("key_name", { ascending: true });

      if (error) throw error;
      setSecrets((data || []) as unknown as ApiSecret[]);
    } catch (err) {
      console.error("Error fetching API secrets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const createSecret = async (data: { key_name: string; key_value: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from("admin_api_secrets" as any)
        .insert({
          key_name: data.key_name,
          key_value: data.key_value,
          description: data.description || null,
          created_by: user?.id,
        } as any);

      if (error) throw error;

      toast({ title: "Clé API créée", description: `La clé "${data.key_name}" a été ajoutée.` });
      fetchSecrets();
      return true;
    } catch (err: any) {
      if (err.code === "23505") {
        toast({ title: "Erreur", description: "Une clé avec ce nom existe déjà.", variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      }
      return false;
    }
  };

  const updateSecret = async (id: string, data: { key_name?: string; key_value?: string; description?: string; is_active?: boolean }) => {
    try {
      const { error } = await supabase
        .from("admin_api_secrets" as any)
        .update(data as any)
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Clé API mise à jour" });
      fetchSecrets();
      return true;
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
      return false;
    }
  };

  const deleteSecret = async (id: string, keyName: string) => {
    try {
      const { error } = await supabase
        .from("admin_api_secrets" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Clé API supprimée", description: `La clé "${keyName}" a été supprimée.` });
      fetchSecrets();
      return true;
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
      return false;
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateSecret(id, { is_active: isActive });
  };

  return {
    secrets,
    loading,
    createSecret,
    updateSecret,
    deleteSecret,
    toggleActive,
    refresh: fetchSecrets,
  };
};
