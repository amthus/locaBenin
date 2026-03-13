import { useState, useEffect } from "react";
import { 
  Users, AlertTriangle, DollarSign, Shield, Eye, Search, 
  CheckCircle, XCircle, Settings, FileText, MessageSquare, Bell, Ban, UserCheck, 
  Trash2, Edit, RefreshCw, Globe, LayoutDashboard, 
  Phone, Calendar, MapPin, Building, CreditCard, Loader2, X as XIcon, Image, Plus, History, CheckCheck, FileCheck, Clock, User, Key, EyeOff, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar, sidebarItems } from "@/components/AdminSidebar";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { SettingDialog, SettingData } from "@/components/SettingDialog";
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { useReports } from "@/hooks/useReports";
import { exportToCSV, exportToPDF } from "@/lib/pdfExport";
import { AdminPropertyDialog } from "@/components/AdminPropertyDialog";
import { AdminContractDialog } from "@/components/AdminContractDialog";
import { useAdminKyc } from "@/hooks/useAdminKyc";
import { Textarea } from "@/components/ui/textarea";
import { useAdminApiSecrets } from "@/hooks/useAdminApiSecrets";
import { AdminUserDialog } from "@/components/AdminUserDialog";
import { AdminApiSecretDialog } from "@/components/AdminApiSecretDialog";
import { AdminAnalyticsCharts } from "@/components/AdminAnalyticsCharts";
import { AdminAlertSettings } from "@/components/AdminAlertSettings";

// ─── Types ───────────────────────────────────────────────────────
interface DBUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  is_verified: boolean;
  created_at: string;
  role: string;
}

interface DBProperty {
  id: string;
  title: string;
  city: string;
  type: string;
  price: number;
  is_published: boolean;
  is_verified: boolean;
  owner_id: string;
  created_at: string;
  view_count: number;
  images: string[];
}

