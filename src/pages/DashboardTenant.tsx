import { useState } from "react";
import { Search, Heart, Calendar, MessageCircle, FileText, Star, Bell, Wrench, Shield, Loader2, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import PropertyCard from "@/components/PropertyCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import type { UiProperty } from "@/hooks/useProperties";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TenantSidebar, tenantSidebarItems } from "@/components/TenantSidebar";

function favToUi(fav: any) {
  const p = fav.property;
  if (!p) return null;
  return {
    id: p.id, title: p.title, type: p.type as any, price: p.price, deposit: p.deposit,
    location: p.city, quartier: p.quartier || "", bedrooms: p.bedrooms || 1, bathrooms: p.bathrooms || 1,
    area: p.area || 0, image: p.images?.[0] || "/placeholder.svg", images: p.images?.length ? p.images : ["/placeholder.svg"],
    verified: p.is_verified || false, rating: Number(p.rating) || 0, reviews: p.review_count || 0,
    description: p.description || "", features: p.features || [],
    floodRisk: (p.flood_risk || "faible") as any, noiseLevel: (p.noise_level || "calme") as any,
    ownerName: "Propriétaire", ownerPhone: "", availableFrom: p.available_from || "",
  };
}

const DashboardTenant = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: favorites = [], isLoading: favLoading } = useFavorites();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10);
      return data || [];
    },
  });

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ["unread-messages-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: convs } = await supabase.from("conversations").select("id").or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`);
      if (!convs?.length) return 0;
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).in("conversation_id", convs.map(c => c.id)).eq("is_read", false).neq("sender_id", user!.id);
      return count || 0;
    },
  });

  const favProperties = favorites.map(favToUi).filter(Boolean);

  const quickActions = [
    { icon: Search, label: "Rechercher", desc: "Trouver un logement", link: "/recherche" },
    { icon: Heart, label: "Favoris", desc: `${favProperties.length} bien(s)`, link: "#", action: () => setActiveTab("favorites") },
    { icon: DollarSign, label: "Paiements", desc: "Loyer & quittances", link: "/paiements" },
    { icon: MessageCircle, label: "Messages", desc: `${unreadMessages} non lu(s)`, link: "/messages" },
    { icon: FileText, label: "Contrats", desc: "Mes contrats", link: "/contrats" },
    { icon: Calendar, label: "Visites", desc: "Planifiées", link: "#" },
    { icon: Wrench, label: "Maintenance", desc: "Demandes", link: "/maintenance" },
    { icon: Shield, label: "Premium", desc: "Passer Pro", link: "/premium" },
  ];

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return `Il y a ${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString("fr-FR");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <TenantSidebar activeTab={activeTab} setActiveTab={setActiveTab} unreadMessages={unreadMessages} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h2 className="font-display text-lg md:text-xl font-bold text-foreground">
                    Bonjour, {user?.fullName?.split(" ")[0] || "Locataire"} 👋
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                    {tenantSidebarItems.find(i => i.id === activeTab)?.label || "Votre espace locataire"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to="/recherche"><Search className="h-4 w-4 mr-1" /><span className="hidden sm:inline">Rechercher</span></Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {/* ─── OVERVIEW ─── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quickActions.map((a) => (
                    <Link
                      key={a.label}
                      to={a.link}
                      onClick={a.action ? (e) => { e.preventDefault(); a.action?.(); } : undefined}
                      className="bg-card p-3 md:p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all text-center group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <a.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <p className="font-semibold text-foreground text-xs md:text-sm">{a.label}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                    </Link>
                  ))}
                </div>

                {/* Recent Favorites Preview */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base md:text-lg flex items-center gap-2"><Heart className="h-5 w-5 text-primary" />Biens sauvegardés</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab("favorites")}>Voir tout</Button>
                  </CardHeader>
                  <CardContent>
                    {favLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : favProperties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favProperties.slice(0, 2).map((p: any) => <PropertyCard key={p.id} property={p} />)}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Aucun favori. Explorez les annonces !</p>
                        <Button variant="outline" size="sm" className="mt-3" asChild><Link to="/recherche">Rechercher</Link></Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base md:text-lg flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notifications récentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Aucune notification</p>
                    ) : (
                      <div className="space-y-2">
                        {notifications.slice(0, 4).map((n: any) => (
                          <div key={n.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                            <p className="text-xs md:text-sm text-foreground">{n.message}</p>
                            <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap ml-2">{formatTime(n.created_at)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── FAVORITES ─── */}
            {activeTab === "favorites" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-foreground">Mes favoris ({favProperties.length})</h3>
                  <Button variant="outline" size="sm" asChild><Link to="/recherche">Découvrir plus</Link></Button>
                </div>
                {favLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : favProperties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {favProperties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-3">Aucun bien sauvegardé</p>
                      <Button asChild><Link to="/recherche">Explorer les annonces</Link></Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ─── NOTIFICATIONS ─── */}
            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-semibold text-foreground">Toutes les notifications</h3>
                <Card>
                  <CardContent className="p-4 md:p-6">
                    {notifications.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">Aucune notification</p>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((n: any) => (
                          <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${n.is_read ? "bg-muted/30" : "bg-primary/5 border border-primary/10"}`}>
                            <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${n.is_read ? "text-muted-foreground" : "text-primary"}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-medium text-foreground">{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground whitespace-nowrap">{formatTime(n.created_at)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardTenant;
