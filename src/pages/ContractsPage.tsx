import { useState } from "react";
import { FileText, Download, Eye, CheckCircle, Clock, AlertTriangle, PenTool, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CreateContractDialog from "@/components/CreateContractDialog";
import { useContracts, useSignContract, useGenerateContractPDF, type Contract } from "@/hooks/useContracts";
import { useAuth } from "@/contexts/AuthContext";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  active: { label: "Actif", icon: CheckCircle, className: "bg-primary text-primary-foreground" },
  completed: { label: "Terminé", icon: Clock, className: "bg-muted text-muted-foreground" },
  pending: { label: "En attente de signature", icon: AlertTriangle, className: "bg-secondary text-secondary-foreground" },
  cancelled: { label: "Annulé", icon: X, className: "bg-destructive/10 text-destructive" },
};

const ContractsPage = () => {
  const { user } = useAuth();
  const { data: contracts = [], isLoading } = useContracts();
  const signContract = useSignContract();
  const generatePDF = useGenerateContractPDF();
  const [previewHTML, setPreviewHTML] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreview = async (contractId: string) => {
    const html = await generatePDF.mutateAsync(contractId);
    setPreviewHTML(html);
    setPreviewOpen(true);
  };

  const handleDownload = async (contractId: string) => {
    const html = await generatePDF.mutateAsync(contractId);
    // Open in new window for printing/PDF save
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const canSign = (c: Contract) => {
    if (!user) return false;
    if (c.status !== "pending") return false;
    if (user.id === c.owner_id && !c.signed_by_owner) return true;
    if (user.id === c.tenant_id && !c.signed_by_tenant) return true;
    return false;
  };

  const getSignatureStatus = (c: Contract) => {
    const parts: string[] = [];
    if (c.signed_by_owner) parts.push("Bailleur ✓");
    else parts.push("Bailleur ✗");
    if (c.signed_by_tenant) parts.push("Locataire ✓");
    else parts.push("Locataire ✗");
    return parts.join(" · ");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Mes contrats</h1>
              <p className="text-muted-foreground">Gérez vos contrats de location digitaux</p>
            </div>
            {user?.role === "proprietaire" && <CreateContractDialog />}
          </div>

          {/* Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3 mb-8">
            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Contrats conformes à la loi béninoise</p>
              <p className="text-sm text-muted-foreground">
                Tous les contrats sont générés conformément à la législation en vigueur (loi n° 2018-12). Signature électronique sécurisée et valeur juridique (loi n° 2017-20 portant code du numérique).
              </p>
            </div>
          </div>

          {/* Contracts list */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : contracts.length === 0 ? (
            <div className="bg-card p-12 rounded-lg shadow-card text-center">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">Aucun contrat</p>
              <p className="text-muted-foreground mb-4">
                {user?.role === "proprietaire"
                  ? "Créez votre premier contrat de bail digital."
                  : "Vous n'avez pas encore de contrat. Votre propriétaire vous en enverra un."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((c) => {
                const status = statusConfig[c.status || "pending"] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div key={c.id} className="bg-card p-6 rounded-lg shadow-card">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-display font-semibold text-foreground">
                            {c.property_title || "Contrat de bail"}
                          </h3>
                          <Badge className={status.className}>
                            <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          <span className="font-medium text-foreground">Bailleur :</span> {c.owner_name || "—"} ·{" "}
                          <span className="font-medium text-foreground">Locataire :</span> {c.tenant_name || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <PenTool className="h-3 w-3" /> Signatures : {getSignatureStatus(c)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Début</p>
                            <p className="font-medium text-foreground">{new Date(c.start_date).toLocaleDateString("fr-FR")}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fin</p>
                            <p className="font-medium text-foreground">{new Date(c.end_date).toLocaleDateString("fr-FR")}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Loyer</p>
                            <p className="font-medium text-foreground">{new Intl.NumberFormat("fr-BJ").format(c.monthly_rent)} FCFA</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Caution</p>
                            <p className="font-medium text-foreground">{new Intl.NumberFormat("fr-BJ").format(c.deposit_amount)} FCFA</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(c.id)}
                          disabled={generatePDF.isPending}
                        >
                          {generatePDF.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4 mr-1" />}
                          Voir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(c.id)}
                          disabled={generatePDF.isPending}
                        >
                          <Download className="h-4 w-4 mr-1" /> PDF
                        </Button>
                        {canSign(c) && (
                          <Button
                            size="sm"
                            onClick={() => signContract.mutate(c.id)}
                            disabled={signContract.isPending}
                          >
                            {signContract.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <PenTool className="h-4 w-4 mr-1" />
                            )}
                            Signer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PDF Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu du contrat</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[75vh] border rounded-lg">
            {previewHTML && (
              <iframe
                srcDoc={previewHTML}
                className="w-full min-h-[70vh] border-0"
                title="Aperçu contrat"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default ContractsPage;
