import { useState, useEffect } from "react";
import { User, Phone, MapPin, Shield, Mail, Save, Loader2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserData {
  id: string;
  full_name: string;
  phone: string | null;
  city: string | null;
  bio?: string | null;
  is_verified: boolean;
  role: string;
}

interface AdminUserDialogProps {
  user: UserData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  mode: "view" | "edit" | "create";
}

export function AdminUserDialog({ user, open, onOpenChange, onSave, mode }: AdminUserDialogProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    city: "",
    bio: "",
    is_verified: false,
    role: "locataire",
  });

  useEffect(() => {
    if (mode === "create") {
      setFormData({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        city: "",
        bio: "",
        is_verified: false,
        role: "locataire",
      });
    } else if (user) {
      setFormData({
        email: "",
        password: "",
        full_name: user.full_name || "",
        phone: user.phone || "",
        city: user.city || "",
        bio: user.bio || "",
        is_verified: user.is_verified,
        role: user.role,
      });
    }
  }, [user, mode, open]);

  const handleCreate = async () => {
    if (!formData.email || !formData.password) {
      toast({ title: "Erreur", description: "Email et mot de passe requis", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: formData.role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name,
            phone: formData.phone || null,
            city: formData.city || null,
            is_verified: formData.is_verified,
          })
          .eq("user_id", authData.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        }

        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: formData.role as any })
          .eq("user_id", authData.user.id);

        if (roleError) {
          console.error("Role update error:", roleError);
        }
      }

      toast({ title: "Utilisateur créé", description: `Un email de confirmation a été envoyé à ${formData.email}` });
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          city: formData.city || null,
          bio: formData.bio || null,
          is_verified: formData.is_verified,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      if (formData.role !== user.role) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .update({ role: formData.role as any })
          .eq("user_id", user.id);

        if (roleError) throw roleError;
      }

      toast({ title: "Utilisateur mis à jour" });
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id);

      toast({ title: "Utilisateur supprimé", description: "Le profil et les données associées ont été supprimés." });
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const isCreating = mode === "create";
  const isEditing = mode === "edit" || isCreating;

  const getTitle = () => {
    if (isCreating) return "Créer un utilisateur";
    if (mode === "edit") return "Modifier l'utilisateur";
    return "Détails de l'utilisateur";
  };

  const getDescription = () => {
    if (isCreating) return "Remplissez les informations pour créer un nouveau compte.";
    if (mode === "edit") return "Modifiez les informations de cet utilisateur.";
    return "Consultez les informations de cet utilisateur.";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isCreating && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    placeholder="email@exemple.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="pl-10"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10"
                placeholder="+229 XX XX XX XX"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Ville</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="pl-10"
                placeholder="Cotonou"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v })}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="locataire">Locataire</SelectItem>
                <SelectItem value="proprietaire">Propriétaire</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="verified">Compte vérifié</Label>
            </div>
            <Switch
              id="verified"
              checked={formData.is_verified}
              onCheckedChange={(v) => setFormData({ ...formData, is_verified: v })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {mode === "edit" && user && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement le profil de {user.full_name}. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
              {isEditing ? "Annuler" : "Fermer"}
            </Button>
            {isCreating && (
              <Button onClick={handleCreate} disabled={saving} className="flex-1 sm:flex-none">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Créer
              </Button>
            )}
            {mode === "edit" && (
              <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Sauvegarder
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
