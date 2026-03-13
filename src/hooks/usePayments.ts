import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Payment {
  id: string;
  contract_id: string;
  tenant_id: string;
  owner_id: string;
  amount: number;
  payment_date: string;
  period_month: number;
  period_year: number;
  payment_method: string | null;
  reference: string | null;
  status: string | null;
  created_at: string;
  // joined
  property_title?: string;
  owner_name?: string;
  tenant_name?: string;
}

const MONTH_NAMES = ["", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export function getMonthName(month: number) {
  return MONTH_NAMES[month] || "";
}

export function usePayments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["payments", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      const userIds = new Set<string>();
      const contractIds = new Set<string>();
      data.forEach((p) => {
        userIds.add(p.owner_id);
        userIds.add(p.tenant_id);
        contractIds.add(p.contract_id);
      });

      const [{ data: profiles }, { data: contracts }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", Array.from(userIds)),
        supabase.from("contracts").select("id, property_id").in("id", Array.from(contractIds)),
      ]);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));

      // Get property titles
      const propertyIds = new Set((contracts || []).filter((c) => c.property_id).map((c) => c.property_id!));
      let propertyMap = new Map<string, string>();
      if (propertyIds.size > 0) {
        const { data: properties } = await supabase.from("properties").select("id, title").in("id", Array.from(propertyIds));
        propertyMap = new Map((properties || []).map((p) => [p.id, p.title]));
      }
      const contractPropertyMap = new Map((contracts || []).map((c) => [c.id, c.property_id ? propertyMap.get(c.property_id) : undefined]));

      return data.map((p) => ({
        ...p,
        owner_name: profileMap.get(p.owner_id) || "",
        tenant_name: profileMap.get(p.tenant_id) || "",
        property_title: contractPropertyMap.get(p.contract_id) || undefined,
      }));
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: {
      contract_id: string;
      tenant_id: string;
      owner_id: string;
      amount: number;
      period_month: number;
      period_year: number;
      payment_method: string;
    }) => {
      const reference = `PAY-${Date.now().toString(36).toUpperCase()}`;
      const { error } = await supabase.from("payments").insert({
        ...input,
        reference,
        status: "completed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({ title: "Paiement enregistré ✓", description: "Votre quittance est disponible." });
    },
    onError: (err: Error) => {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    },
  });
}

export function generateReceiptHTML(payment: Payment): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8">
<style>
  body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 40px; }
  .header { text-align: center; border-bottom: 3px double #2d6a4f; padding-bottom: 20px; margin-bottom: 30px; }
  h1 { color: #2d6a4f; font-size: 24pt; margin: 0; }
  .ref { color: #666; font-size: 10pt; }
  .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #ddd; }
  .field-label { color: #666; }
  .field-value { font-weight: bold; }
  .amount-box { background: #f0f7f4; border: 2px solid #2d6a4f; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
  .amount { font-size: 28pt; color: #2d6a4f; font-weight: bold; }
  .stamp { display: inline-block; border: 3px solid #2d6a4f; padding: 8px 20px; color: #2d6a4f; font-weight: bold; transform: rotate(-5deg); font-size: 14pt; margin-top: 20px; }
  .footer { text-align: center; color: #999; font-size: 9pt; margin-top: 40px; border-top: 1px solid #eee; padding-top: 15px; }
</style>
</head>
<body>
<div class="header">
  <h1>QUITTANCE DE LOYER</h1>
  <p class="ref">Référence : ${payment.reference || "N/A"}</p>
</div>

<div class="field"><span class="field-label">Bailleur</span><span class="field-value">${payment.owner_name || "—"}</span></div>
<div class="field"><span class="field-label">Locataire</span><span class="field-value">${payment.tenant_name || "—"}</span></div>
<div class="field"><span class="field-label">Bien</span><span class="field-value">${payment.property_title || "—"}</span></div>
<div class="field"><span class="field-label">Période</span><span class="field-value">${getMonthName(payment.period_month)} ${payment.period_year}</span></div>
<div class="field"><span class="field-label">Date de paiement</span><span class="field-value">${new Date(payment.payment_date).toLocaleDateString("fr-FR")}</span></div>
<div class="field"><span class="field-label">Mode de paiement</span><span class="field-value">${payment.payment_method === "mobile_money" ? "Mobile Money" : payment.payment_method === "bank_transfer" ? "Virement bancaire" : payment.payment_method || "—"}</span></div>

<div class="amount-box">
  <p style="margin:0; color:#666;">Montant payé</p>
  <p class="amount">${new Intl.NumberFormat("fr-BJ").format(payment.amount)} FCFA</p>
</div>

<div style="text-align: center;">
  <p>Le bailleur soussigné reconnaît avoir reçu du locataire ci-dessus désigné la somme mentionnée en paiement du loyer du mois indiqué et en donne quittance, sous réserve de tous droits.</p>
  <div class="stamp">PAYÉ ✓</div>
</div>

<p class="footer">
  Document généré électroniquement sur la plateforme LoKaBénin.<br/>
  Valeur juridique conforme à la loi n° 2017-20 portant code du numérique en République du Bénin.
</p>
</body>
</html>`;
}
