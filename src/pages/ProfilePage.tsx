import { useState, useRef, useEffect } from "react";
import { User, Mail, Phone, MapPin, Shield, Camera, Star, LogOut, Save, Loader2, Bell, Globe, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import KycUpload from "@/components/KycUpload";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout, updatePassword, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [language, setLanguage] = useState("fr");

  // Reviews
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setPhone(user.phone || "");
    setAvatarUrl(user.avatarUrl || null);
    // Fetch full profile for bio/city
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setCity(data.city || "");
        setBio(data.bio || "");
      }
    });
    // Fetch reviews about this user (as property owner reviews)
    supabase.from("reviews").select("*, properties(title)").limit(10).then(({ data }) => {
      if (data) setReviews(data);
    });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl + "?t=" + Date.now();
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
      setAvatarUrl(publicUrl);
      toast({ title: "Photo mise à jour", description: "Votre avatar a été changé avec succès." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: fullName,
        phone,
        city,
        bio,
      }).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Profil sauvegardé", description: "Vos informations ont été mises à jour." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      await updatePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Mot de passe changé", description: "Votre mot de passe a été mis à jour avec succès." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = fullName
    ? fullName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const memberSince = user ? new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile header */}
          <div className="bg-card p-6 rounded-lg shadow-card mb-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                  <AvatarFallback className="bg-primary/10 text-primary font-display text-2xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-card hover:bg-primary/90 transition-colors"
                >
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-display text-2xl font-bold text-foreground">{fullName || "Mon profil"}</h1>
                <p className="text-muted-foreground capitalize">{user?.role} depuis {memberSince}</p>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  {user?.isVerified && (
                    <Badge className="bg-primary text-primary-foreground"><Shield className="h-3 w-3 mr-1" /> Vérifié</Badge>
                  )}
                  <Badge variant="secondary"><Mail className="h-3 w-3 mr-1" /> {user?.email}</Badge>
                </div>
              </div>
              <Button variant="outline" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Déconnexion
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="infos">
            <TabsList className="w-full grid grid-cols-5 mb-6">
              <TabsTrigger value="infos">Informations</TabsTrigger>
              <TabsTrigger value="kyc">Vérification</TabsTrigger>
              <TabsTrigger value="preferences">Préférences</TabsTrigger>
              <TabsTrigger value="security">Sécurité</TabsTrigger>
              <TabsTrigger value="reviews">Avis</TabsTrigger>
            </TabsList>

            {/* === KYC Tab === */}
            <TabsContent value="kyc">
              <div className="bg-card p-6 rounded-lg shadow-card space-y-6">
                <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Vérification d'identité (KYC)
                </h2>
                <p className="text-muted-foreground text-sm">
                  Soumettez vos documents d'identité pour obtenir le badge de confiance et débloquer toutes les fonctionnalités.
                </p>
                <KycUpload />
              </div>
            </TabsContent>

            {/* === Informations === */}
            <TabsContent value="infos">
              <div className="bg-card p-6 rounded-lg shadow-card space-y-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Informations personnelles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="fullname" value={fullName} onChange={e => setFullName(e.target.value)} className="pl-10 h-12" placeholder="Votre nom" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 h-12" placeholder="+229 XX XX XX XX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" value={user?.email || ""} disabled className="pl-10 h-12 opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="city" value={city} onChange={e => setCity(e.target.value)} className="pl-10 h-12" placeholder="Cotonou" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Quelques mots sur vous..." rows={3} />
                </div>
                <Button className="h-12 gap-2" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Sauvegarder
                </Button>
              </div>
            </TabsContent>

            {/* === Préférences === */}
            <TabsContent value="preferences">
              <div className="bg-card p-6 rounded-lg shadow-card space-y-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Préférences</h2>

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Notifications par email</p>
                      <p className="text-xs text-muted-foreground">Recevez les alertes par email</p>
                    </div>
                    <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Notifications SMS</p>
                      <p className="text-xs text-muted-foreground">Recevez les alertes par SMS</p>
                    </div>
                    <Switch checked={smsNotifs} onCheckedChange={setSmsNotifs} />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2"><Globe className="h-4 w-4" /> Langue</h3>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fon">Fon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="h-12" onClick={() => toast({ title: "Préférences sauvegardées" })}>
                  <Save className="h-4 w-4 mr-2" /> Sauvegarder les préférences
                </Button>
              </div>
            </TabsContent>

            {/* === Sécurité === */}
            <TabsContent value="security">
              <div className="bg-card p-6 rounded-lg shadow-card space-y-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Sécurité du compte</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input id="new-password" type="password" className="h-12" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                    <Input id="confirm-password" type="password" className="h-12" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  </div>
                  <Button className="h-12 gap-2" onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                    Changer le mot de passe
                  </Button>
                </div>

                <Separator />

                <div>
              <div className="space-y-2">
                    <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                      Vérification d'identité (KYC)
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vérifiez votre identité pour obtenir le badge de confiance et accéder à toutes les fonctionnalités.
                    </p>
                  </div>
                  <KycUpload />
                </div>
              </div>
            </TabsContent>

            {/* === Avis === */}
            <TabsContent value="reviews">
              <div className="bg-card p-6 rounded-lg shadow-card space-y-4">
                <h2 className="font-display text-xl font-semibold text-foreground">Avis reçus ({reviews.length})</h2>
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-8 text-center">Aucun avis reçu pour le moment.</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground text-sm">{(r.properties as any)?.title || "Propriété"}</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{r.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{r.comment || "Pas de commentaire."}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