const actionLabels: Record<string, string> = {
  verify_user: "Vérification utilisateur",
  unverify_user: "Dé-vérification utilisateur",
  verify_property: "Vérification annonce",
  unverify_property: "Dé-vérification annonce",
  publish_property: "Publication annonce",
  unpublish_property: "Dé-publication annonce",
  delete_property: "Suppression annonce",
  create_setting: "Création paramètre",
  update_setting: "Mise à jour paramètre",
  delete_setting: "Suppression paramètre",
};

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  const [loading, setLoading] = useState(true);

  // Data
  const [users, setUsers] = useState<DBUser[]>([]);
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalProperties: 0, totalPayments: 0, totalContracts: 0 });
  
  // Filters
  const [userSearch, setUserSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [propertyStatusFilter, setPropertyStatusFilter] = useState("all");
  
  // Settings
  const { settings, loading: settingsLoading, saveSetting, deleteSetting } = usePlatformSettings();
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SettingData | null>(null);

  // Activity logs
  const { logs, loading: logsLoading, logActivity, refresh: refreshLogs } = useActivityLogs();
  
  // Notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  // Reports
  const { reports, loading: reportsLoading, updateReportStatus, refresh: refreshReports } = useReports();

  // KYC
  const { requests: kycRequests, stats: kycStats, loading: kycLoading, approveKyc, rejectKyc, refresh: refreshKyc } = useAdminKyc();
  const [kycFilter, setKycFilter] = useState("all");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Selected user for detail/edit
  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userDialogMode, setUserDialogMode] = useState<"view" | "edit" | "create">("view");

  // Property dialog state
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<DBProperty | null>(null);
  const [propertyDialogMode, setPropertyDialogMode] = useState<"view" | "edit" | "create">("view");

  // Contract dialog state
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // API Secrets
  const { secrets, loading: secretsLoading, createSecret, updateSecret, deleteSecret, toggleActive, refresh: refreshSecrets } = useAdminApiSecrets();
  const [apiSecretDialogOpen, setApiSecretDialogOpen] = useState(false);
  const [selectedApiSecret, setSelectedApiSecret] = useState<any>(null);
  const [apiSecretDialogMode, setApiSecretDialogMode] = useState<"create" | "edit">("create");
  const [showSecretValues, setShowSecretValues] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      
      const mergedUsers: DBUser[] = (profiles || []).map(p => {
        const r = (roles || []).find((r: any) => r.user_id === p.user_id);
        return {
          id: p.user_id,
          email: "",
          full_name: p.full_name || "Sans nom",
          phone: p.phone,
          avatar_url: p.avatar_url,
          city: p.city,
          is_verified: p.is_verified || false,
          created_at: p.created_at,
          role: r?.role || "locataire",
        };
      });
      setUsers(mergedUsers);

      const { data: props } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      setProperties((props || []) as any);

      const { data: pays } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      setPayments(pays || []);

      const { data: conts } = await supabase.from("contracts").select("*").order("created_at", { ascending: false });
      setContracts(conts || []);

      setStats({
        totalUsers: mergedUsers.length,
        totalProperties: (props || []).length,
        totalPayments: (pays || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        totalContracts: (conts || []).length,
      });
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Actions with logging ─────────────────────────────────────────
  const handleVerifyUser = async (userId: string, verified: boolean) => {
    const targetUser = users.find(u => u.id === userId);
    await supabase.from("profiles").update({ is_verified: verified }).eq("user_id", userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: verified } : u));
    toast({ title: verified ? "Utilisateur vérifié" : "Vérification retirée" });
    
    await logActivity(
      verified ? "verify_user" : "unverify_user",
      "user",
      userId,
      { user_name: targetUser?.full_name }
    );
  };

  const handleVerifyProperty = async (propId: string, verified: boolean) => {
    const targetProp = properties.find(p => p.id === propId);
    await supabase.from("properties").update({ is_verified: verified }).eq("id", propId);
    setProperties(prev => prev.map(p => p.id === propId ? { ...p, is_verified: verified } : p));
    toast({ title: verified ? "Annonce vérifiée" : "Vérification retirée" });
    
    await logActivity(
      verified ? "verify_property" : "unverify_property",
      "property",
      propId,
      { property_title: targetProp?.title }
    );
  };

  const handleTogglePublish = async (propId: string, published: boolean) => {
    const targetProp = properties.find(p => p.id === propId);
    await supabase.from("properties").update({ is_published: published }).eq("id", propId);
    setProperties(prev => prev.map(p => p.id === propId ? { ...p, is_published: published } : p));
    toast({ title: published ? "Annonce publiée" : "Annonce dépubliée" });
    
    await logActivity(
      published ? "publish_property" : "unpublish_property",
      "property",
      propId,
      { property_title: targetProp?.title }
    );
  };

  const handleDeleteProperty = async (propId: string) => {
    const targetProp = properties.find(p => p.id === propId);
    await supabase.from("properties").delete().eq("id", propId);
    setProperties(prev => prev.filter(p => p.id !== propId));
    toast({ title: "Annonce supprimée" });
    
    await logActivity(
      "delete_property",
      "property",
      propId,
      { property_title: targetProp?.title }
    );
  };

  // ─── Filter logic ──────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || u.id.includes(userSearch);
    const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(propertySearch.toLowerCase()) || p.city.toLowerCase().includes(propertySearch.toLowerCase());
    const matchesStatus = propertyStatusFilter === "all" 
      || (propertyStatusFilter === "published" && p.is_published) 
      || (propertyStatusFilter === "draft" && !p.is_published)
      || (propertyStatusFilter === "verified" && p.is_verified);
    return matchesSearch && matchesStatus;
  });

  // ─── Chart data ────────────────────────────────────────────────
  const usersByRole = [
    { name: "Locataires", value: users.filter(u => u.role === "locataire").length, color: "hsl(var(--primary))" },
    { name: "Propriétaires", value: users.filter(u => u.role === "proprietaire").length, color: "hsl(var(--secondary))" },
    { name: "Admins", value: users.filter(u => u.role === "admin").length, color: "hsl(var(--destructive))" },
  ];

  const propertyByType = properties.reduce((acc: Record<string, number>, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {});

  const propertyChartData = Object.entries(propertyByType).map(([name, value]) => ({ name, value }));

  const paymentsByMonth = payments.reduce((acc: Record<string, number>, p: any) => {
    const key = `${p.period_year}-${String(p.period_month).padStart(2, "0")}`;
    acc[key] = (acc[key] || 0) + p.amount;
    return acc;
  }, {});

  const paymentChartData = Object.entries(paymentsByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du panneau d'administration...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <h2 className="hidden lg:block font-display text-xl font-bold text-foreground">
                  {sidebarItems.find(i => i.id === activeTab)?.label || "Administration"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Actualiser
                </Button>
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  <Globe className="h-3 w-3 mr-1" /> En ligne
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {/* ─── OVERVIEW ────────────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { icon: Users, label: "Utilisateurs", value: stats.totalUsers.toString(), color: "bg-primary/10 text-primary" },
                    { icon: Building, label: "Annonces", value: stats.totalProperties.toString(), color: "bg-secondary/10 text-secondary" },
                    { icon: DollarSign, label: "Revenus totaux", value: `${(stats.totalPayments / 1000).toFixed(0)}k FCFA`, color: "bg-amber-500/10 text-amber-600" },
                    { icon: FileText, label: "Contrats", value: stats.totalContracts.toString(), color: "bg-emerald-500/10 text-emerald-600" },
                    { icon: FileCheck, label: "KYC en attente", value: kycStats.pending.toString(), color: "bg-orange-500/10 text-orange-600", onClick: () => setActiveTab("kyc") },
                  ].map((kpi) => (
                    <div 
                      key={kpi.label} 
                      className={`bg-card p-5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow ${(kpi as any).onClick ? 'cursor-pointer' : ''}`}
                      onClick={(kpi as any).onClick}
                    >
                      <div className={`w-10 h-10 rounded-lg ${kpi.color} flex items-center justify-center mb-3`}>
                        <kpi.icon className="h-5 w-5" />
                      </div>
                      <p className="font-display text-2xl font-bold text-foreground">{kpi.value}</p>
                      <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    </div>
                  ))}
                </div>

                {/* KYC Stats Card */}
                {kycStats.total > 0 && (
                  <div className="bg-card p-6 rounded-xl border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        Statistiques KYC
                      </h3>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("kyc")}>
                        Gérer les demandes
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                        <p className="text-2xl font-bold text-foreground">{kycStats.pending}</p>
                        <p className="text-xs text-muted-foreground">En attente</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <CheckCircle className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
                        <p className="text-2xl font-bold text-foreground">{kycStats.approved}</p>
                        <p className="text-xs text-muted-foreground">Approuvées</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <XCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
                        <p className="text-2xl font-bold text-foreground">{kycStats.rejected}</p>
                        <p className="text-xs text-muted-foreground">Rejetées</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="font-display font-semibold text-foreground mb-4">Répartition des utilisateurs</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={usersByRole} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {usersByRole.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-card p-6 rounded-xl border border-border">
                    <h3 className="font-display font-semibold text-foreground mb-4">Annonces par type</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={propertyChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {paymentChartData.length > 0 && (
                    <div className="bg-card p-6 rounded-xl border border-border lg:col-span-2">
                      <h3 className="font-display font-semibold text-foreground mb-4">Revenus mensuels</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={paymentChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(value: number) => [`${value.toLocaleString()} FCFA`, "Revenus"]} />
                          <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.1)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="font-display font-semibold text-foreground mb-4">Activité récente</h3>
                  <div className="space-y-3">
                    {properties.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{p.title}</p>
                            <p className="text-xs text-muted-foreground">{p.city} • {new Date(p.created_at).toLocaleDateString("fr-FR")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.is_published ? (
                            <Badge className="bg-primary/10 text-primary border-0">Publiée</Badge>
                          ) : (
                            <Badge variant="secondary">Brouillon</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── ANALYTICS ───────────────────────────────────── */}
            {activeTab === "analytics" && (
              <AdminAnalyticsCharts />
            )}

            {/* ─── USERS ───────────────────────────────────────── */}
            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Rechercher un utilisateur..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="locataire">Locataires</SelectItem>
                        <SelectItem value="proprietaire">Propriétaires</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedUser(null);
                        setUserDialogMode("create");
                        setUserDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Nouvel utilisateur
                    </Button>
                    <Badge variant="secondary">{filteredUsers.length} utilisateur(s)</Badge>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Utilisateur</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rôle</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Ville</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Vérifié</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Inscription</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {u.avatar_url && <AvatarImage src={u.avatar_url} />}
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {u.full_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-foreground">{u.full_name}</p>
                                  <p className="text-xs text-muted-foreground">{u.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{u.city || "—"}</td>
                            <td className="py-3 px-4">
                              {u.is_verified ? (
                                <CheckCircle className="h-4 w-4 text-primary" />
                              ) : (
                                <XCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">
                              {new Date(u.created_at).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleVerifyUser(u.id, !u.is_verified)}
                                  title={u.is_verified ? "Retirer vérification" : "Vérifier"}
                                >
                                  {u.is_verified ? <XIcon className="h-3.5 w-3.5 text-destructive" /> : <UserCheck className="h-3.5 w-3.5 text-primary" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setUserDialogMode("view");
                                    setUserDialogOpen(true);
                                  }}
                                  title="Voir détails"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setUserDialogMode("edit");
                                    setUserDialogOpen(true);
                                  }}
                                  title="Modifier"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsers.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">Aucun utilisateur trouvé.</div>
                  )}
                </div>

                <AdminUserDialog
                  user={selectedUser}
                  open={userDialogOpen}
                  onOpenChange={setUserDialogOpen}
                  onSave={loadData}
                  mode={userDialogMode}
                />
              </div>
            )}

            {/* ─── PROPERTIES ──────────────────────────────────── */}
            {activeTab === "properties" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Rechercher une annonce..." value={propertySearch} onChange={e => setPropertySearch(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={propertyStatusFilter} onValueChange={setPropertyStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        <SelectItem value="published">Publiées</SelectItem>
                        <SelectItem value="draft">Brouillons</SelectItem>
                        <SelectItem value="verified">Vérifiées</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => {
                        setSelectedProperty(null);
                        setPropertyDialogMode("create");
                        setPropertyDialogOpen(true);
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Nouvelle annonce
                    </Button>
                    <Badge variant="secondary">{filteredProperties.length} annonce(s)</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProperties.map(p => (
                    <div key={p.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                      <div 
                        className="h-32 bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => {
                          setSelectedProperty(p as any);
                          setPropertyDialogMode("view");
                          setPropertyDialogOpen(true);
                        }}
                      >
                        {p.images && p.images.length > 0 ? (
                          <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedProperty(p as any);
                            setPropertyDialogMode("view");
                            setPropertyDialogOpen(true);
                          }}
                        >
                          <h4 className="font-semibold text-foreground text-sm truncate">{p.title}</h4>
                          <p className="text-xs text-muted-foreground">{p.city} • {p.type} • {p.price.toLocaleString()} FCFA/mois</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {p.is_published ? (
                            <Badge className="bg-primary/10 text-primary border-0 text-xs">Publiée</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Brouillon</Badge>
                          )}
                          {p.is_verified && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Vérifiée</Badge>}
                          <Badge variant="outline" className="text-xs"><Eye className="h-3 w-3 mr-1" />{p.view_count || 0}</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedProperty(p as any);
                                setPropertyDialogMode("view");
                                setPropertyDialogOpen(true);
                              }}
                              title="Aperçu"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedProperty(p as any);
                                setPropertyDialogMode("edit");
                                setPropertyDialogOpen(true);
                              }}
                              title="Modifier"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleVerifyProperty(p.id, !p.is_verified)} title={p.is_verified ? "Retirer vérification" : "Vérifier"}>
                              {p.is_verified ? <XIcon className="h-3.5 w-3.5 text-amber-600" /> : <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                            </Button>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(p.id, !p.is_published)} title={p.is_published ? "Dépublier" : "Publier"}>
                              {p.is_published ? <Ban className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteProperty(p.id)} className="text-destructive hover:text-destructive" title="Supprimer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredProperties.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground bg-card rounded-xl border border-border">Aucune annonce trouvée.</div>
                )}

                <AdminPropertyDialog
                  property={selectedProperty as any}
                  open={propertyDialogOpen}
                  onOpenChange={setPropertyDialogOpen}
                  onSave={loadData}
                  mode={propertyDialogMode}
                />
              </div>
            )}

            {/* ─── KYC VERIFICATIONS ──────────────────────────────── */}
            {activeTab === "kyc" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Select value={kycFilter} onValueChange={setKycFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes ({kycStats.total})</SelectItem>
                        <SelectItem value="pending">En attente ({kycStats.pending})</SelectItem>
                        <SelectItem value="approved">Approuvées ({kycStats.approved})</SelectItem>
                        <SelectItem value="rejected">Rejetées ({kycStats.rejected})</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={refreshKyc}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-lg">
                      <p className="text-lg font-bold">{kycStats.pending}</p>
                      <p className="text-[10px]">En attente</p>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1.5 rounded-lg">
                      <p className="text-lg font-bold">{kycStats.approved}</p>
                      <p className="text-[10px]">Approuvées</p>
                    </div>
                    <div className="bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg">
                      <p className="text-lg font-bold">{kycStats.rejected}</p>
                      <p className="text-[10px]">Rejetées</p>
                    </div>
                  </div>
                </div>

                {kycLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Utilisateur</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Document</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Statut</th>
                            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                            <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kycRequests
                            .filter(k => kycFilter === "all" || k.status === kycFilter)
                            .map((kyc) => (
                            <tr key={kyc.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {kyc.profile?.avatar_url && <AvatarImage src={kyc.profile.avatar_url} />}
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                      {kyc.profile?.full_name?.charAt(0) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-foreground">{kyc.profile?.full_name || "Utilisateur"}</p>
                                    <p className="text-xs text-muted-foreground">{kyc.profile?.phone || kyc.user_id.slice(0, 8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="capitalize">{kyc.document_type}</Badge>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewImage(kyc.document_url)} title="Voir recto">
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    {kyc.document_back_url && (
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewImage(kyc.document_back_url!)} title="Voir verso">
                                        <Eye className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                    {kyc.selfie_url && (
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setPreviewImage(kyc.selfie_url!)} title="Voir selfie">
                                        <User className="h-3.5 w-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {kyc.status === "pending" && (
                                  <Badge className="bg-orange-500/10 text-orange-600 border-0">
                                    <Clock className="h-3 w-3 mr-1" /> En attente
                                  </Badge>
                                )}
                                {kyc.status === "approved" && (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                                    <CheckCircle className="h-3 w-3 mr-1" /> Approuvé
                                  </Badge>
                                )}
                                {kyc.status === "rejected" && (
                                  <Badge className="bg-destructive/10 text-destructive border-0">
                                    <XCircle className="h-3 w-3 mr-1" /> Rejeté
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-4 text-muted-foreground text-xs">
                                {kyc.submitted_at ? formatDistanceToNow(new Date(kyc.submitted_at), { addSuffix: true, locale: fr }) : "—"}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-end gap-1">
                                  {kyc.status === "pending" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                        onClick={() => approveKyc(kyc.id, kyc.user_id)}
                                        title="Approuver"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                          setSelectedKyc(kyc);
                                          setRejectDialogOpen(true);
                                        }}
                                        title="Rejeter"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {kyc.status === "rejected" && kyc.rejection_reason && (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" title="Voir motif">
                                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Motif du rejet</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-muted-foreground">{kyc.rejection_reason}</p>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {kycRequests.filter(k => kycFilter === "all" || k.status === kycFilter).length === 0 && (
                      <div className="py-12 text-center text-muted-foreground">Aucune demande KYC trouvée.</div>
                    )}
                  </div>
                )}

                {/* Reject Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Rejeter la demande KYC</DialogTitle>
                      <DialogDescription>
                        Veuillez indiquer le motif du rejet. L'utilisateur sera notifié.
                      </DialogDescription>
                    </DialogHeader>
                    <Textarea
                      placeholder="Ex: Document illisible, photo floue, document expiré..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Annuler</Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          if (selectedKyc && rejectReason.trim()) {
                            rejectKyc(selectedKyc.id, selectedKyc.user_id, rejectReason);
                            setRejectDialogOpen(false);
                            setRejectReason("");
                            setSelectedKyc(null);
                          }
                        }}
                        disabled={!rejectReason.trim()}
                      >
                        Confirmer le rejet
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Image Preview Dialog */}
                <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Aperçu du document</DialogTitle>
                    </DialogHeader>
                    {previewImage && (
                      <img src={previewImage} alt="Document KYC" className="w-full rounded-lg" />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* ─── PAYMENTS ────────────────────────────────────── */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card p-5 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground">Total perçu</p>
                    <p className="font-display text-2xl font-bold text-foreground">{stats.totalPayments.toLocaleString()} FCFA</p>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground">Paiements</p>
                    <p className="font-display text-2xl font-bold text-foreground">{payments.length}</p>
                  </div>
                  <div className="bg-card p-5 rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground">Moy. / paiement</p>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {payments.length > 0 ? Math.round(stats.totalPayments / payments.length).toLocaleString() : "0"} FCFA
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Référence</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Montant</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Période</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Méthode</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Statut</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p: any) => (
                          <tr key={p.id} className="border-b border-border hover:bg-muted/30">
                            <td className="py-3 px-4 text-foreground font-mono text-xs">{p.reference || p.id.slice(0, 8)}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{p.amount.toLocaleString()} FCFA</td>
                            <td className="py-3 px-4 text-muted-foreground">{p.period_month}/{p.period_year}</td>
                            <td className="py-3 px-4"><Badge variant="secondary" className="text-xs">{p.payment_method || "—"}</Badge></td>
                            <td className="py-3 px-4">
                              <Badge className={p.status === "completed" ? "bg-primary/10 text-primary border-0" : "bg-amber-100 text-amber-700 border-0"}>
                                {p.status === "completed" ? "Payé" : p.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">{new Date(p.payment_date).toLocaleDateString("fr-FR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {payments.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">Aucun paiement enregistré.</div>
                  )}
                </div>
              </div>
            )}

            {/* ─── CONTRACTS ───────────────────────────────────── */}
            {activeTab === "contracts" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total", value: contracts.length, color: "text-foreground" },
                    { label: "Actifs", value: contracts.filter((c: any) => c.status === "active").length, color: "text-primary" },
                    { label: "En attente", value: contracts.filter((c: any) => c.status === "pending").length, color: "text-amber-600" },
                    { label: "Terminés", value: contracts.filter((c: any) => c.status === "completed").length, color: "text-muted-foreground" },
                  ].map(s => (
                    <div key={s.label} className="bg-card p-4 rounded-xl border border-border text-center">
                      <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Loyer</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Période</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Signatures</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Statut</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contracts.map((c: any) => (
                          <tr key={c.id} className="border-b border-border hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono text-xs text-foreground">{c.id.slice(0, 8)}</td>
                            <td className="py-3 px-4 font-semibold text-foreground">{c.monthly_rent?.toLocaleString()} FCFA</td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">{c.start_date} → {c.end_date}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Badge variant={c.signed_by_owner ? "default" : "secondary"} className="text-xs">
                                  Proprio {c.signed_by_owner ? "✓" : "✗"}
                                </Badge>
                                <Badge variant={c.signed_by_tenant ? "default" : "secondary"} className="text-xs">
                                  Locataire {c.signed_by_tenant ? "✓" : "✗"}
                                </Badge>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                c.status === "active" ? "bg-primary/10 text-primary border-0" :
                                c.status === "pending" ? "bg-amber-100 text-amber-700 border-0" :
                                "bg-muted text-muted-foreground border-0"
                              }>
                                {c.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedContract(c);
                                    setContractDialogOpen(true);
                                  }}
                                  title="Voir le détail"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                {c.document_url && (
                                  <Button variant="ghost" size="sm" asChild title="Télécharger le PDF">
                                    <a href={c.document_url} target="_blank" rel="noopener noreferrer">
                                      <FileText className="h-3.5 w-3.5" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {contracts.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">Aucun contrat.</div>
                  )}
                </div>

                <AdminContractDialog
                  contract={selectedContract}
                  open={contractDialogOpen}
                  onOpenChange={setContractDialogOpen}
                />
              </div>
            )}

            {/* ─── MESSAGES ────────────────────────────────────── */}
            {activeTab === "messages" && (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display font-semibold text-foreground mb-2">Centre de messagerie</h3>
                <p className="text-muted-foreground text-sm mb-4">Supervision des conversations de la plateforme.</p>
                <Button onClick={() => navigate("/messages")}>Voir les messages</Button>
              </div>
            )}

            {/* ─── REPORTS ─────────────────────────────────────── */}
            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" /> Signalements ({reports.length})
                  </h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => exportToCSV(reports.map(r => ({
                      id: r.id,
                      reason: r.reason,
                      status: r.status,
                      property: r.property?.title || "-",
                      created_at: new Date(r.created_at).toLocaleDateString("fr-FR"),
                    })), "signalements", [
                      { key: "id", label: "ID" },
                      { key: "reason", label: "Motif" },
                      { key: "status", label: "Statut" },
                      { key: "property", label: "Annonce" },
                      { key: "created_at", label: "Date" },
                    ])}>
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportToPDF(reports.map(r => ({
                      reason: r.reason,
                      status: r.status,
                      property: r.property?.title || "-",
                      created_at: new Date(r.created_at).toLocaleDateString("fr-FR"),
                    })), "Signalements", [
                      { key: "reason", label: "Motif" },
                      { key: "status", label: "Statut" },
                      { key: "property", label: "Annonce" },
                      { key: "created_at", label: "Date" },
                    ])}>
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={refreshReports}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
                    </Button>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {reportsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucun signalement</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {reports.map((report) => (
                        <div key={report.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                report.status === "pending" ? "bg-amber-100 text-amber-700" :
                                report.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                                report.status === "rejected" ? "bg-muted text-muted-foreground" :
                                "bg-primary/10 text-primary"
                              }`}>
                                <AlertTriangle className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    report.status === "pending" ? "bg-amber-100 text-amber-800" :
                                    report.status === "resolved" ? "bg-emerald-100 text-emerald-800" :
                                    report.status === "rejected" ? "bg-muted text-muted-foreground" :
                                    "bg-primary/10 text-primary"
                                  }`}>
                                    {report.status === "pending" ? "En attente" :
                                     report.status === "resolved" ? "Résolu" :
                                     report.status === "rejected" ? "Rejeté" : report.status}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                    {report.reason}
                                  </span>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                  Annonce: {report.property?.title || "Inconnue"}
                                </p>
                                {report.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatDistanceToNow(new Date(report.created_at), { addSuffix: true, locale: fr })}
                                </p>
                              </div>
                            </div>
                            {report.status === "pending" && (
                              <div className="flex gap-2 shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  onClick={() => updateReportStatus(report.id, "resolved")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Résoudre
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-muted-foreground"
                                  onClick={() => updateReportStatus(report.id, "rejected")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" /> Rejeter
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── NOTIFICATIONS ──────────────────────────────── */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" /> Notifications ({unreadCount} non lues)
                  </h3>
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      <CheckCheck className="h-4 w-4 mr-2" /> Tout marquer comme lu
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="bg-card rounded-xl border border-border p-8 text-center">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`bg-card rounded-xl border p-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-muted/30 ${
                          n.is_read ? "border-border" : "border-primary/50 bg-primary/5"
                        }`}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          n.type === "success" ? "bg-emerald-100 text-emerald-700" :
                          n.type === "warning" ? "bg-amber-100 text-amber-700" :
                          n.type === "error" ? "bg-destructive/10 text-destructive" :
                          "bg-primary/10 text-primary"
                        }`}>
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-foreground text-sm">{n.title}</h4>
                            {!n.is_read && <Badge variant="destructive" className="text-xs">Nouveau</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ─── ACTIVITY LOGS ──────────────────────────────── */}
            {activeTab === "activity" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" /> Logs d'activité
                  </h3>
                  <Button variant="outline" size="sm" onClick={refreshLogs}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
                  </Button>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {logsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune activité enregistrée</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {logs.map((log) => (
                        <div key={log.id} className="p-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <History className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {actionLabels[log.action] || log.action}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {log.entity_type}
                                </Badge>
                              </div>
                              <p className="text-sm text-foreground mt-1">
                                {log.details?.user_name && `Utilisateur: ${log.details.user_name}`}
                                {log.details?.property_title && `Annonce: ${log.details.property_title}`}
                                {log.details?.setting_key && `Paramètre: ${log.details.setting_key}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                                {" • "}
                                <span className="font-mono">{log.entity_id?.slice(0, 8) || "—"}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── ALERTS ──────────────────────────────────────── */}
            {activeTab === "alerts" && (
              <AdminAlertSettings />
            )}

            {/* ─── API & SECRETS ────────────────────────────────── */}
            {activeTab === "api" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" /> Clés API & Secrets
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gérez les clés API et secrets de configuration pour les services externes.
                    </p>
                  </div>
                  <Button onClick={() => { setSelectedApiSecret(null); setApiSecretDialogMode("create"); setApiSecretDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Nouvelle clé
                  </Button>
                </div>

                {/* Info card */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">Sécurité des secrets</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Les valeurs sont stockées de manière sécurisée et ne sont visibles qu'aux administrateurs. 
                        Utilisez ces clés dans les Edge Functions via <code className="text-xs bg-muted px-1 py-0.5 rounded">Deno.env.get()</code>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {secretsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nom</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Valeur</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Statut</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {secrets.map((s) => (
                          <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono font-medium text-xs text-foreground">{s.key_name}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground max-w-[150px] truncate">
                                  {showSecretValues[s.id] ? s.key_value : "••••••••••••"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setShowSecretValues(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                >
                                  {showSecretValues[s.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(s.key_value);
                                    toast({ title: "Copié", description: "La valeur a été copiée dans le presse-papier." });
                                  }}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground truncate max-w-[200px]">{s.description || "—"}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={s.is_active}
                                  onCheckedChange={(checked) => toggleActive(s.id, checked)}
                                  className="scale-75"
                                />
                                <span className={`text-xs ${s.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                                  {s.is_active ? "Active" : "Inactive"}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedApiSecret(s);
                                    setApiSecretDialogMode("edit");
                                    setApiSecretDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Supprimer cette clé API ?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Cette action supprimera définitivement la clé <strong>{s.key_name}</strong>. 
                                        Les services utilisant cette clé ne fonctionneront plus.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteSecret(s.id, s.key_name)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {!secretsLoading && secrets.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">
                      <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p>Aucune clé API configurée.</p>
                      <p className="text-xs mt-1">Cliquez sur "Nouvelle clé" pour ajouter une clé API.</p>
                    </div>
                  )}
                </div>

                {/* Common API keys helper */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h4 className="font-semibold text-foreground mb-4">Clés API courantes</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: "RESEND_API_KEY", desc: "Envoi d'emails transactionnels" },
                      { name: "STRIPE_SECRET_KEY", desc: "Paiements en ligne" },
                      { name: "OPENAI_API_KEY", desc: "Intelligence artificielle" },
                      { name: "TWILIO_AUTH_TOKEN", desc: "SMS et notifications" },
                      { name: "GOOGLE_MAPS_KEY", desc: "Cartes et géolocalisation" },
                      { name: "FIREBASE_KEY", desc: "Notifications push" },
                    ].map((key) => (
                      <div
                        key={key.name}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedApiSecret({ key_name: key.name, key_value: "", description: key.desc, is_active: true });
                          setApiSecretDialogMode("create");
                          setApiSecretDialogOpen(true);
                        }}
                      >
                        <div>
                          <p className="font-mono text-xs font-medium text-foreground">{key.name}</p>
                          <p className="text-xs text-muted-foreground">{key.desc}</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>

                <AdminApiSecretDialog
                  secret={selectedApiSecret}
                  open={apiSecretDialogOpen}
                  onOpenChange={setApiSecretDialogOpen}
                  onSave={async (data) => {
                    if (apiSecretDialogMode === "create") {
                      return await createSecret({ key_name: data.key_name, key_value: data.key_value, description: data.description });
                    } else if (data.id) {
                      return await updateSecret(data.id, { key_name: data.key_name, key_value: data.key_value, description: data.description, is_active: data.is_active });
                    }
                    return false;
                  }}
                  mode={apiSecretDialogMode}
                />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" /> Paramètres personnalisés
                  </h3>
                  <Button onClick={() => { setSelectedSetting(null); setSettingDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Ajouter
                  </Button>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  {settingsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Clé</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Valeur</th>
                          <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                          <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {settings.map((s) => (
                          <tr key={s.id} className="border-b border-border hover:bg-muted/30">
                            <td className="py-3 px-4 font-mono font-medium text-xs">{s.key}</td>
                            <td className="py-3 px-4 text-foreground truncate max-w-[200px]">{s.value}</td>
                            <td className="py-3 px-4 text-muted-foreground truncate max-w-[300px]">{s.description || "—"}</td>
                            <td className="py-3 px-4 text-right">
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedSetting(s); setSettingDialogOpen(true); }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { if(window.confirm('Confirmer la suppression?')) deleteSetting(s.id!); }} className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {!settingsLoading && settings.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground">Aucun paramètre configuré.</div>
                  )}
                </div>

                <SettingDialog
                  open={settingDialogOpen}
                  onOpenChange={setSettingDialogOpen}
                  setting={selectedSetting}
                  onSave={saveSetting}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPage;
