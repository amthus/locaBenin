import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Contract {
  id: string;
  property_id: string | null;
  tenant_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit_amount: number;
  status: string | null;
  signed_by_owner: boolean | null;
  signed_by_tenant: boolean | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
  // joined
  property_title?: string;
  property_city?: string;
  owner_name?: string;
  tenant_name?: string;
}

export function useContracts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contracts", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Contract[]> => {
      // Fetch contracts where user is owner or tenant
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Gather unique user ids and property ids
      const userIds = new Set<string>();
      const propertyIds = new Set<string>();
      data.forEach((c) => {
        userIds.add(c.owner_id);
        userIds.add(c.tenant_id);
        if (c.property_id) propertyIds.add(c.property_id);
      });

      // Fetch profiles and properties in parallel
      const [{ data: profiles }, { data: properties }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", Array.from(userIds)),
        propertyIds.size > 0
          ? supabase.from("properties").select("id, title, city").in("id", Array.from(propertyIds))
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));
      const propertyMap = new Map((properties || []).map((p) => [p.id, p]));

      return data.map((c) => ({
        ...c,
        owner_name: profileMap.get(c.owner_id) || "",
        tenant_name: profileMap.get(c.tenant_id) || "",
        property_title: c.property_id ? propertyMap.get(c.property_id)?.title : undefined,
        property_city: c.property_id ? propertyMap.get(c.property_id)?.city : undefined,
      }));
    },
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: {
      property_id?: string;
      tenant_id: string;
      owner_id: string;
      start_date: string;
      end_date: string;
      monthly_rent: number;
      deposit_amount: number;
    }) => {
      const { error } = await supabase.from("contracts").insert({
        property_id: input.property_id || null,
        tenant_id: input.tenant_id,
        owner_id: input.owner_id,
        start_date: input.start_date,
        end_date: input.end_date,
        monthly_rent: input.monthly_rent,
        deposit_amount: input.deposit_amount,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contrat créé", description: "Le contrat a été envoyé pour signature." });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contractId: string) => {
      if (!user) throw new Error("Non connecté");

      // Determine which field to update
      const { data: contract } = await supabase
        .from("contracts")
        .select("owner_id, tenant_id, signed_by_owner, signed_by_tenant")
        .eq("id", contractId)
        .single();

      if (!contract) throw new Error("Contrat introuvable");

      const isOwner = contract.owner_id === user.id;
      const isTenant = contract.tenant_id === user.id;
      if (!isOwner && !isTenant) throw new Error("Accès refusé");

      const updateFields: Record<string, any> = {};
      if (isOwner) updateFields.signed_by_owner = true;
      if (isTenant) updateFields.signed_by_tenant = true;

      // If both will have signed, mark as active
      const bothSigned =
        (isOwner && contract.signed_by_tenant) ||
        (isTenant && contract.signed_by_owner) ||
        (isOwner && isTenant);
      if (bothSigned) updateFields.status = "active";

      const { error } = await supabase.from("contracts").update(updateFields).eq("id", contractId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast({ title: "Contrat signé !", description: "Votre signature électronique a été enregistrée." });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
}

export function useGenerateContractPDF() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contractId: string): Promise<string> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non connecté");

      const res = await supabase.functions.invoke("generate-contract-pdf", {
        body: { contractId },
      });

      if (res.error) throw new Error(res.error.message || "Erreur de génération");
      return res.data.html;
    },
    onError: (err: Error) => {
      toast({ title: "Erreur PDF", description: err.message, variant: "destructive" });
    },
  });
}
