import { useState } from "react";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VisitSchedulerProps {
  open: boolean;
  onClose: () => void;
  propertyTitle: string;
  ownerName: string;
}

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

const VisitScheduler = ({ open, onClose, propertyTitle, ownerName }: VisitSchedulerProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setDate("");
    setTime("");
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Planifier une visite
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <p className="font-display text-lg font-bold text-foreground">Demande envoyée !</p>
            <p className="text-sm text-muted-foreground">
              {ownerName} recevra votre demande de visite pour le {date} à {time}. Vous serez notifié de sa réponse.
            </p>
            <Button className="h-12 w-full" onClick={handleClose}>Fermer</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium text-foreground">{propertyTitle}</p>
              <p className="text-xs text-muted-foreground">Propriétaire : {ownerName}</p>
            </div>

            <div className="space-y-2">
              <Label>Date de visite</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12" min={new Date().toISOString().split("T")[0]} />
            </div>

            <div className="space-y-2">
              <Label>Créneau horaire</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`p-2 rounded-lg border text-sm font-medium transition-all ${time === slot ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    <Clock className="h-3 w-3 mx-auto mb-1" />
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message (optionnel)</Label>
              <Textarea placeholder="Présentez-vous ou posez des questions..." value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
            </div>

            <Button className="w-full h-12" onClick={handleSubmit} disabled={!date || !time}>
              Envoyer la demande
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VisitScheduler;
