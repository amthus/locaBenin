import { useState } from "react";
import { Wrench, Plus, AlertTriangle, Clock, CheckCircle, Image, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "faible" | "normal" | "urgent";
  status: "en_attente" | "en_cours" | "résolu";
  createdAt: string;
  property: string;
}

const mockRequests: MaintenanceRequest[] = [
  { id: "1", title: "Fuite d'eau cuisine", description: "Le robinet de la cuisine fuit en permanence.", category: "Plomberie", priority: "urgent", status: "en_cours", createdAt: "2026-03-01", property: "Appartement Akpakpa" },
  { id: "2", title: "Prise électrique défectueuse", description: "La prise du salon ne fonctionne plus.", category: "Électricité", priority: "normal", status: "en_attente", createdAt: "2026-03-03", property: "Appartement Akpakpa" },
  { id: "3", title: "Serrure porte d'entrée", description: "La serrure est difficile à tourner.", category: "Serrurerie", priority: "faible", status: "résolu", createdAt: "2026-02-20", property: "Appartement Akpakpa" },
];

const statusConfig = {
  en_attente: { label: "En attente", icon: Clock, className: "bg-secondary text-secondary-foreground" },
  en_cours: { label: "En cours", icon: AlertTriangle, className: "bg-primary text-primary-foreground" },
  résolu: { label: "Résolu", icon: CheckCircle, className: "bg-muted text-muted-foreground" },
};

const priorityConfig = {
  faible: { label: "Faible", className: "text-muted-foreground" },
  normal: { label: "Normal", className: "text-secondary" },
  urgent: { label: "Urgent", className: "text-destructive" },
};

const MaintenancePage = () => {
  const [requests] = useState(mockRequests);
  const [showNew, setShowNew] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <Wrench className="h-8 w-8 text-primary" /> Suivi maintenance
              </h1>
              <p className="text-muted-foreground">Suivez vos demandes de réparation et incidents</p>
            </div>
            <Button onClick={() => setShowNew(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Nouvelle demande
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "En attente", count: requests.filter(r => r.status === "en_attente").length, color: "text-secondary" },
              { label: "En cours", count: requests.filter(r => r.status === "en_cours").length, color: "text-primary" },
              { label: "Résolus", count: requests.filter(r => r.status === "résolu").length, color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="bg-card p-5 rounded-lg shadow-card text-center">
                <p className={`font-display text-3xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {["all", "en_attente", "en_cours", "résolu"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Tous" : statusConfig[f as keyof typeof statusConfig].label}
              </Button>
            ))}
          </div>

          {/* Requests */}
          <div className="space-y-4">
            {filtered.map((r) => {
              const status = statusConfig[r.status];
              const priority = priorityConfig[r.priority];
              const StatusIcon = status.icon;

              return (
                <div key={r.id} className="bg-card p-5 rounded-lg shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display font-semibold text-foreground">{r.title}</h3>
                        <Badge className={status.className}>
                          <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                        </Badge>
                        <span className={`text-xs font-medium ${priority.className}`}>• {priority.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{r.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>📍 {r.property}</span>
                        <span>🔧 {r.category}</span>
                        <span>📅 {new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1">
                      <MessageCircle className="h-3.5 w-3.5" /> Suivi
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New request dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Nouvelle demande de maintenance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input placeholder="Ex: Fuite d'eau salle de bain" className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select>
                <SelectTrigger className="h-12"><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="plomberie">Plomberie</SelectItem>
                  <SelectItem value="electricite">Électricité</SelectItem>
                  <SelectItem value="serrurerie">Serrurerie</SelectItem>
                  <SelectItem value="peinture">Peinture</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priorité</Label>
              <Select>
                <SelectTrigger className="h-12"><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Décrivez le problème en détail..." rows={4} />
            </div>
            <Button className="w-full h-12" onClick={() => setShowNew(false)}>Soumettre la demande</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default MaintenancePage;
