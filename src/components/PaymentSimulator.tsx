import { useState } from "react";
import { Smartphone, CheckCircle, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const paymentMethods = [
  { id: "mtn", name: "MTN Mobile Money", color: "#FFCC00", textColor: "#000" },
  { id: "moov", name: "Moov Africa", color: "#0066CC", textColor: "#FFF" },
  { id: "orange", name: "Orange Money", color: "#FF6600", textColor: "#FFF" },
  { id: "fedapay", name: "FedaPay", color: "#2D8B61", textColor: "#FFF" },
];

interface PaymentSimulatorProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  label: string;
}

const PaymentSimulator = ({ open, onClose, amount, label }: PaymentSimulatorProps) => {
  const [step, setStep] = useState<"method" | "details" | "processing" | "success">("method");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [phone, setPhone] = useState("");

  const formatPrice = (p: number) => new Intl.NumberFormat("fr-BJ").format(p) + " FCFA";

  const handlePay = () => {
    setStep("processing");
    setTimeout(() => setStep("success"), 2500);
  };

  const handleClose = () => {
    setStep("method");
    setSelectedMethod("");
    setPhone("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Paiement sécurisé ThusDev
          </DialogTitle>
        </DialogHeader>

        {step === "method" && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-display text-2xl font-bold text-foreground">{formatPrice(amount)}</p>
            </div>
            <p className="text-sm text-muted-foreground">Choisissez votre mode de paiement :</p>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMethod(m.id); setStep("details"); }}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${selectedMethod === m.id ? "border-primary" : "border-border"}`}
                  style={{ background: m.color + "15" }}
                >
                  <Smartphone className="h-6 w-6 mx-auto mb-2" style={{ color: m.color }} />
                  <p className="text-xs font-semibold text-foreground">{m.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">{label} via {paymentMethods.find(m => m.id === selectedMethod)?.name}</p>
              <p className="font-display text-xl font-bold text-foreground">{formatPrice(amount)}</p>
            </div>
            <div className="space-y-2">
              <Label>Numéro de téléphone</Label>
              <Input
                placeholder="+229 01 46 87 91 42 "
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep("method")}>Retour</Button>
              <Button className="flex-1 h-12" onClick={handlePay} disabled={!phone}>Payer {formatPrice(amount)}</Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
            <p className="font-display font-semibold text-foreground">Traitement en cours...</p>
            <p className="text-sm text-muted-foreground">Veuillez confirmer le paiement sur votre téléphone</p>
          </div>
        )}

        {step === "success" && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="font-display text-xl font-bold text-foreground">Paiement réussi !</p>
            <p className="text-sm text-muted-foreground">Transaction {selectedMethod.toUpperCase()}-{Date.now().toString(36).toUpperCase()}</p>
            <Button className="h-12 w-full" onClick={handleClose}>Fermer</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSimulator;
