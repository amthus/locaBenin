import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useReports } from "@/hooks/useReports";

interface ReportDialogProps {
  propertyId: string;
  propertyTitle: string;
  trigger?: React.ReactNode;
}

const REPORT_REASONS = [
  { value: "fraud", label: "Suspicion de fraude" },
  { value: "misleading_photos", label: "Photos trompeuses" },
  { value: "wrong_info", label: "Informations incorrectes" },
  { value: "already_rented", label: "Bien déjà loué" },
  { value: "inappropriate", label: "Contenu inapproprié" },
  { value: "other", label: "Autre" },
];

export default function ReportDialog({ propertyId, propertyTitle, trigger }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { createReport } = useReports();

  const handleSubmit = async () => {
    if (!reason) return;
    
    setSubmitting(true);
    const success = await createReport(propertyId, reason, description);
    setSubmitting(false);
    
    if (success) {
      setOpen(false);
      setReason("");
      setDescription("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Signaler
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Signaler cette annonce
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Signaler : <span className="font-medium text-foreground">{propertyTitle}</span>
          </p>

          <div className="space-y-3">
            <Label>Motif du signalement</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REPORT_REASONS.map(r => (
                <div key={r.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={r.value} id={r.value} />
                  <Label htmlFor={r.value} className="font-normal cursor-pointer">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Détails (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            variant="destructive"
          >
            {submitting ? "Envoi..." : "Envoyer le signalement"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
