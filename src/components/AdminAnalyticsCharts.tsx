import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Users, DollarSign, Shield, Clock, FileCheck, Download, CalendarIcon, FileSpreadsheet, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportToPDF } from "@/lib/pdfExport";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  registrationTrends: { month: string; users: number; growth: number; date: Date }[];
  monthlyRevenue: { month: string; revenue: number; date: Date }[];
  kycStats: { status: string; count: number; color: string }[];
  roleDistribution: { role: string; count: number; color: string }[];
}

interface RawData {
  profiles: { created_at: string }[];
  payments: { amount: number; period_month: number; period_year: number; created_at: string }[];
  kyc: { status: string; created_at: string }[];
  roles: { role: string }[];
}

export function AdminAnalyticsCharts() {
  const [rawData, setRawData] = useState<RawData>({
    profiles: [],
    payments: [],
    kyc: [],
    roles: [],
  });
  const [loading, setLoading] = useState(true);
  
  // Date filters
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 11));
  const [endDate, setEndDate] = useState<Date>(new Date());

  useEffect(() => {
    loadRawData();
  }, []);

  const loadRawData = async () => {
    setLoading(true);
    try {
      const [profilesRes, paymentsRes, kycRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("created_at"),
        supabase.from("payments").select("amount, period_month, period_year, created_at"),
        supabase.from("kyc_verifications").select("status, created_at"),
        supabase.from("user_roles").select("role"),
      ]);

      setRawData({
        profiles: profilesRes.data || [],
        payments: paymentsRes.data || [],
        kyc: kycRes.data || [],
        roles: rolesRes.data || [],
      });
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Process data based on date filters
  const data = useMemo<AnalyticsData>(() => {
    const start = startOfMonth(startDate);
    const end = endOfMonth(endDate);

    // Generate months array
    const months: { date: Date; key: string }[] = [];
    let current = new Date(start);
    while (current <= end) {
      months.push({
        date: new Date(current),
        key: format(current, "MMM yy", { locale: fr }),
      });
      current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    }

    // Registration trends
    const registrationTrends = months.map((m, i) => {
      const count = rawData.profiles.filter(p => {
        const pDate = new Date(p.created_at);
        return pDate.getMonth() === m.date.getMonth() && pDate.getFullYear() === m.date.getFullYear();
      }).length;

      const prevCount = i > 0 ? months[i - 1] : null;
      let prevUsers = 0;
      if (prevCount) {
        prevUsers = rawData.profiles.filter(p => {
          const pDate = new Date(p.created_at);
          return pDate.getMonth() === prevCount.date.getMonth() && pDate.getFullYear() === prevCount.date.getFullYear();
        }).length;
      }
      const growth = prevUsers > 0 ? Math.round(((count - prevUsers) / prevUsers) * 100) : 0;

      return { month: m.key, users: count, growth, date: m.date };
    });

    // Monthly revenue
    const monthlyRevenue = months.map(m => {
      const revenue = rawData.payments
        .filter(p => {
          const pDate = new Date(p.created_at);
          return pDate.getMonth() === m.date.getMonth() && pDate.getFullYear() === m.date.getFullYear();
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      return { month: m.key, revenue, date: m.date };
    });

    // KYC stats (within date range)
    const filteredKyc = rawData.kyc.filter(k => {
      const kDate = new Date(k.created_at);
      return isWithinInterval(kDate, { start, end });
    });

    const kycCounts = { pending: 0, approved: 0, rejected: 0 };
    filteredKyc.forEach(k => {
      if (k.status === "pending") kycCounts.pending++;
      else if (k.status === "approved") kycCounts.approved++;
      else if (k.status === "rejected") kycCounts.rejected++;
    });

    const kycStats = [
      { status: "En attente", count: kycCounts.pending, color: "hsl(var(--chart-3))" },
      { status: "Approuvées", count: kycCounts.approved, color: "hsl(var(--chart-2))" },
      { status: "Rejetées", count: kycCounts.rejected, color: "hsl(var(--destructive))" },
    ];

    // Role distribution (current, not filtered by date)
    const roleCounts = { locataire: 0, proprietaire: 0, admin: 0 };
    rawData.roles.forEach(r => {
      if (r.role in roleCounts) {
        roleCounts[r.role as keyof typeof roleCounts]++;
      }
    });

    const roleDistribution = [
      { role: "Locataires", count: roleCounts.locataire, color: "hsl(var(--primary))" },
      { role: "Propriétaires", count: roleCounts.proprietaire, color: "hsl(var(--chart-1))" },
      { role: "Admins", count: roleCounts.admin, color: "hsl(var(--chart-4))" },
    ];

    return { registrationTrends, monthlyRevenue, kycStats, roleDistribution };
  }, [rawData, startDate, endDate]);

  // Export functions
  const handleExportCSV = (type: "registrations" | "revenue" | "all") => {
    const dateRange = `${format(startDate, "dd-MM-yyyy")}_${format(endDate, "dd-MM-yyyy")}`;
    
    if (type === "registrations" || type === "all") {
      exportToCSV(
        data.registrationTrends,
        `inscriptions_${dateRange}`,
        [
          { key: "month", label: "Mois" },
          { key: "users", label: "Inscriptions" },
          { key: "growth", label: "Croissance (%)" },
        ]
      );
    }
    
    if (type === "revenue" || type === "all") {
      exportToCSV(
        data.monthlyRevenue,
        `revenus_${dateRange}`,
        [
          { key: "month", label: "Mois" },
          { key: "revenue", label: "Revenus (FCFA)" },
        ]
      );
    }

    if (type === "all") {
      // KYC stats
      exportToCSV(
        data.kycStats,
        `kyc_stats_${dateRange}`,
        [
          { key: "status", label: "Statut" },
          { key: "count", label: "Nombre" },
        ]
      );
      // Role distribution
      exportToCSV(
        data.roleDistribution,
        `roles_${dateRange}`,
        [
          { key: "role", label: "Rôle" },
          { key: "count", label: "Nombre" },
        ]
      );
    }
  };

  const handleExportPDF = () => {
    const dateRange = `du ${format(startDate, "dd/MM/yyyy")} au ${format(endDate, "dd/MM/yyyy")}`;
    
    // Create combined report
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport Analytics - LOCABENIN</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; font-size: 28px; margin-bottom: 8px; }
          h2 { color: #444; font-size: 18px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
          .subtitle { color: #666; font-size: 14px; margin-bottom: 30px; }
          table { border-collapse: collapse; width: 100%; margin-bottom: 25px; }
          th { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 12px 8px; text-align: left; font-weight: 600; }
          td { border: 1px solid #dee2e6; padding: 10px 8px; }
          tr:nth-child(even) { background-color: #fafafa; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .kpi { background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; }
          .kpi-value { font-size: 24px; font-weight: bold; color: #1a1a1a; }
          .kpi-label { font-size: 12px; color: #666; margin-top: 5px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>📊 Rapport Analytics</h1>
        <p class="subtitle">Période: ${dateRange} | Généré le ${format(new Date(), "dd/MM/yyyy à HH:mm", { locale: fr })}</p>
        
        <div class="kpi-grid">
          <div class="kpi">
            <div class="kpi-value">${data.registrationTrends.reduce((s, t) => s + t.users, 0)}</div>
            <div class="kpi-label">Inscriptions</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${(data.monthlyRevenue.reduce((s, r) => s + r.revenue, 0) / 1000).toFixed(0)}k FCFA</div>
            <div class="kpi-label">Revenus</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${Math.round((data.kycStats.find(k => k.status === "Approuvées")?.count || 0) / Math.max(1, data.kycStats.reduce((s, k) => s + k.count, 0)) * 100)}%</div>
            <div class="kpi-label">Taux KYC</div>
          </div>
          <div class="kpi">
            <div class="kpi-value">${data.kycStats.find(k => k.status === "En attente")?.count || 0}</div>
            <div class="kpi-label">KYC en attente</div>
          </div>
        </div>

        <h2>📈 Inscriptions mensuelles</h2>
        <table>
          <thead><tr><th>Mois</th><th>Inscriptions</th><th>Croissance</th></tr></thead>
          <tbody>
            ${data.registrationTrends.map(t => `<tr><td>${t.month}</td><td>${t.users}</td><td>${t.growth > 0 ? '+' : ''}${t.growth}%</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>💰 Revenus mensuels</h2>
        <table>
          <thead><tr><th>Mois</th><th>Revenus (FCFA)</th></tr></thead>
          <tbody>
            ${data.monthlyRevenue.map(r => `<tr><td>${r.month}</td><td>${r.revenue.toLocaleString()}</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>🛡️ Statistiques KYC</h2>
        <table>
          <thead><tr><th>Statut</th><th>Nombre</th></tr></thead>
          <tbody>
            ${data.kycStats.map(k => `<tr><td>${k.status}</td><td>${k.count}</td></tr>`).join('')}
          </tbody>
        </table>

        <h2>👥 Distribution des rôles</h2>
        <table>
          <thead><tr><th>Rôle</th><th>Nombre</th></tr></thead>
          <tbody>
            ${data.roleDistribution.map(r => `<tr><td>${r.role}</td><td>${r.count}</td></tr>`).join('')}
          </tbody>
        </table>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const totalUsers = data.registrationTrends.reduce((sum, t) => sum + t.users, 0);
  const totalRevenue = data.monthlyRevenue.reduce((sum, r) => sum + r.revenue, 0);
  const latestGrowth = data.registrationTrends[data.registrationTrends.length - 1]?.growth || 0;
  const kycRate = data.kycStats.length > 0 
    ? Math.round((data.kycStats.find(k => k.status === "Approuvées")?.count || 0) / 
        Math.max(1, data.kycStats.reduce((sum, k) => sum + k.count, 0)) * 100)
    : 0;
  const pendingKyc = data.kycStats.find(k => k.status === "En attente")?.count || 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Export */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Période:</span>
              
              {/* Start Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(startDate, "dd MMM yyyy", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date > endDate || date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              <span className="text-muted-foreground">→</span>

              {/* End Date */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(endDate, "dd MMM yyyy", { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date < startDate || date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>

              {/* Quick presets */}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate(subMonths(new Date(), 2));
                    setEndDate(new Date());
                  }}
                >
                  3 mois
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate(subMonths(new Date(), 5));
                    setEndDate(new Date());
                  }}
                >
                  6 mois
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartDate(subMonths(new Date(), 11));
                    setEndDate(new Date());
                  }}
                >
                  12 mois
                </Button>
              </div>
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Export CSV
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportCSV("registrations")}>
                    Inscriptions uniquement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportCSV("revenue")}>
                    Revenus uniquement
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportCSV("all")}>
                    Tout exporter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="default" size="sm" className="gap-2" onClick={handleExportPDF}>
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inscriptions</p>
                <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              </div>
              <div className={`flex items-center gap-1 ${latestGrowth >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                {latestGrowth >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">{latestGrowth}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-1/5 to-chart-1/10 border-chart-1/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-foreground">{(totalRevenue / 1000).toFixed(0)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-chart-1/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/5 to-chart-2/10 border-chart-2/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taux KYC approuvé</p>
                <p className="text-2xl font-bold text-foreground">{kycRate}%</p>
              </div>
              <Shield className="h-8 w-8 text-chart-2/40" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/5 to-chart-3/10 border-chart-3/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KYC en attente</p>
                <p className="text-2xl font-bold text-foreground">{pendingKyc}</p>
              </div>
              <Clock className="h-8 w-8 text-chart-3/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" />
              Tendance des inscriptions
            </CardTitle>
            <CardDescription>Évolution mensuelle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.registrationTrends}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorUsers)"
                    name="Inscriptions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-5 w-5 text-chart-1" />
              Revenus mensuels
            </CardTitle>
            <CardDescription>Paiements collectés par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} FCFA`, "Revenus"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Revenus" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* KYC Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-5 w-5 text-chart-2" />
              Répartition KYC
            </CardTitle>
            <CardDescription>Statut des vérifications d'identité</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {data.kycStats.reduce((sum, k) => sum + k.count, 0) === 0 ? (
                <p className="text-muted-foreground text-sm">Aucune demande KYC dans cette période</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.kycStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="status"
                    >
                      {data.kycStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" />
              Distribution des rôles
            </CardTitle>
            <CardDescription>Répartition des utilisateurs par type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {data.roleDistribution.reduce((sum, r) => sum + r.count, 0) === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun utilisateur</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="role"
                    >
                      {data.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
