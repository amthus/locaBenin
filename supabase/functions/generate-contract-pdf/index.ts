import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-BJ").format(amount);
}

function numberToWords(n: number): string {
  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

  if (n === 0) return "zéro";
  if (n < 10) return units[n];
  if (n < 20) return teens[n - 10];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (t === 7 || t === 9) return tens[t - 1] + "-" + teens[u];
    return tens[t] + (u ? "-" + units[u] : "");
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const r = n % 100;
    const prefix = h === 1 ? "cent" : units[h] + " cent";
    return prefix + (r ? " " + numberToWords(r) : "");
  }
  if (n < 1000000) {
    const th = Math.floor(n / 1000);
    const r = n % 1000;
    const prefix = th === 1 ? "mille" : numberToWords(th) + " mille";
    return prefix + (r ? " " + numberToWords(r) : "");
  }
  return String(n);
}

function generateContractHTML(contract: any, ownerProfile: any, tenantProfile: any, property: any): string {
  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const rentWords = numberToWords(contract.monthly_rent);
  const depositWords = numberToWords(contract.deposit_amount);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 2cm; size: A4; }
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; }
  h1 { text-align: center; font-size: 18pt; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
  h2 { font-size: 14pt; margin-top: 25px; border-bottom: 1px solid #333; padding-bottom: 4px; }
  .subtitle { text-align: center; font-size: 11pt; color: #555; margin-bottom: 30px; }
  .header-line { border-top: 3px double #333; border-bottom: 3px double #333; padding: 10px 0; margin: 20px 0; }
  .parties { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #2d6a4f; }
  .article { margin: 10px 0; }
  .signature-block { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
  .signature-box { width: 45%; border-top: 1px solid #333; padding-top: 10px; text-align: center; min-height: 80px; }
  .footer-legal { font-size: 9pt; color: #777; text-align: center; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; }
  .stamp { display: inline-block; border: 2px solid #2d6a4f; padding: 5px 15px; color: #2d6a4f; font-weight: bold; transform: rotate(-5deg); margin: 5px; }
</style>
</head>
<body>
<div class="header-line">
<h1>Contrat de Bail d'Habitation</h1>
<p class="subtitle">Conforme à la loi n° 2018-12 portant régime juridique du bail à usage d'habitation en République du Bénin</p>
</div>

<h2>Entre les soussignés</h2>
<div class="parties">
<p><strong>LE BAILLEUR :</strong> ${ownerProfile?.full_name || "Non renseigné"}, ci-après dénommé(e) « le Bailleur »</p>
<p>Téléphone : ${ownerProfile?.phone || "Non renseigné"}</p>
</div>
<div class="parties">
<p><strong>LE LOCATAIRE :</strong> ${tenantProfile?.full_name || "Non renseigné"}, ci-après dénommé(e) « le Locataire »</p>
<p>Téléphone : ${tenantProfile?.phone || "Non renseigné"}</p>
</div>

<p><em>Il a été convenu et arrêté ce qui suit :</em></p>

<h2>Article 1 — Objet du contrat</h2>
<div class="article">
<p>Le Bailleur donne en location au Locataire, qui accepte, le bien immobilier suivant :</p>
<p><strong>Désignation :</strong> ${property?.title || "Logement"}</p>
<p><strong>Adresse :</strong> ${property?.quartier || ""}, ${property?.city || "Cotonou"}, Bénin</p>
<p><strong>Type :</strong> ${property?.type || "Appartement"} — ${property?.bedrooms || 1} chambre(s), ${property?.bathrooms || 1} salle(s) de bain, ${property?.area || "N/A"} m²</p>
</div>

<h2>Article 2 — Durée du bail</h2>
<div class="article">
<p>Le présent bail est consenti pour une durée déterminée allant du <strong>${formatDate(contract.start_date)}</strong> au <strong>${formatDate(contract.end_date)}</strong>.</p>
<p>Conformément à la loi, le bail est renouvelable par tacite reconduction sauf congé donné par l'une des parties avec un préavis de trois (3) mois.</p>
</div>

<h2>Article 3 — Loyer</h2>
<div class="article">
<p>Le loyer mensuel est fixé à la somme de <strong>${formatCurrency(contract.monthly_rent)} FCFA</strong> (${rentWords} francs CFA), payable d'avance au plus tard le cinq (5) de chaque mois.</p>
</div>

<h2>Article 4 — Dépôt de garantie (Caution)</h2>
<div class="article">
<p>Le Locataire verse au Bailleur, à la signature du présent contrat, un dépôt de garantie de <strong>${formatCurrency(contract.deposit_amount)} FCFA</strong> (${depositWords} francs CFA).</p>
<p>Ce dépôt sera restitué au Locataire dans un délai maximum de deux (2) mois après la restitution des clés, déduction faite des éventuelles réparations locatives.</p>
</div>

<h2>Article 5 — Obligations du Bailleur</h2>
<div class="article">
<p>Le Bailleur s'engage à :</p>
<ul>
<li>Remettre au Locataire un logement décent et en bon état</li>
<li>Assurer la jouissance paisible du logement</li>
<li>Effectuer les réparations nécessaires autres que locatives</li>
<li>Délivrer les quittances de loyer</li>
</ul>
</div>

<h2>Article 6 — Obligations du Locataire</h2>
<div class="article">
<p>Le Locataire s'engage à :</p>
<ul>
<li>Payer le loyer et les charges aux termes convenus</li>
<li>User paisiblement des lieux loués</li>
<li>Répondre des dégradations survenant pendant la durée du bail</li>
<li>Ne pas sous-louer sans l'accord écrit du Bailleur</li>
<li>Restituer le logement en bon état en fin de bail</li>
</ul>
</div>

<h2>Article 7 — Résiliation</h2>
<div class="article">
<p>Le présent bail pourra être résilié de plein droit en cas de manquement par l'une des parties à ses obligations, après mise en demeure restée infructueuse pendant trente (30) jours.</p>
</div>

<h2>Article 8 — Élection de domicile</h2>
<div class="article">
<p>Pour l'exécution des présentes, les parties élisent domicile en leurs adresses respectives ci-dessus indiquées. Tout litige sera soumis aux tribunaux compétents de Cotonou.</p>
</div>

<p style="margin-top: 30px;">Fait à Cotonou, le ${today}, en deux exemplaires originaux.</p>

<div class="signature-block">
<div class="signature-box">
<p><strong>Le Bailleur</strong></p>
<p>${ownerProfile?.full_name || ""}</p>
${contract.signed_by_owner ? '<p class="stamp">✓ SIGNÉ ÉLECTRONIQUEMENT</p>' : '<p style="color:#999;">En attente de signature</p>'}
</div>
<div class="signature-box">
<p><strong>Le Locataire</strong></p>
<p>${tenantProfile?.full_name || ""}</p>
${contract.signed_by_tenant ? '<p class="stamp">✓ SIGNÉ ÉLECTRONIQUEMENT</p>' : '<p style="color:#999;">En attente de signature</p>'}
</div>
</div>

<p class="footer-legal">
Document généré électroniquement sur la plateforme LoKaBénin — Valeur juridique conforme à la loi n° 2017-20 du 20 avril 2018 portant code du numérique en République du Bénin.<br/>
Référence du contrat : ${contract.id}
</p>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Non autorisé");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Non autorisé");

    const { contractId } = await req.json();
    if (!contractId) throw new Error("contractId requis");

    // Fetch contract
    const { data: contract, error: cErr } = await supabase
      .from("contracts")
      .select("*")
      .eq("id", contractId)
      .single();
    if (cErr || !contract) throw new Error("Contrat introuvable");

    // Check user is participant
    if (contract.owner_id !== user.id && contract.tenant_id !== user.id) {
      throw new Error("Accès refusé");
    }

    // Fetch profiles
    const [{ data: ownerProfile }, { data: tenantProfile }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", contract.owner_id).single(),
      supabase.from("profiles").select("*").eq("user_id", contract.tenant_id).single(),
    ]);

    // Fetch property if linked
    let property = null;
    if (contract.property_id) {
      const { data } = await supabase.from("properties").select("*").eq("id", contract.property_id).single();
      property = data;
    }

    const html = generateContractHTML(contract, ownerProfile, tenantProfile, property);

    return new Response(JSON.stringify({ html, contract }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
