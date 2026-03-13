import { useState, useEffect } from "react";
import { 
  Home, Plus, Eye, MessageCircle, Star, TrendingUp, BarChart3, 
  DollarSign, Calendar, Loader2, Users, Clock, MapPin, 
  ArrowUpRight, ChevronRight, RefreshCw, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import { useMyProperties } from "@/hooks/useProperties";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { OwnerSidebar, ownerSidebarItems } from "@/components/OwnerSidebar";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(152, 45%, 50%)",
  "hsl(35, 90%, 55%)",
  "hsl(280, 65%, 60%)",
];

const DashboardOwner = () => {
  const { user } = useAuth();
  const { data: myProperties = [], isLoading } = useMyProperties();
  const [period, setPeriod] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [visits, setVisits] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user) loadOwnerStats();
  }, [user]);

  const loadOwnerStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const { data: visitsData } = await supabase.from("visits").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setVisits(visitsData || []);
      const { data: paymentsData } = await supabase.from("payments").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setPayments(paymentsData || []);
      const { data: contractsData } = await supabase.from("contracts").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setContracts(contractsData || []);
    } catch (err) {
      console.error("Error loading owner stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const totalViews = myProperties.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const avgRating = myProperties.length > 0
    ? (myProperties.reduce((sum, p) => sum + p.rating, 0) / myProperties.length).toFixed(1)
    : "0";
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const activeContracts = contracts.filter(c => c.status === "active").length;
  const pendingVisits = visits.filter(v => v.status === "pending").length;

  const generateViewsData = () => {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, "dd/MM"),
        vues: Math.floor(Math.random() * 50) + totalViews / days,
        demandes: Math.floor(Math.random() * 5),
      };
    });
  };

  const revenueByMonth = payments.reduce((acc: Record<string, number>, p) => {
    const key = `${p.period_year}-${String(p.period_month).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + p.amount;
    return acc;
  }, {});

  const revenueChartData = Object.entries(revenueByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, amount]) => ({ 
      month: month.split("-")[1] + "/" + month.split("-")[0].slice(2),
      montant: amount 
    }));

  const propertiesByType = myProperties.reduce((acc: Record<string, number>, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});
  const typeChartData = Object.entries(propertiesByType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value
  }));

  const propertiesByCity = myProperties.reduce((acc: Record<string, number>, p) => {
    acc[p.location] = (acc[p.location] || 0) + 1;
    return acc;
  }, {});
  const cityChartData = Object.entries(propertiesByCity).map(([name, value]) => ({ name, value }));

  const occupancyData = [
    { month: "Jan", taux: 85 }, { month: "Fév", taux: 90 }, { month: "Mar", taux: 88 },
    { month: "Avr", taux: 92 }, { month: "Mai", taux: 95 }, { month: "Juin", taux: 91 },
  ];

  const stats = [
    { icon: Home, label: "Biens publiés", value: String(myProperties.length), change: "+2 ce mois", positive: true },
    { icon: Eye, label: "Vues totales", value: totalViews.toLocaleString(), change: "+15% vs mois dernier", positive: true },
    { icon: DollarSign, label: "Revenus totaux", value: `${(totalRevenue / 1000).toFixed(0)}k FCFA`, change: activeContracts > 0 ? `${activeContracts} contrat(s)` : "Aucun contrat", positive: activeContracts > 0 },
    { icon: Star, label: "Note moyenne", value: avgRating, change: `${myProperties.reduce((s, p) => s + p.reviews, 0)} avis`, positive: Number(avgRating) >= 4 },
  ];

  const viewsData = generateViewsData();

  if (loadingStats && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <OwnerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h2 className="font-display text-lg md:text-xl font-bold text-foreground">
                  {ownerSidebarItems.find(i => i.id === activeTab)?.label || "Tableau de bord"}
                </h2>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-28 md:w-36 text-xs md:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 jours</SelectItem>
                    <SelectItem value="30d">30 jours</SelectItem>
                    <SelectItem value="90d">3 mois</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={loadOwnerStats} variant="outline" className="hidden sm:flex gap-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Actualiser
                </Button>
                <Button size="sm" asChild>
                  <Link to="/publier">
                    <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Nouvelle annonce</span>
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 md:p-6">
            {/* ─── OVERVIEW ─── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {stats.map((s) => (
                    <Card key={s.label}>
                      <CardContent className="p-4 md:p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <s.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                          </div>
                          {s.positive && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0 text-[10px] md:text-xs hidden sm:inline-flex">
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />{s.change}
                            </Badge>
                          )}
                        </div>
                        <p className="font-display text-xl md:text-2xl font-bold text-foreground">{s.value}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{s.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick overview charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><Eye className="h-5 w-5 text-primary" />Vues récentes</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={viewsData.slice(-14)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="vues" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Visites en attente ({pendingVisits})</CardTitle></CardHeader>
                    <CardContent>
                      {visits.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">Aucune visite</p>
                      ) : (
                        <div className="space-y-2">
                          {visits.slice(0, 4).map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${v.status === "pending" ? "bg-amber-500" : v.status === "confirmed" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                                <p className="text-xs md:text-sm font-medium text-foreground">
                                  {format(new Date(v.scheduled_at), "dd MMM à HH:mm", { locale: fr })}
                                </p>
                              </div>
                              <Badge variant={v.status === "pending" ? "secondary" : "default"} className="text-[10px]">
                                {v.status === "pending" ? "En attente" : "Confirmée"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ─── PERFORMANCE ─── */}
            {activeTab === "performance" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><Eye className="h-5 w-5 text-primary" />Vues et demandes</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={viewsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip /><Legend />
                          <Area type="monotone" dataKey="vues" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" name="Vues" />
                          <Area type="monotone" dataKey="demandes" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary)/0.1)" name="Demandes" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" />Taux d'occupation</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={occupancyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                          <Tooltip formatter={(value) => [`${value}%`, "Taux"]} />
                          <Line type="monotone" dataKey="taux" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Properties */}
                <Card>
                  <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Meilleures performances</CardTitle></CardHeader>
                  <CardContent>
                    {myProperties.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">Aucune annonce</p>
                    ) : (
                      <div className="space-y-3">
                        {myProperties.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((p, i) => (
                          <div key={p.id} className="flex items-center gap-3 md:gap-4 p-2.5 md:p-3 bg-muted/50 rounded-lg">
                            <span className="font-bold text-primary w-5 text-sm">#{i + 1}</span>
                            <img src={p.image} alt={p.title} className="w-14 h-10 md:w-16 md:h-12 object-cover rounded-md" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate text-sm">{p.title}</p>
                              <p className="text-xs text-muted-foreground">{p.quartier}, {p.location}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="font-semibold text-foreground text-sm">{p.viewCount || 0} vues</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3 text-amber-500" /> {p.rating}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── REVENUE ─── */}
            {activeTab === "revenue" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" />Revenus mensuels</CardTitle></CardHeader>
                    <CardContent>
                      {revenueChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={revenueChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`, "Revenus"]} />
                            <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center py-12 text-muted-foreground">Aucun paiement enregistré</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg">Résumé financier</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <p className="text-sm text-muted-foreground">Revenus totaux</p>
                        <p className="text-xl md:text-2xl font-bold text-primary">{totalRevenue.toLocaleString()} FCFA</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Paiements reçus</p>
                        <p className="text-lg md:text-xl font-bold text-foreground">{payments.length}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Contrats actifs</p>
                        <p className="text-lg md:text-xl font-bold text-foreground">{activeContracts}</p>
                      </div>
                      <Button className="w-full" variant="outline" asChild>
                        <Link to="/paiements">Voir les paiements <ChevronRight className="h-4 w-4 ml-2" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ─── PROPERTIES ─── */}
            {activeTab === "properties" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><Home className="h-5 w-5 text-primary" />Par type</CardTitle></CardHeader>
                    <CardContent>
                      {typeChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <PieChart>
                            <Pie data={typeChartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                              {typeChartData.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-12 text-muted-foreground">Aucune donnée</p>}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" />Par ville</CardTitle></CardHeader>
                    <CardContent>
                      {cityChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={cityChartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--secondary))" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : <p className="text-center py-12 text-muted-foreground">Aucune donnée</p>}
                    </CardContent>
                  </Card>
                </div>

                {/* Properties List */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base md:text-lg">Mes annonces</CardTitle>
                    <Button size="sm" variant="outline" asChild><Link to="/publier"><Plus className="h-4 w-4 mr-1" /> Ajouter</Link></Button>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                    ) : myProperties.length === 0 ? (
                      <div className="text-center py-8">
                        <Home className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-3 text-sm">Aucune annonce publiée</p>
                        <Button size="sm" asChild><Link to="/publier">Publier une annonce</Link></Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {myProperties.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 p-2.5 md:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <img src={p.image} alt={p.title} className="w-16 h-11 md:w-20 md:h-14 object-cover rounded-md" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground truncate text-sm">{p.title}</p>
                                {p.verified && <Badge className="bg-primary text-primary-foreground text-[10px]">Vérifié</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{p.quartier}, {p.location}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="font-semibold text-primary text-sm">{p.price.toLocaleString()} FCFA</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{p.viewCount || 0}</span>
                                <span className="flex items-center gap-0.5"><Star className="h-3 w-3" />{p.rating}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" asChild><Link to={`/bien/${p.id}`}><Eye className="h-4 w-4" /></Link></Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ─── ACTIVITY ─── */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" />Demandes de visite ({pendingVisits})</CardTitle></CardHeader>
                    <CardContent>
                      {visits.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">Aucune demande</p>
                      ) : (
                        <div className="space-y-2">
                          {visits.slice(0, 5).map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${v.status === "pending" ? "bg-amber-500" : v.status === "confirmed" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                                <div>
                                  <p className="text-xs md:text-sm font-medium text-foreground">{format(new Date(v.scheduled_at), "dd MMM yyyy à HH:mm", { locale: fr })}</p>
                                  <p className="text-[10px] md:text-xs text-muted-foreground">{v.message || "Pas de message"}</p>
                                </div>
                              </div>
                              <Badge variant={v.status === "pending" ? "secondary" : "default"} className="text-[10px]">
                                {v.status === "pending" ? "En attente" : "Confirmée"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-base md:text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Contrats récents</CardTitle></CardHeader>
                    <CardContent>
                      {contracts.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">Aucun contrat</p>
                      ) : (
                        <div className="space-y-2">
                          {contracts.slice(0, 5).map((c) => (
                            <div key={c.id} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                              <div>
                                <p className="text-xs md:text-sm font-medium text-foreground">{c.monthly_rent.toLocaleString()} FCFA/mois</p>
                                <p className="text-[10px] md:text-xs text-muted-foreground">{c.start_date} → {c.end_date}</p>
                              </div>
                              <Badge className={c.status === "active" ? "bg-primary/10 text-primary border-0" : c.status === "pending" ? "bg-amber-100 text-amber-700 border-0" : "bg-muted text-muted-foreground border-0"} >
                                {c.status === "active" ? "Actif" : c.status === "pending" ? "En attente" : c.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button className="w-full mt-4" variant="outline" size="sm" asChild>
                        <Link to="/contrats">Voir tous les contrats <ChevronRight className="h-4 w-4 ml-1" /></Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardOwner;
