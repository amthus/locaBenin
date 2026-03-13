import { Search, Shield, FileText, Star, ArrowRight, MapPin, BadgeCheck, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import heroImage from "@/assets/hero-cotonou.jpg";
import happyTenant from "@/assets/happy-tenant.jpg";
import PropertyCard from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Search,
    title: "Recherche intelligente",
    desc: "Filtrez par quartier, budget, type de bien, niveau sonore et risque d'inondation.",
  },
  {
    icon: BadgeCheck,
    title: "Annonces vérifiées",
    desc: "Photos réelles, informations validées. Fini les mauvaises surprises.",
  },
  {
    icon: Shield,
    title: "Caution sécurisée",
    desc: "Votre caution est bloquée sur un compte séquestre. Libérée après accord mutuel.",
  },
  {
    icon: FileText,
    title: "Contrat digital",
    desc: "Contrat conforme à la loi béninoise, signé électroniquement.",
  },
  {
    icon: Star,
    title: "Système de notation",
    desc: "Évaluez propriétaires et locataires. La transparence protège tout le monde.",
  },
  {
    icon: Banknote,
    title: "Zéro frais de visite",
    desc: "Pas de frais cachés. Commission plafonnée et transparente.",
  },
];

const steps = [
  { num: "01", title: "Créez votre profil", desc: "Inscription gratuite en 2 minutes." },
  { num: "02", title: "Recherchez votre bien", desc: "Filtres avancés pour trouver exactement ce qu'il vous faut." },
  { num: "03", title: "Visitez en confiance", desc: "Rendez-vous intégré, photos vérifiées." },
  { num: "04", title: "Signez et emménagez", desc: "Contrat digital + caution sécurisée." },
];

const stats = [
  { value: "500+", label: "Biens disponibles" },
  { value: "98%", label: "Clients satisfaits" },
  { value: "0 FCFA", label: "Frais de visite" },
  { value: "50%", label: "Commission max légale" },
];

const Index = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { data: allProperties = [] } = useProperties();
  const featured = allProperties.filter(p => p.verified).slice(0, 3);

  // Redirect authenticated users to their dashboard
  if (!isLoading && isAuthenticated && user) {
    const dashboardPath = user.role === "admin" 
      ? "/ctrl-panel-x" 
      : user.role === "proprietaire" 
        ? "/espace-proprietaire" 
        : "/tableau-de-bord";
    return <Navigate to={dashboardPath} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img src={heroImage} alt="Immobilier Cotonou" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 container mx-auto px-4 text-center py-32">
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground text-sm px-4 py-1.5 rounded-full mb-6 animate-fade-up">
            <Shield className="h-4 w-4" /> La confiance digitalisée
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-primary-foreground max-w-4xl mx-auto leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Louez en toute <span className="text-golden">transparence</span> à Cotonou
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Annonces vérifiées, caution sécurisée, contrats digitaux. La plateforme qui protège locataires et propriétaires.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild size="lg" className="text-base px-8 h-12">
              <Link to="/recherche">
                <Search className="h-5 w-5 mr-2" /> Trouver un logement
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
              <a href="#">Publier une annonce</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-3xl md:text-4xl font-bold">{s.value}</p>
                <p className="text-sm opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fonctionnalites" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Pourquoi LOCABENIN ?</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Une location sans mauvaises surprises
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-card p-6 rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-trust-light flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Simple & rapide</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Comment ça marche ?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                <span className="font-display text-6xl font-bold text-primary/10">{step.num}</span>
                <h3 className="font-display font-semibold text-lg text-foreground mt-2 mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 h-6 w-6 text-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Biens vérifiés</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Annonces à la une
              </h2>
            </div>
            <Button asChild variant="outline" className="hidden sm:flex">
              <Link to="/recherche">Voir tout <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button asChild>
              <Link to="/recherche">Voir toutes les annonces</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 overflow-hidden">
        <img src={happyTenant} alt="Locataires heureux" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Prêt à louer en toute sérénité ?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Rejoignez des centaines de locataires et propriétaires qui font confiance à LOCABENIN.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-8">Je cherche un logement</Button>
            <Button size="lg" variant="outline" className="h-12 px-8 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20">
              Je suis propriétaire
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
