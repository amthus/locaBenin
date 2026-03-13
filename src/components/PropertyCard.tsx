import { Link } from "react-router-dom";
import { MapPin, Bed, Bath, Maximize, Star, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/data/properties";

const PropertyCard = ({ property }: { property: Property }) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fr-BJ").format(price) + " FCFA";

  return (
    <Link
      to={`/bien/${property.id}`}
      className="group block bg-card rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="bg-foreground/80 text-background backdrop-blur-sm text-xs capitalize">
            {property.type}
          </Badge>
          {property.verified && (
            <Badge className="bg-primary text-primary-foreground backdrop-blur-sm text-xs flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" /> Vérifié
            </Badge>
          )}
        </div>
        {property.floodRisk === "élevé" && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs">
            Zone inondable
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-display font-bold text-lg text-primary">
            {formatPrice(property.price)}<span className="text-sm font-normal text-muted-foreground">/mois</span>
          </p>
          <div className="flex items-center gap-1 text-sm text-golden">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-foreground font-medium">{property.rating}</span>
            <span className="text-muted-foreground">({property.reviews})</span>
          </div>
        </div>

        <h3 className="font-medium text-foreground mb-2 line-clamp-1">{property.title}</h3>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3.5 w-3.5" />
          {property.quartier}, {property.location}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {property.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {property.bathrooms}</span>
          <span className="flex items-center gap-1"><Maximize className="h-4 w-4" /> {property.area}m²</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
