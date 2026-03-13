import { CheckCircle, Crown, Zap, Star, Shield, Eye, Bell, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    desc: "Pour commencer",
    features: [
      "Recherche de base",
      "3 annonces max",
      "Messagerie limitée",
      "Support email",
    ],
    highlighted: false,
    cta: "Plan actuel",
  },
  {
    name: "Premium Locataire",
    price: "2 500",
    desc: "Pour trouver plus vite",
    features: [
      "Alertes prioritaires",
      "Accès biens vérifiés",
      "Score qualité logement",
      "Messagerie illimitée",
      "Support prioritaire",
      "Historique des biens",
    ],
    highlighted: true,
    cta: "Choisir Premium",
    icon: Zap,
  },
  {
    name: "Premium Propriétaire",
    price: "5 000",
    desc: "Pour louer plus vite",
    features: [
      "Annonces illimitées",
      "Mise en avant annonce",
      "Visibilité prioritaire",
      "Statistiques détaillées",
      "Badge propriétaire vérifié",
      "Support dédié",
    ],
    highlighted: false,
    cta: "Choisir Pro",
    icon: Crown,
  },
];

const PremiumPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-14">
            <Badge className="bg-secondary text-secondary-foreground mb-4">
              <Crown className="h-3 w-3 mr-1" /> Premium
            </Badge>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Passez au niveau supérieur
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Accédez à des fonctionnalités exclusives pour trouver ou louer plus rapidement et en toute sécurité.
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-card rounded-lg p-6 shadow-card relative ${plan.highlighted ? "ring-2 ring-primary scale-105" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Populaire</Badge>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                  <p className="font-display text-4xl font-bold text-foreground">
                    {plan.price} <span className="text-base font-normal text-muted-foreground">FCFA/mois</span>
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full h-12" variant={plan.highlighted ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Benefits */}
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">Avantages Premium</h2>
            <p className="text-muted-foreground">Ce qui vous attend avec un abonnement Premium</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Bell, title: "Alertes instantanées", desc: "Soyez le premier informé des nouveaux biens." },
              { icon: Shield, title: "Biens vérifiés", desc: "Accédez uniquement aux annonces de confiance." },
              { icon: BarChart3, title: "Statistiques", desc: "Suivez les performances de vos annonces." },
              { icon: Star, title: "Support prioritaire", desc: "Assistance dédiée sous 2h." },
            ].map((b) => (
              <div key={b.title} className="text-center p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PremiumPage;
