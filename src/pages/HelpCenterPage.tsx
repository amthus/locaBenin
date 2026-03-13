import { Search, BookOpen, MessageCircle, Shield, FileText, Calculator, Users, Phone, HelpCircle, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = [
  {
    icon: Search,
    title: "Recherche & Filtres",
    articles: [
      { q: "Comment rechercher un logement ?", a: "Utilisez la barre de recherche ou les filtres avancés (type, budget, ville, quartier). Vous pouvez aussi utiliser la vue carte pour localiser les biens à proximité." },
      { q: "Comment fonctionne la vue carte ?", a: "La vue carte utilise la géolocalisation pour afficher les biens disponibles autour de vous dans un rayon de 5km. Cliquez sur un marqueur pour voir les détails." },
      { q: "Puis-je sauvegarder mes recherches ?", a: "Oui ! Connectez-vous à votre compte et cliquez sur le cœur pour sauvegarder un bien. Vos recherches sauvegardées apparaissent dans votre tableau de bord." },
    ]
  },
  {
    icon: Shield,
    title: "Caution & Paiements",
    articles: [
      { q: "Comment fonctionne la caution sécurisée ?", a: "Votre caution est déposée sur un compte séquestre via Mobile Money (MTN, Moov, Orange). Elle reste bloquée pendant toute la durée du bail. À la fin, les deux parties valident et la caution est libérée automatiquement." },
      { q: "Quels modes de paiement sont acceptés ?", a: "Nous acceptons : MTN Mobile Money, Moov Africa, Orange Money et FedaPay. Tous les paiements sont sécurisés et tracés." },
      { q: "Que se passe-t-il en cas de litige sur la caution ?", a: "En cas de désaccord, notre équipe de médiation intervient sous 48h. Un processus de résolution équitable est garanti par notre système." },
    ]
  },
  {
    icon: FileText,
    title: "Contrats & Juridique",
    articles: [
      { q: "Les contrats sont-ils conformes à la loi ?", a: "Oui, tous les contrats LOCABENIN sont rédigés conformément à la législation béninoise en vigueur. Ils ont une valeur juridique et sont signés électroniquement." },
      { q: "Comment générer un contrat ?", a: "Depuis la page du bien, cliquez sur 'Générer un contrat'. Remplissez les informations complémentaires et le contrat sera prêt pour signature." },
      { q: "La commission de 50% est-elle légale ?", a: "La loi béninoise plafonne la commission d'agence à 50% du loyer mensuel. Chez LOCABENIN, nous appliquons seulement 3-7%." },
    ]
  },
  {
    icon: Users,
    title: "Compte & Profil",
    articles: [
      { q: "Comment vérifier mon identité ?", a: "Rendez-vous dans votre profil > Sécurité > Vérification d'identité. Téléchargez une copie de votre pièce d'identité. La vérification prend 24-48h." },
      { q: "Comment fonctionne le système de notation ?", a: "Après chaque location, locataires et propriétaires peuvent se noter mutuellement (1 à 5 étoiles). Les scores sont certifiés et visibles sur les profils." },
      { q: "Comment passer en Premium ?", a: "Rendez-vous sur la page Premium et choisissez votre formule (Locataire ou Propriétaire). Le paiement se fait via Mobile Money." },
    ]
  },
  {
    icon: Calculator,
    title: "Publication d'annonces",
    articles: [
      { q: "Comment publier une annonce ?", a: "Cliquez sur 'Publier une annonce' et suivez les 5 étapes : Informations, Localisation, Photos, Vérification et Publication. C'est gratuit pour les 3 premières annonces." },
      { q: "Comment obtenir le badge 'Vérifié' ?", a: "Après publication, notre équipe vérifie votre annonce sous 24h : photos réelles, informations exactes, conformité. Si tout est bon, le badge est attribué." },
      { q: "Puis-je modifier mon annonce ?", a: "Oui, depuis votre espace propriétaire, vous pouvez modifier les informations, photos et prix à tout moment." },
    ]
  },
];

const HelpCenterPage = () => {
  const [search, setSearch] = useState("");

  const filteredCategories = categories.map(cat => ({
    ...cat,
    articles: cat.articles.filter(a => 
      !search || a.q.toLowerCase().includes(search.toLowerCase()) || a.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.articles.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        {/* Hero */}
        <div className="bg-primary text-primary-foreground py-16 mb-12">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Centre d'aide LOCABENIN</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Trouvez rapidement des réponses à vos questions sur la location, les paiements et plus.
            </p>
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans le centre d'aide..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 text-foreground bg-background border-0 text-base"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-4xl">
          {/* Quick links */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-card p-4 rounded-lg shadow-card text-center hover:shadow-card-hover transition-all cursor-pointer">
                <cat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground">{cat.title}</p>
              </div>
            ))}
          </div>

          {/* Categories */}
          {filteredCategories.map((cat) => (
            <div key={cat.title} className="mb-8">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <cat.icon className="h-5 w-5 text-primary" />
                {cat.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-2">
                {cat.articles.map((article, i) => (
                  <AccordionItem key={i} value={`${cat.title}-${i}`} className="bg-card rounded-lg shadow-card px-4">
                    <AccordionTrigger className="text-foreground font-medium text-left text-sm">
                      {article.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm">
                      {article.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {/* Contact CTA */}
          <div className="bg-card p-8 rounded-lg shadow-card text-center">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
            <p className="text-muted-foreground mb-6">Notre équipe est à votre disposition pour vous aider.</p>
            <div className="flex gap-3 justify-center">
              <Button asChild><Link to="/contact">Nous contacter</Link></Button>
              <Button variant="outline" className="gap-2"><Phone className="h-4 w-4" /> +229 01 46 87 91 42 </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HelpCenterPage;
