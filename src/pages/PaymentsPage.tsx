import { useState } from "react";
import {
  DollarSign, Download, Eye, CheckCircle, Clock, Loader2, CreditCard, Receipt, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { usePayments, useRecordPayment, generateReceiptHTML, getMonthName, type Payment } from "@/hooks/usePayments";
import { useContracts } from "@/hooks/useContracts";
import { useAuth } from "@/contexts/AuthContext";

const PaymentsPage = () => {
  const { user } = useAuth();
  const { data: payments = [], isLoading } = usePayments();
  const { data: contracts = [] } = useContracts();
  const recordPayment = useRecordPayment();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptHTML, setReceiptHTML] = useState("");
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    contract_id: "",
    period_month: String(new Date().getMonth() + 1),
    period_year: String(new Date().getFullYear()),
    payment_method: "mobile_money",
  });

  const activeContracts = contracts.filter((c) => c.status === "active");

  const handleViewReceipt = (payment: Payment) => {
    setReceiptHTML(generateReceiptHTML(payment));
    setReceiptOpen(true);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    const html = generateReceiptHTML(payment);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const contract = activeContracts.find((c) => c.id === payForm.contract_id);
    if (!contract || !user) return;

    await recordPayment.mutateAsync({
      contract_id: contract.id,
      tenant_id: user.id,
      owner_id: contract.owner_id,
      amount: contract.monthly_rent,
      period_month: Number(payForm.period_month),
      period_year: Number(payForm.period_year),
      payment_method: payForm.payment_method,
    });
    setPayDialogOpen(false);
  };

  // Calculate stats
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const thisYear = payments.filter((p) => p.period_year === new Date().getFullYear());
  const paidThisYear = thisYear.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Paiements</h1>
              <p className="text-muted-foreground">Historique et gestion de vos paiements de loyer</p>
            </div>
            {user?.role === "locataire" && activeContracts.length > 0 && (
              <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
                <DialogTrigger asChild>
                  <Button><CreditCard className="h-4 w-4 mr-2" /> Payer le loyer</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
                  <form onSubmit={handlePay} className="space-y-4">
                    <div>
                      <Label>Contrat</Label>
                      <Select value={payForm.contract_id} onValueChange={(v) => setPayForm({ ...payForm, contract_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner un contrat" /></SelectTrigger>
                        <SelectContent>
                          {activeContracts.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.property_title || "Contrat"} — {new Intl.NumberFormat("fr-BJ").format(c.monthly_rent)} FCFA/mois
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Mois</Label>
                        <Select value={payForm.period_month} onValueChange={(v) => setPayForm({ ...payForm, period_month: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>{getMonthName(i + 1)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Année</Label>
                        <Input type="number" value={payForm.period_year} onChange={(e) => setPayForm({ ...payForm, period_year: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Mode de paiement</Label>
                      <Select value={payForm.payment_method} onValueChange={(v) => setPayForm({ ...payForm, payment_method: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile_money">Mobile Money (MTN/Moov)</SelectItem>
                          <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                          <SelectItem value="cash">Espèces</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {payForm.contract_id && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">Montant à payer</p>
                        <p className="text-2xl font-bold text-primary">
                          {new Intl.NumberFormat("fr-BJ").format(activeContracts.find((c) => c.id === payForm.contract_id)?.monthly_rent || 0)} FCFA
                        </p>
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={recordPayment.isPending || !payForm.contract_id}>
                      {recordPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Confirmer le paiement
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-card p-5 rounded-lg shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{new Intl.NumberFormat("fr-BJ").format(totalPaid)} FCFA</p>
              <p className="text-sm text-muted-foreground">Total payé</p>
            </div>
            <div className="bg-card p-5 rounded-lg shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{new Intl.NumberFormat("fr-BJ").format(paidThisYear)} FCFA</p>
              <p className="text-sm text-muted-foreground">Payé en {new Date().getFullYear()}</p>
            </div>
            <div className="bg-card p-5 rounded-lg shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{payments.length}</p>
              <p className="text-sm text-muted-foreground">Quittances</p>
            </div>
          </div>

          {/* Payment History */}
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : payments.length === 0 ? (
            <div className="bg-card p-12 rounded-lg shadow-card text-center">
              <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">Aucun paiement</p>
              <p className="text-muted-foreground">L'historique de vos paiements apparaîtra ici.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">Historique des paiements</h2>
              {payments.map((p) => (
                <div key={p.id} className="bg-card p-5 rounded-lg shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-foreground">
                        {getMonthName(p.period_month)} {p.period_year}
                      </h3>
                      <Badge className="bg-primary/10 text-primary">
                        <CheckCircle className="h-3 w-3 mr-1" /> Payé
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {p.property_title || "Contrat"} · Réf: {p.reference || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(p.payment_date).toLocaleDateString("fr-FR")} · {p.payment_method === "mobile_money" ? "Mobile Money" : p.payment_method === "bank_transfer" ? "Virement" : p.payment_method || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-display text-xl font-bold text-primary">
                      {new Intl.NumberFormat("fr-BJ").format(p.amount)} FCFA
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewReceipt(p)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(p)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Preview */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader><DialogTitle>Quittance de loyer</DialogTitle></DialogHeader>
          <div className="overflow-auto max-h-[75vh] border rounded-lg">
            <iframe srcDoc={receiptHTML} className="w-full min-h-[60vh] border-0" title="Quittance" />
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PaymentsPage;
