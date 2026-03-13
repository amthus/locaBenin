import { Scale, FileText, Calculator, BookOpen, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqItems = [
  {
    q: "Quel est le montant maximum de la commission d'agence ?",
    a: "Selon la loi béninoise, la commission d'agence ne peut excéder 50% du loyer mensuel. Toute commission supérieure est illégale. Chez LOCABENIN, nous plafonnons nos frais entre 3% et 7%.",
  },
  {
    q: "Comment fonctionne la caution ?",
    a: "La caution est généralement égale à 1 à 3 mois de loyer. Elle doit être restituée dans un délai d'un mois après l'état des lieux de sortie, déduction faite des éventuelles réparations. Avec LOCABENIN, votre caution est sécurisée sur un compte séquestre.",
  },
  {
    q: "Quels sont mes droits en tant que locataire ?",
    a: "Le locataire a droit à un logement décent, au respect de sa vie privée, à la délivrance de quittances de loyer, et à un préavis de 3 mois en cas de résiliation par le propriétaire. Le propriétaire ne peut entrer dans le logement sans votre accord.",
  },
  {
    q: "Le contrat de bail est-il obligatoire ?",
    a: "Oui, un contrat de bail écrit est fortement recommandé et protège les deux parties. Il doit mentionner : le montant du loyer, la durée, les charges, la caution, et les conditions de résiliation.",
  },
  {
    q: "Que faire en cas de litige avec le propriétaire ?",
    a: "En cas de litige, vous pouvez : 1) Tenter une résolution à l'amiable, 2) Saisir le tribunal de première instance, 3) Faire appel à un médiateur. LOCABENIN propose un service de médiation intégré.",
  },
  {
    q: "Le propriétaire peut-il augmenter le loyer en cours de bail ?",
    a: "Non, le loyer ne peut être augmenté qu'à l'expiration du bail et selon les conditions prévues au contrat. Toute augmentation doit être notifiée au moins 3 mois à l'avance.",
  },
];

const LegalPage = () => {
  const [rent, setRent] = useState("");
  const maxCommission = rent ? Math.round(Number(rent) * 0.5) : 0;
  const locabeninCommission = rent ? Math.round(Number(rent) * 0.05) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Scale className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Guide juridique
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connaissez vos droits et devoirs. Tout ce que vous devez savoir sur la location au Bénin.
            </p>
          </div>

          {/* Key articles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Shield, title: "Protection locataire", desc: "Droit au logement décent et à la restitution de caution." },
              { icon: FileText, title: "Contrat obligatoire", desc: "Le bail écrit protège les deux parties juridiquement." },
              { icon: AlertTriangle, title: "Commission plafonnée", desc: "50% maximum du loyer mensuel selon la loi." },
            ].map((a) => (
              <div key={a.title} className="bg-card p-5 rounded-lg shadow-card">
                <a.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-display font-semibold text-foreground mb-1">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.desc}</p>
              </div>
            ))}
          </div>

          {/* Commission calculator */}
          <div className="bg-card p-6 rounded-lg shadow-card mb-12">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" /> Calculateur de commission
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Vérifiez si la commission demandée est conforme à la loi béninoise.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Loyer mensuel (FCFA)</Label>
                <Input
                  id="rent"
                  type="number"
                  placeholder="85000"
                  value={rent}
                  onChange={(e) => setRent(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="bg-destructive/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Commission max légale (50%)</p>
                <p className="font-display text-2xl font-bold text-destructive">
                  {new Intl.NumberFormat("fr-BJ").format(maxCommission)} FCFA
                </p>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Commission LOCABENIN (5%)</p>
                <p className="font-display text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("fr-BJ").format(locabeninCommission)} FCFA
                </p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" /> Questions fréquentes
            </h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card rounded-lg shadow-card px-4">
                  <AccordionTrigger className="text-foreground font-medium text-left">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* CTA */}
          <div className="bg-primary text-primary-foreground p-8 rounded-lg text-center">
            <h2 className="font-display text-2xl font-bold mb-2">Besoin d'un contrat conforme ?</h2>
            <p className="text-primary-foreground/80 mb-6">
              Générez un contrat de bail conforme à la loi béninoise en quelques clics.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8">
              <FileText className="h-4 w-4 mr-2" /> Générer un contrat
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LegalPage;
