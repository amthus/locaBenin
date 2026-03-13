import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, Map, LayoutGrid, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PropertyCard from "@/components/PropertyCard";
import MapView from "@/components/MapView";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProperties } from "@/hooks/useProperties";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const SearchPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [maxPrice, setMaxPrice] = useState("all");
  const [location, setLocation] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const { data: properties = [], isLoading } = useProperties({
    type,
    maxPrice,
    city: location,
    search: search || undefined,
  });

  const clearFilters = () => { setSearch(""); setType("all"); setMaxPrice("all"); setLocation("all"); };
  const hasFilters = search || type !== "all" || maxPrice !== "all" || location !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">{t.search.title}</h1>
              <p className="text-muted-foreground">
                {isLoading ? "Chargement..." : `${properties.length} bien${properties.length > 1 ? "s" : ""} ${t.search.available}${properties.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "map" ? "default" : "outline"} size="icon" onClick={() => setViewMode("map")}>
                <Map className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par quartier, type..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-12" />
            </div>
            <Button variant="outline" size="lg" className="h-12" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" /> {t.search.filters}
            </Button>
          </div>

          {showFilters && (
            <div className="bg-card p-4 rounded-lg shadow-card mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Type de bien" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.search.allTypes}</SelectItem>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={maxPrice} onValueChange={setMaxPrice}>
                <SelectTrigger><SelectValue placeholder="Budget max" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.search.allBudgets}</SelectItem>
                  <SelectItem value="50000">≤ 50 000 FCFA</SelectItem>
                  <SelectItem value="80000">≤ 80 000 FCFA</SelectItem>
                  <SelectItem value="120000">≤ 120 000 FCFA</SelectItem>
                  <SelectItem value="200000">≤ 200 000 FCFA</SelectItem>
                  <SelectItem value="999999">200 000+ FCFA</SelectItem>
                </SelectContent>
              </Select>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue placeholder="Ville" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.search.allCities}</SelectItem>
                  <SelectItem value="Cotonou">Cotonou</SelectItem>
                  <SelectItem value="Abomey-Calavi">Abomey-Calavi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {hasFilters && (
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <span className="text-sm text-muted-foreground">{t.search.activeFilters} :</span>
              {type !== "all" && <Badge variant="secondary" className="capitalize">{type}</Badge>}
              {maxPrice !== "all" && <Badge variant="secondary">≤ {Number(maxPrice).toLocaleString()} FCFA</Badge>}
              {location !== "all" && <Badge variant="secondary">{location}</Badge>}
              <button onClick={clearFilters} className="text-sm text-destructive flex items-center gap-1 hover:underline">
                <X className="h-3 w-3" /> {t.search.clear}
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "map" ? (
            <div className="h-[600px] rounded-lg overflow-hidden border border-border">
              <MapView properties={properties} onSelectProperty={(id) => navigate(`/bien/${id}`)} />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">{t.search.noResults}</h3>
              <p className="text-muted-foreground mb-4">Essayez de modifier vos critères ou publiez une annonce.</p>
              <Button variant="outline" onClick={clearFilters}>{t.search.clearFilters}</Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
