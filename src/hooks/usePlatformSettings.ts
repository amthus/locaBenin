import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SettingData } from "@/components/SettingDialog";

export function usePlatformSettings() {
  const [settings, setSettings] = useState<SettingData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("platform_settings").select("*").order("key");
      if (error) throw error;
      setSettings(data || []);
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSetting = async (setting: SettingData) => {
    try {
      if (setting.id) {
        const { error } = await supabase
          .from("platform_settings")
          .update({ value: setting.value, description: setting.description, updated_by: user?.id })
          .eq("id", setting.id);
        if (error) throw error;
        toast({ title: "Paramètre mis à jour" });
      } else {
        const { error } = await supabase
          .from("platform_settings")
          .insert([{ key: setting.key, value: setting.value, description: setting.description, updated_by: user?.id }]);
        if (error) throw error;
        toast({ title: "Paramètre ajouté" });
      }
      await fetchSettings();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const deleteSetting = async (id: string) => {
    try {
      const { error } = await supabase.from("platform_settings").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Paramètre supprimé" });
      await fetchSettings();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    }
  };

  return { settings, loading, saveSetting, deleteSetting, refresh: fetchSettings };
}