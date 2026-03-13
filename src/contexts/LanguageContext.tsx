import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "fr" | "en";

const translations = {
  fr: {
    nav: { home: "Accueil", search: "Rechercher", premium: "Premium", legal: "Guide juridique", about: "À propos", login: "Se connecter", publish: "Publier une annonce", help: "Centre d'aide", community: "Communauté" },
    hero: { badge: "La confiance digitalisée", title: "Louez en toute", highlight: "transparence", titleEnd: "à Cotonou", subtitle: "Annonces vérifiées, caution sécurisée, contrats digitaux. La plateforme qui protège locataires et propriétaires.", searchBtn: "Trouver un logement", publishBtn: "Publier une annonce" },
    stats: { properties: "Biens disponibles", satisfaction: "Clients satisfaits", visitFee: "Frais de visite", commission: "Commission max légale" },
    search: { title: "Rechercher un logement", available: "disponible", filters: "Filtres", allTypes: "Tous les types", allBudgets: "Tous les budgets", allCities: "Toutes les villes", noResults: "Aucun résultat", clearFilters: "Effacer les filtres", mapView: "Vue carte", gridView: "Vue grille", activeFilters: "Filtres actifs", clear: "Effacer" },
    property: { month: "/mois", deposit: "Caution", verified: "Annonce vérifiée", rooms: "chambre", bathrooms: "SdB", floodRisk: "Risque d'inondation", noiseLevel: "Niveau sonore", description: "Description", equipment: "Équipements", environment: "Informations environnement", securedDeposit: "Caution sécurisée", securedDepositDesc: "Votre argent est protégé sur un compte séquestre.", availableFrom: "Disponible le", contact: "Contacter", message: "Envoyer un message", scheduleVisit: "Planifier une visite", gallery: "Galerie photos", virtualTour: "Visite virtuelle 3D", share: "Partager" },
    premium: { title: "Passez au niveau supérieur", subtitle: "Accédez à des fonctionnalités exclusives pour trouver ou louer plus rapidement et en toute sécurité." },
    footer: { tagline: "La plateforme immobilière transparente et sécurisée du Bénin.", tenant: "Locataire", owner: "Propriétaire", rights: "Tous droits réservés." },
    common: { save: "Sauvegarder", cancel: "Annuler", next: "Suivant", previous: "Précédent", submit: "Soumettre", loading: "Chargement...", seeMore: "Voir plus", seeAll: "Voir tout" },
    payment: { title: "Paiement sécurisé", chooseMethod: "Choisissez votre mode de paiement", amount: "Montant", pay: "Payer maintenant", processing: "Traitement en cours...", success: "Paiement réussi !", phone: "Numéro de téléphone" },
    maintenance: { title: "Suivi maintenance", newRequest: "Nouvelle demande", status: { pending: "En attente", inProgress: "En cours", resolved: "Résolu" } },
    admin: { title: "Console d'administration", users: "Utilisateurs", revenue: "Revenus", properties: "Annonces", reports: "Signalements" },
  },
  en: {
    nav: { home: "Home", search: "Search", premium: "Premium", legal: "Legal Guide", about: "About", login: "Log in", publish: "Post a listing", help: "Help Center", community: "Community" },
    hero: { badge: "Digitalized trust", title: "Rent with total", highlight: "transparency", titleEnd: "in Cotonou", subtitle: "Verified listings, secured deposits, digital contracts. The platform that protects tenants and landlords.", searchBtn: "Find a home", publishBtn: "Post a listing" },
    stats: { properties: "Available properties", satisfaction: "Satisfied clients", visitFee: "Visit fees", commission: "Max legal commission" },
    search: { title: "Search for a home", available: "available", filters: "Filters", allTypes: "All types", allBudgets: "All budgets", allCities: "All cities", noResults: "No results", clearFilters: "Clear filters", mapView: "Map view", gridView: "Grid view", activeFilters: "Active filters", clear: "Clear" },
    property: { month: "/month", deposit: "Deposit", verified: "Verified listing", rooms: "room", bathrooms: "Bath", floodRisk: "Flood risk", noiseLevel: "Noise level", description: "Description", equipment: "Amenities", environment: "Environment info", securedDeposit: "Secured deposit", securedDepositDesc: "Your money is protected in an escrow account.", availableFrom: "Available from", contact: "Contact", message: "Send a message", scheduleVisit: "Schedule a visit", gallery: "Photo gallery", virtualTour: "3D Virtual tour", share: "Share" },
    premium: { title: "Level up your experience", subtitle: "Access exclusive features to find or rent faster and more securely." },
    footer: { tagline: "The transparent and secure real estate platform of Benin.", tenant: "Tenant", owner: "Owner", rights: "All rights reserved." },
    common: { save: "Save", cancel: "Cancel", next: "Next", previous: "Previous", submit: "Submit", loading: "Loading...", seeMore: "See more", seeAll: "See all" },
    payment: { title: "Secure Payment", chooseMethod: "Choose your payment method", amount: "Amount", pay: "Pay now", processing: "Processing...", success: "Payment successful!", phone: "Phone number" },
    maintenance: { title: "Maintenance tracking", newRequest: "New request", status: { pending: "Pending", inProgress: "In progress", resolved: "Resolved" } },
    admin: { title: "Admin Console", users: "Users", revenue: "Revenue", properties: "Listings", reports: "Reports" },
  },
};

type Translations = typeof translations.fr;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  t: translations.fr,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("fr");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
