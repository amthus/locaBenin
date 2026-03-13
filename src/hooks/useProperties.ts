import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UiProperty {
  id: string;
  title: string;
  type: "appartement" | "maison" | "studio" | "villa";
  price: number;
  deposit: number;
  location: string;
  quartier: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images: string[];
  verified: boolean;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  floodRisk: "faible" | "moyen" | "élevé";
  noiseLevel: "calme" | "modéré" | "bruyant";
  ownerName: string;
  ownerPhone: string;
  availableFrom: string;
  ownerId?: string;
  isPublished?: boolean;
  viewCount?: number;
}

function toUi(p: any, ownerName = "Propriétaire", ownerPhone = ""): UiProperty {
  return {
    id: p.id,
    title: p.title,
    type: p.type as any,
    price: p.price,
    deposit: p.deposit,
    location: p.city,
    quartier: p.quartier || "",
    bedrooms: p.bedrooms || 1,
    bathrooms: p.bathrooms || 1,
    area: p.area || 0,
    image: p.images?.[0] || "/placeholder.svg",
    images: p.images?.length ? p.images : ["/placeholder.svg"],
    verified: p.is_verified || false,
    rating: Number(p.rating) || 0,
    reviews: p.review_count || 0,
    description: p.description || "",
    features: p.features || [],
    floodRisk: (p.flood_risk || "faible") as any,
    noiseLevel: (p.noise_level || "calme") as any,
    ownerName,
    ownerPhone,
    availableFrom: p.available_from || new Date().toISOString().split("T")[0],
    ownerId: p.owner_id,
    isPublished: p.is_published,
    viewCount: p.view_count || 0,
  };
}

async function enrichWithOwners(rows: any[]): Promise<UiProperty[]> {
  if (!rows.length) return [];
  const ownerIds = [...new Set(rows.map((r) => r.owner_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name, phone")
    .in("user_id", ownerIds);

  const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
  return rows.map((r) => {
    const prof = profileMap.get(r.owner_id);
    return toUi(r, prof?.full_name || "Propriétaire", prof?.phone || "");
  });
}

export function useProperties(filters?: { type?: string; maxPrice?: string; city?: string; search?: string }) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (filters?.type && filters.type !== "all") query = query.eq("type", filters.type);
      if (filters?.maxPrice && filters.maxPrice !== "all") query = query.lte("price", Number(filters.maxPrice));
      if (filters?.city && filters.city !== "all") query = query.eq("city", filters.city);
      if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,quartier.ilike.%${filters.search}%`);

      const { data, error } = await query;
      if (error) throw error;
      return enrichWithOwners(data || []);
    },
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ["property", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id!).single();
      if (error) throw error;
      const results = await enrichWithOwners([data]);
      return results[0];
    },
  });
}

export function useMyProperties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-properties", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return enrichWithOwners(data || []);
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (property: {
      title: string;
      type: string;
      price: number;
      deposit: number;
      area?: number;
      bedrooms?: number;
      bathrooms?: number;
      city: string;
      quartier?: string;
      description?: string;
      flood_risk?: string;
      noise_level?: string;
      features?: string[];
      images?: string[];
      available_from?: string;
    }) => {
      if (!user) throw new Error("Non authentifié");
      const { data, error } = await supabase
        .from("properties")
        .insert({ ...property, owner_id: user.id, is_published: true })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      toast({ title: "Annonce publiée !", description: "Votre annonce est maintenant visible." });
    },
    onError: (err: any) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
}

export function useUploadPropertyImages() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (files: File[]) => {
      if (!user) throw new Error("Non authentifié");
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("property-images").upload(path, file, { upsert: true });
        if (error) throw error;
        const { data } = supabase.storage.from("property-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      return urls;
    },
  });
}
