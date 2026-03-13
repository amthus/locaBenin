import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, User, Home, Calendar, DollarSign, CheckCircle, 
  XCircle, Download, ExternalLink, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Contract {
  id: string;
  owner_id: string;
  tenant_id: string;
  property_id: string | null;
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
}

interface ContractDetails {
  owner?: { full_name: string; phone: string | null };
  tenant?: { full_name: string; phone: string | null };
  property?: { title: string; city: string; quartier: string | null };
}

interface AdminContractDialogProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminContractDialog({ contract, open, onOpenChange }: AdminContractDialogProps) {
  const [details, setDetails] = useState<ContractDetails>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && open) {
      loadDetails();
    }
  }, [contract, open]);

  const loadDetails = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      // Fetch owner profile
      const { data: owner } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", contract.owner_id)
        .single();

      // Fetch tenant profile
      const { data: tenant } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", contract.tenant_id)
        .single();

      // Fetch property if exists
      let property = null;
      if (contract.property_id) {
        const { data: prop } = await supabase
          .from("properties")
          .select("title, city, quartier")
          .eq("id", contract.property_id)
          .single();
        property = prop;
      }

      setDetails({ owner, tenant, property });
    } catch (err) {
      console.error("Error loading contract details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!contract) return null;

  const statusConfig = {
    active: { label: "Actif", className: "bg-primary/10 text-primary border-0" },
    pending: { label: "En attente", className: "bg-amber-100 text-amber-700 border-0" },
    completed: { label: "Terminé", className: "bg-muted text-muted-foreground border-0" },
    cancelled: { label: "Annulé", className: "bg-destructive/10 text-destructive border-0" },
  };

  const status = statusConfig[contract.status as keyof typeof statusConfig] || statusConfig.pending;

  const durationMonths = Math.round(
    (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Détail du contrat
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Status and ID */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Référence</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{contract.id}</code>
                </div>
                <Badge className={status.className}>{status.label}</Badge>
              </div>

              <Separator />

              {/* Property Info */}
              {details.property && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Home className="h-4 w-4" />
                    {details.property.title}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {details.property.city}{details.property.quartier ? `, ${details.property.quartier}` : ""}
                  </p>
                </div>
              )}

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Propriétaire</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{details.owner?.full_name || "—"}</span>
                  </div>
                  {details.owner?.phone && (
                    <p className="text-sm text-muted-foreground">{details.owner.phone}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    {contract.signed_by_owner ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Signé
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" /> Non signé
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Locataire</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-secondary" />
                    <span className="font-medium">{details.tenant?.full_name || "—"}</span>
                  </div>
                  {details.tenant?.phone && (
                    <p className="text-sm text-muted-foreground">{details.tenant.phone}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    {contract.signed_by_tenant ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" /> Signé
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <XCircle className="h-3 w-3 mr-1" /> Non signé
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Durée du bail</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Début</p>
                    <p className="font-medium">{format(new Date(contract.start_date), "dd MMMM yyyy", { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fin</p>
                    <p className="font-medium">{format(new Date(contract.end_date), "dd MMMM yyyy", { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Durée</p>
                    <p className="font-medium">{durationMonths} mois</p>
                  </div>
                </div>
              </div>

              {/* Financial */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-medium">Détails financiers</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Loyer mensuel</p>
                    <p className="text-xl font-bold text-foreground">{contract.monthly_rent.toLocaleString()} FCFA</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Caution</p>
                    <p className="text-xl font-bold text-foreground">{contract.deposit_amount.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total sur la durée du bail</p>
                  <p className="text-lg font-bold text-primary">
                    {(contract.monthly_rent * durationMonths + contract.deposit_amount).toLocaleString()} FCFA
                  </p>
                </div>
              </div>

              {/* Document */}
              {contract.document_url && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Document du contrat</p>
                      <p className="text-sm text-muted-foreground">PDF disponible</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={contract.document_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" /> Voir
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={contract.document_url} download>
                        <Download className="h-4 w-4 mr-2" /> Télécharger
                      </a>
                    </Button>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Créé le {format(new Date(contract.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
                <p>Mis à jour le {format(new Date(contract.updated_at), "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
