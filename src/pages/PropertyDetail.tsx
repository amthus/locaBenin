import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Bed, Bath, Maximize, Star, BadgeCheck, Shield, Phone, MessageCircle, Calendar, Volume2, Droplets, Eye, Share2, CreditCard, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import VirtualTourModal from "@/components/VirtualTourModal";
import VisitScheduler from "@/components/VisitScheduler";
import PaymentSimulator from "@/components/PaymentSimulator";
import SocialShare from "@/components/SocialShare";
import ReputationBadge from "@/components/ReputationBadge";
import { useProperty } from "@/hooks/useProperties";
import { useToggleFavorite, useIsFavorite } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";

const PropertyDetail = () => {
  const { id } = useParams();
  const { data: property, isLoading } = useProperty(id);
  const { isAuthenticated } = useAuth();
  const { data: isFavorite } = useIsFavorite(id || "");
  const toggleFavorite = useToggleFavorite();
  const [showTour, setShowTour] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showShare, setShowShare] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-4">Bien non trouvé</h1>
          <Button asChild><Link to="/recherche">Retour à la recherche</Link></Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-BJ").format(price) + " FCFA";
  const floodColor = property.floodRisk === "faible" ? "text-primary" : property.floodRisk === "moyen" ? "text-golden" : "text-destructive";
  const noiseColor = property.noiseLevel === "calme" ? "text-primary" : property.noiseLevel === "modéré" ? "text-golden" : "text-destructive";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/recherche" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour aux résultats
          </Link>

          <div className="mb-8">
            <ImageGallery images={property.images} title={property.title} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className="bg-foreground/80 text-background capitalize">{property.type}</Badge>
                  {property.verified && (
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3" /> Annonce vérifiée
                    </Badge>
                  )}
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite.mutate(property.id)}
                      disabled={toggleFavorite.isPending}
                      className="ml-auto"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
                    </Button>
                  )}
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{property.title}</h1>
                <div className="flex items-center gap-1 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" /> {property.quartier}, {property.location}
                </div>
                <ReputationBadge score={property.rating} reviews={property.reviews} verified={property.verified} />
              </div>

              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-1.5"><Bed className="h-5 w-5 text-primary" /> {property.bedrooms} chambre{property.bedrooms > 1 ? "s" : ""}</span>
                <span className="flex items-center gap-1.5"><Bath className="h-5 w-5 text-primary" /> {property.bathrooms} SdB</span>
                <span className="flex items-center gap-1.5"><Maximize className="h-5 w-5 text-primary" /> {property.area}m²</span>
              </div>

              <Separator />

              <div>
                <h2 className="font-display font-semibold text-lg mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>

              {property.features.length > 0 && (
                <div>
                  <h2 className="font-display font-semibold text-lg mb-3">Équipements</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((f) => <Badge key={f} variant="secondary">{f}</Badge>)}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h2 className="font-display font-semibold text-lg mb-4">Informations environnement</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card p-4 rounded-lg shadow-card flex items-start gap-3">
                    <Droplets className={`h-5 w-5 mt-0.5 ${floodColor}`} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Risque d'inondation</p>
                      <p className={`text-sm capitalize font-semibold ${floodColor}`}>{property.floodRisk}</p>
                    </div>
                  </div>
                  <div className="bg-card p-4 rounded-lg shadow-card flex items-start gap-3">
                    <Volume2 className={`h-5 w-5 mt-0.5 ${noiseColor}`} />
                    <div>
                      <p className="font-medium text-foreground text-sm">Niveau sonore</p>
                      <p className={`text-sm capitalize font-semibold ${noiseColor}`}>{property.noiseLevel}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" /> Visite virtuelle 3D
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">Explorez ce bien en immersion complète</p>
                  </div>
                  <Button onClick={() => setShowTour(true)} className="gap-2">
                    <Eye className="h-4 w-4" /> Lancer la visite
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg shadow-card sticky top-24">
                <p className="font-display text-3xl font-bold text-primary mb-1">
                  {formatPrice(property.price)}
                  <span className="text-base font-normal text-muted-foreground">/mois</span>
                </p>
                <p className="text-sm text-muted-foreground mb-6">Caution : {formatPrice(property.deposit)}</p>

                <div className="flex items-center gap-3 mb-6 p-3 bg-trust-light rounded-lg">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground">
                    <span className="font-semibold">Caution sécurisée</span> — Votre argent est protégé sur un compte séquestre.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Disponible le {new Date(property.availableFrom).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full h-12" onClick={() => setShowPayment(true)}>
                    <CreditCard className="h-4 w-4 mr-2" /> Payer la caution
                  </Button>
                  <Button variant="outline" className="w-full h-12">
                    <Phone className="h-4 w-4 mr-2" /> Contacter {property.ownerName}
                  </Button>
                  <Button variant="outline" className="w-full h-12" asChild>
                    <Link to="/messages">
                      <MessageCircle className="h-4 w-4 mr-2" /> Envoyer un message
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full h-12" onClick={() => setShowVisit(true)}>
                    <Calendar className="h-4 w-4 mr-2" /> Planifier une visite
                  </Button>
                  <Button variant="ghost" className="w-full h-10" onClick={() => setShowShare(true)}>
                    <Share2 className="h-4 w-4 mr-2" /> Partager
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VirtualTourModal open={showTour} onClose={() => setShowTour(false)} propertyTitle={property.title} images={property.images} />
      <VisitScheduler open={showVisit} onClose={() => setShowVisit(false)} propertyTitle={property.title} ownerName={property.ownerName} />
      <PaymentSimulator open={showPayment} onClose={() => setShowPayment(false)} amount={property.deposit} label="Caution sécurisée" />
      <SocialShare open={showShare} onClose={() => setShowShare(false)} title={property.title} price={property.price} url={window.location.href} />

      <Footer />
    </div>
  );
};

export default PropertyDetail;
