import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";

export interface Property {
  id: string;
  title: string;
  type: "appartement" | "maison" | "studio" | "villa";
  price: number;
  deposit: number;
  location: string;
  quartier: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  images: string[];
  verified: boolean;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  floodRisk: "faible" | "moyen" | "élevé";
  noiseLevel: "calme" | "modéré" | "bruyant";
  ownerName: string;
  ownerPhone: string;
  availableFrom: string;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Bel appartement 3 pièces à Cotonou",
    type: "appartement",
    price: 85000,
    deposit: 170000,
    location: "Cotonou",
    quartier: "Akpakpa",
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    image: property1,
    images: [property1, property2],
    verified: true,
    rating: 4.5,
    reviews: 12,
    description: "Appartement moderne et lumineux situé dans un quartier calme d'Akpakpa. Proche des commerces et des transports. Carrelage neuf, cuisine équipée, ventilation naturelle excellente.",
    features: ["Carrelage neuf", "Cuisine équipée", "Eau courante", "Électricité SBEE", "Parking"],
    floodRisk: "faible",
    noiseLevel: "calme",
    ownerName: "M. Adéchian",
    ownerPhone: "+229 97 00 00 01",
    availableFrom: "2026-04-01",
  },
  {
    id: "2",
    title: "Studio meublé moderne Ganhi",
    type: "studio",
    price: 55000,
    deposit: 110000,
    location: "Cotonou",
    quartier: "Ganhi",
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    image: property2,
    images: [property2, property1],
    verified: true,
    rating: 4.2,
    reviews: 8,
    description: "Studio entièrement meublé au cœur de Ganhi. Idéal pour étudiant ou jeune professionnel. Internet fibre inclus, gardien 24h/24.",
    features: ["Meublé", "Internet fibre", "Gardien 24h", "Climatisation", "Eau chaude"],
    floodRisk: "faible",
    noiseLevel: "modéré",
    ownerName: "Mme. Hounkpatin",
    ownerPhone: "+229 96 00 00 02",
    availableFrom: "2026-03-15",
  },
  {
    id: "3",
    title: "Maison spacieuse 4 pièces Calavi",
    type: "maison",
    price: 120000,
    deposit: 240000,
    location: "Abomey-Calavi",
    quartier: "Zogbadjè",
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    image: property3,
    images: [property3, property4],
    verified: false,
    rating: 3.8,
    reviews: 5,
    description: "Grande maison familiale avec jardin et parking. Quartier résidentiel calme, proche de l'université d'Abomey-Calavi.",
    features: ["Jardin", "Parking 2 voitures", "Citerne d'eau", "Groupe électrogène", "Terrasse"],
    floodRisk: "moyen",
    noiseLevel: "calme",
    ownerName: "M. Dossou",
    ownerPhone: "+229 95 00 00 03",
    availableFrom: "2026-05-01",
  },
  {
    id: "4",
    title: "Villa de standing Haie Vive",
    type: "villa",
    price: 250000,
    deposit: 500000,
    location: "Cotonou",
    quartier: "Haie Vive",
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    image: property4,
    images: [property4, property3],
    verified: true,
    rating: 4.8,
    reviews: 15,
    description: "Magnifique villa de standing dans le quartier prisé de Haie Vive. Finitions haut de gamme, piscine, jardin arboré. Sécurité renforcée.",
    features: ["Piscine", "Jardin arboré", "Garage", "Climatisation centrale", "Groupe électrogène", "Gardien"],
    floodRisk: "faible",
    noiseLevel: "calme",
    ownerName: "M. Gangbo",
    ownerPhone: "+229 94 00 00 04",
    availableFrom: "2026-04-15",
  },
  {
    id: "5",
    title: "Appartement 2 pièces Fidjrossè",
    type: "appartement",
    price: 70000,
    deposit: 140000,
    location: "Cotonou",
    quartier: "Fidjrossè",
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    image: property1,
    images: [property1, property3],
    verified: true,
    rating: 4.0,
    reviews: 6,
    description: "Appartement rénové à Fidjrossè, proche de la plage. Quartier vivant avec commerces à proximité.",
    features: ["Rénové", "Proche plage", "Eau courante", "Ventilation naturelle"],
    floodRisk: "moyen",
    noiseLevel: "modéré",
    ownerName: "Mme. Ahouandjinou",
    ownerPhone: "+229 97 00 00 05",
    availableFrom: "2026-03-20",
  },
  {
    id: "6",
    title: "Studio économique Godomey",
    type: "studio",
    price: 35000,
    deposit: 70000,
    location: "Abomey-Calavi",
    quartier: "Godomey",
    bedrooms: 1,
    bathrooms: 1,
    area: 25,
    image: property2,
    images: [property2, property4],
    verified: false,
    rating: 3.5,
    reviews: 3,
    description: "Studio simple et propre à Godomey. Parfait pour étudiant. Accès facile aux transports en commun.",
    features: ["Eau courante", "Électricité", "Proche transport"],
    floodRisk: "élevé",
    noiseLevel: "bruyant",
    ownerName: "M. Kiki",
    ownerPhone: "+229 96 00 00 06",
    availableFrom: "2026-03-10",
  },
];
