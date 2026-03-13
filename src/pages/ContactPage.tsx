import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Contactez-nous</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Une question, une suggestion ou un partenariat ? Nous sommes à votre écoute.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact info */}
            <div className="space-y-6">
              {[
                { icon: MapPin, title: "Adresse", lines: ["Quartier Ganhi", "Cotonou, Bénin"] },
                { icon: Phone, title: "Téléphone", lines: ["+229 97 00 00 00", "+229 96 00 00 00"] },
                { icon: Mail, title: "Email", lines: ["contact@locabenin.com", "support@locabenin.com"] },
                { icon: Clock, title: "Horaires", lines: ["Lun - Ven : 8h - 18h", "Sam : 9h - 13h"] },
              ].map((c) => (
                <div key={c.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    {c.lines.map((l) => (
                      <p key={l} className="text-sm text-muted-foreground">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow-card">
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">Envoyez-nous un message</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input id="name" placeholder="Votre nom" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="nom@exemple.com" className="h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Sujet</Label>
                  <Select>
                    <SelectTrigger className="h-12"><SelectValue placeholder="Choisir un sujet" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">Question générale</SelectItem>
                      <SelectItem value="support">Support technique</SelectItem>
                      <SelectItem value="partenariat">Partenariat</SelectItem>
                      <SelectItem value="signalement">Signalement d'abus</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Détaillez votre demande..." rows={5} />
                </div>

                <Button className="w-full h-12">
                  <Send className="h-4 w-4 mr-2" /> Envoyer le message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
