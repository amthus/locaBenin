import { useState, useEffect } from "react";
import { Bell, DollarSign, Shield, Users, Mail, Save, Loader2, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AlertThresholds {
  alert_revenue_threshold: string;
  alert_kyc_pending_threshold: string;
  alert_unverified_users_threshold: string;
  alert_email_recipient: string;
  alerts_enabled: string;
}

export function AdminAlertSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    alert_revenue_threshold: "100000",
    alert_kyc_pending_threshold: "5",
    alert_unverified_users_threshold: "10",
    alert_email_recipient: "",
    alerts_enabled: "true",
  });
  const [currentValues, setCurrentValues] = useState({
    monthlyRevenue: 0,
    pendingKyc: 0,
    unverifiedUsers: 0,
  });

  useEffect(() => {
    loadSettings();
    loadCurrentValues();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", Object.keys(thresholds));

      if (data) {
        const newThresholds = { ...thresholds };
        data.forEach((s) => {
          if (s.key in newThresholds) {
            newThresholds[s.key as keyof AlertThresholds] = s.value;
          }
        });
        setThresholds(newThresholds);
      }
    } catch (err) {
      console.error("Error loading alert settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentValues = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const [paymentsRes, kycRes, profilesRes] = await Promise.all([
        supabase
          .from("payments")
          .select("amount")
          .eq("period_month", currentMonth)
          .eq("period_year", currentYear),
        supabase
          .from("kyc_verifications")
          .select("id")
          .eq("status", "pending"),
        supabase
          .from("profiles")
          .select("id")
          .eq("is_verified", false),
      ]);

      setCurrentValues({
        monthlyRevenue: (paymentsRes.data || []).reduce((sum, p) => sum + (p.amount || 0), 0),
        pendingKyc: (kycRes.data || []).length,
        unverifiedUsers: (profilesRes.data || []).length,
      });
    } catch (err) {
      console.error("Error loading current values:", err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(thresholds)) {
        await supabase
          .from("platform_settings")
          .update({ value, updated_at: new Date().toISOString() })
          .eq("key", key);
      }
      toast({ title: "Seuils sauvegardés", description: "Les paramètres d'alerte ont été mis à jour." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlerts = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-alert-thresholds", {
        body: { test: true },
      });

      if (error) throw error;

      if (data?.alerts_triggered?.length > 0) {
        toast({
          title: `${data.alerts_triggered.length} alerte(s) déclenchée(s)`,
          description: data.alerts_triggered.join(", "),
        });
      } else {
        toast({
          title: "Aucune alerte",
          description: "Tous les indicateurs sont dans les seuils définis.",
        });
      }
    } catch (err: any) {
      toast({ title: "Erreur de test", description: err.message, variant: "destructive" });
    } finally {
      setTesting(false);
    }
  };

  const isEnabled = thresholds.alerts_enabled === "true";

  const revenueThreshold = parseInt(thresholds.alert_revenue_threshold) || 0;
  const kycThreshold = parseInt(thresholds.alert_kyc_pending_threshold) || 0;
  const unverifiedThreshold = parseInt(thresholds.alert_unverified_users_threshold) || 0;

  const revenueAlert = currentValues.monthlyRevenue < revenueThreshold;
  const kycAlert = currentValues.pendingKyc > kycThreshold;
  const unverifiedAlert = currentValues.unverifiedUsers > unverifiedThreshold;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Alertes automatiques</h3>
          <p className="text-sm text-muted-foreground">
            Configurez des seuils pour recevoir des alertes par email et notifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleTestAlerts} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Tester les alertes
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Enable/Disable + Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Configuration générale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Alertes activées</Label>
              <p className="text-xs text-muted-foreground">Activer ou désactiver toutes les alertes automatiques</p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(v) =>
                setThresholds({ ...thresholds, alerts_enabled: v ? "true" : "false" })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="alert_email">Email de notification</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="alert_email"
                type="email"
                value={thresholds.alert_email_recipient}
                onChange={(e) =>
                  setThresholds({ ...thresholds, alert_email_recipient: e.target.value })
                }
                className="pl-10"
                placeholder="admin@exemple.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Laissez vide pour recevoir uniquement des notifications in-app.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-chart-3" />
            État actuel des indicateurs
          </CardTitle>
          <CardDescription>Valeurs actuelles comparées aux seuils configurés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${revenueAlert ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-chart-1" />
                {revenueAlert ? (
                  <Badge variant="destructive" className="text-xs">Alerte</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">OK</Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">Revenus ce mois</p>
              <p className="text-xl font-bold text-foreground">{currentValues.monthlyRevenue.toLocaleString()} FCFA</p>
              <p className="text-xs text-muted-foreground mt-1">Seuil: {revenueThreshold.toLocaleString()} FCFA</p>
            </div>

            <div className={`p-4 rounded-lg border ${kycAlert ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-5 w-5 text-chart-3" />
                {kycAlert ? (
                  <Badge variant="destructive" className="text-xs">Alerte</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">OK</Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">KYC en attente</p>
              <p className="text-xl font-bold text-foreground">{currentValues.pendingKyc}</p>
              <p className="text-xs text-muted-foreground mt-1">Seuil: {kycThreshold} max</p>
            </div>

            <div className={`p-4 rounded-lg border ${unverifiedAlert ? "border-destructive/50 bg-destructive/5" : "border-border bg-muted/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-primary" />
                {unverifiedAlert ? (
                  <Badge variant="destructive" className="text-xs">Alerte</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">OK</Badge>
                )}
              </div>
              <p className="text-sm font-medium text-foreground">Non vérifiés</p>
              <p className="text-xl font-bold text-foreground">{currentValues.unverifiedUsers}</p>
              <p className="text-xs text-muted-foreground mt-1">Seuil: {unverifiedThreshold} max</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threshold Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-chart-1" />
              Revenus mensuels
            </CardTitle>
            <CardDescription className="text-xs">Alerte si revenus inférieurs au seuil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="revenue_threshold">Seuil minimum (FCFA)</Label>
              <Input
                id="revenue_threshold"
                type="number"
                value={thresholds.alert_revenue_threshold}
                onChange={(e) =>
                  setThresholds({ ...thresholds, alert_revenue_threshold: e.target.value })
                }
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-chart-3" />
              KYC en attente
            </CardTitle>
            <CardDescription className="text-xs">Alerte si demandes en attente dépassent le seuil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="kyc_threshold">Seuil maximum</Label>
              <Input
                id="kyc_threshold"
                type="number"
                value={thresholds.alert_kyc_pending_threshold}
                onChange={(e) =>
                  setThresholds({ ...thresholds, alert_kyc_pending_threshold: e.target.value })
                }
                min="0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Utilisateurs non vérifiés
            </CardTitle>
            <CardDescription className="text-xs">Alerte si le nombre dépasse le seuil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="unverified_threshold">Seuil maximum</Label>
              <Input
                id="unverified_threshold"
                type="number"
                value={thresholds.alert_unverified_users_threshold}
                onChange={(e) =>
                  setThresholds({ ...thresholds, alert_unverified_users_threshold: e.target.value })
                }
                min="0"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
