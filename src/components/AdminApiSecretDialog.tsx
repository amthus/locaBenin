import { useState, useEffect } from "react";
import { Key, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ApiSecretData {
  id?: string;
  key_name: string;
  key_value: string;
  description: string;
  is_active: boolean;
}

interface AdminApiSecretDialogProps {
  secret: ApiSecretData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: ApiSecretData) => Promise<boolean>;
  mode: "create" | "edit";
}

export function AdminApiSecretDialog({ secret, open, onOpenChange, onSave, mode }: AdminApiSecretDialogProps) {
  const [saving, setSaving] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [formData, setFormData] = useState<ApiSecretData>({
    key_name: "",
    key_value: "",
    description: "",
    is_active: true,
  });

  useEffect(() => {
    if (secret && mode === "edit") {
      setFormData({
        id: secret.id,
        key_name: secret.key_name,
        key_value: secret.key_value,
        description: secret.description || "",
        is_active: secret.is_active,
      });
    } else if (mode === "create") {
      setFormData({
        key_name: "",
        key_value: "",
        description: "",
        is_active: true,
      });
    }
    setShowValue(false);
  }, [secret, mode, open]);

  const handleSave = async () => {
    if (!formData.key_name.trim() || !formData.key_value.trim()) return;
    
    setSaving(true);
    const success = await onSave(formData);
    setSaving(false);
    
    if (success) {
      onOpenChange(false);
    }
  };

  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            {isCreate ? "Nouvelle clé API" : "Modifier la clé API"}
          </DialogTitle>
          <DialogDescription>
            {isCreate 
              ? "Ajoutez une nouvelle clé API ou secret de configuration."
              : "Modifiez les informations de cette clé API."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key_name">Nom de la clé *</Label>
            <Input
              id="key_name"
              value={formData.key_name}
              onChange={(e) => setFormData({ ...formData, key_name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") })}
              placeholder="RESEND_API_KEY"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">Format: MAJUSCULES_AVEC_UNDERSCORE</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_value">Valeur *</Label>
            <div className="relative">
              <Input
                id="key_value"
                type={showValue ? "text" : "password"}
                value={formData.key_value}
                onChange={(e) => setFormData({ ...formData, key_value: e.target.value })}
                placeholder="sk_live_..."
                className="pr-10 font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setShowValue(!showValue)}
              >
                {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Clé API pour l'envoi d'emails transactionnels..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="is_active">Clé active</Label>
              <p className="text-xs text-muted-foreground">Désactivez pour suspendre temporairement</p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.key_name.trim() || !formData.key_value.trim()}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isCreate ? "Créer" : "Sauvegarder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
