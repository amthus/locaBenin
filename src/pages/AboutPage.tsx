import { Shield, Users, Target, Heart, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import neighborhoodImg from "@/assets/neighborhood.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  { icon: Shield, title: "Transparence", desc: "Chaque annonce est vérifiée. Chaque prix est juste. Pas de frais cachés." },
  { icon: Users, title: "Confiance", desc: "Un système de notation mutuel qui protège locataires et propriétaires." },
  { icon: Target, title: "Innovation", desc: "Des outils digitaux pour moderniser le marché locatif béninois." },
  { icon: Heart, title: "Accessibilité", desc: "Des solutions pour tous les budgets, étudiants comme familles." },
];

const team = [
  { name: "Kodjo A.", role: "Fondateur & CEO", initials: "KA" },
  { name: "Aïcha M.", role: "Directrice Produit", initials: "AM" },
  { name: "Yves D.", role: "Lead Développeur", initials: "YD" },
  { name: "Grâce H.", role: "Responsable Juridique", initials: "GH" },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-3">À propos de nous</p>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Nous digitalisons la <span className="text-primary">confiance</span> immobilière
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                LOCABENIN est née d'un constat simple : le marché locatif à Cotonou manque de transparence. 
                Frais abusifs, annonces trompeuses, cautions non restituées... Nous avons décidé de changer les choses.
              </p>
              <div className="flex gap-4">
                <Button asChild size="lg" className="h-12">
                  <Link to="/recherche">Découvrir la plateforme</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12">
                  <Link to="/contact">Nous contacter</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img src={neighborhoodImg} alt="Quartier de Cotonou" className="rounded-lg shadow-card-hover w-full" />
              <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-card">
                <p className="font-display text-3xl font-bold">2026</p>
                <p className="text-sm text-primary-foreground/80">Fondée à Cotonou</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">Notre mission</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Rendre le marché locatif béninois transparent, sécurisé et accessible à tous. 
            En supprimant les intermédiaires abusifs et en digitalisant les processus, 
            nous créons un écosystème de confiance entre locataires et propriétaires.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Nos valeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-card p-6 rounded-lg shadow-card text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-10">L'équipe</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {team.map((t) => (
              <div key={t.name} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="font-display text-xl font-bold text-primary">{t.initials}</span>
                </div>
                <h3 className="font-semibold text-foreground">{t.name}</h3>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: "Biens disponibles" },
              { value: "1 200+", label: "Utilisateurs" },
              { value: "98%", label: "Satisfaction" },
              { value: "0 FCFA", label: "Frais de visite" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl md:text-4xl font-bold">{s.value}</p>
                <p className="text-sm opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
