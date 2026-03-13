import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SettingData {
  id?: string;
  key: string;
  value: string;
  description: string | null;
}

interface SettingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setting: SettingData | null;
  onSave: (data: SettingData) => Promise<void>;
}

export function SettingDialog({ open, onOpenChange, setting, onSave }: SettingDialogProps) {
  const [formData, setFormData] = useState<SettingData>({ key: "", value: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setting) {
      setFormData(setting);
    } else {
      setFormData({ key: "", value: "", description: "" });
    }
  }, [setting, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{setting?.id ? "Modifier le paramètre" : "Ajouter un paramètre"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Clé (ex: MAX_UPLOAD_SIZE)</Label>
            <Input id="key" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} required disabled={!!setting?.id} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Valeur</Label>
            <Input id="value" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea id="description" value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}