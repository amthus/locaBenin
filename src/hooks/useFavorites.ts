import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("*, property:properties(*)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
  });
}

export function useIsFavorite(propertyId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is-favorite", propertyId, user?.id],
    enabled: !!user && !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user!.id)
        .eq("property_id", propertyId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error("Connectez-vous pour ajouter aux favoris");

      // Check if already favorited
      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const };
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, property_id: propertyId });
        if (error) throw error;
        return { action: "added" as const };
      }
    },
    onSuccess: (result, propertyId) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["is-favorite", propertyId] });
      toast({
        title: result.action === "added" ? "Ajouté aux favoris" : "Retiré des favoris",
        description: result.action === "added" ? "Bien sauvegardé dans vos favoris" : "Bien retiré de vos favoris",
      });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
}
