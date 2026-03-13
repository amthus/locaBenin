import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, Edit, Save, X, MapPin, Home, DollarSign, Bed, Bath, 
  Maximize, AlertTriangle, Volume2, Calendar, User, Image as ImageIcon,
  Upload, Trash2, Video, Loader2, Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Property {
  id: string;
  title: string;
  description: string | null;
  city: string;
  quartier: string | null;
  type: string;
  price: number;
  deposit: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  features: string[] | null;
  images: string[] | null;
  flood_risk: string | null;
  noise_level: string | null;
  is_published: boolean | null;
  is_verified: boolean | null;
  available_from: string | null;
  owner_id: string;
  created_at: string;
  view_count: number | null;
}

interface AdminPropertyDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  mode: "view" | "edit" | "create";
}

const propertyTypes = ["appartement", "maison", "studio", "villa"];
const floodRisks = ["faible", "moyen", "élevé"];
const noiseLevels = ["calme", "modéré", "bruyant"];

export function AdminPropertyDialog({ property, open, onOpenChange, onSave, mode: initialMode }: AdminPropertyDialogProps) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "Cotonou",
    quartier: "",
    type: "appartement",
    price: 0,
    deposit: 0,
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    features: [] as string[],
    images: [] as string[],
    flood_risk: "faible",
    noise_level: "calme",
    is_published: false,
    is_verified: false,
    available_from: new Date().toISOString().split("T")[0],
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    setMode(initialMode);
    if (property && (initialMode === "view" || initialMode === "edit")) {
      setForm({
        title: property.title || "",
        description: property.description || "",
        city: property.city || "Cotonou",
        quartier: property.quartier || "",
        type: property.type || "appartement",
        price: property.price || 0,
        deposit: property.deposit || 0,
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        area: property.area || 0,
        features: property.features || [],
        images: property.images || [],
        flood_risk: property.flood_risk || "faible",
        noise_level: property.noise_level || "calme",
        is_published: property.is_published || false,
        is_verified: property.is_verified || false,
        available_from: property.available_from || new Date().toISOString().split("T")[0],
      });
    } else if (initialMode === "create") {
      setForm({
        title: "",
        description: "",
        city: "Cotonou",
        quartier: "",
        type: "appartement",
        price: 0,
        deposit: 0,
        bedrooms: 1,
        bathrooms: 1,
        area: 0,
        features: [],
        images: [],
        flood_risk: "faible",
        noise_level: "calme",
        is_published: false,
        is_verified: false,
        available_from: new Date().toISOString().split("T")[0],
      });
    }
  }, [property, initialMode, open]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");
      
      const newImages: string[] = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        
        const { error } = await supabase.storage
          .from("property-images")
          .upload(path, file, { upsert: true });
          
        if (error) throw error;
        
        const { data } = supabase.storage.from("property-images").getPublicUrl(path);
        newImages.push(data.publicUrl);
        
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
      toast({ title: `${newImages.length} image(s) uploadée(s)` });
    } catch (err: any) {
      toast({ title: "Erreur upload", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (file.size > maxSize) {
      toast({ title: "Fichier trop volumineux", description: "La vidéo ne doit pas dépasser 50MB", variant: "destructive" });
      return;
    }
    
    setUploadingImages(true);
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");
      
      const ext = file.name.split(".").pop();
      const path = `${user.id}/videos/${crypto.randomUUID()}.${ext}`;
      
      const { error } = await supabase.storage
        .from("property-images")
        .upload(path, file, { upsert: true });
        
      if (error) throw error;
      
      const { data } = supabase.storage.from("property-images").getPublicUrl(path);
      setForm(prev => ({ ...prev, images: [...prev.images, data.publicUrl] }));
      
      toast({ title: "Vidéo uploadée avec succès" });
    } catch (err: any) {
      toast({ title: "Erreur upload vidéo", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Non authentifié");
        
        const { error } = await supabase.from("properties").insert({
          ...form,
          owner_id: user.id,
        });
        if (error) throw error;
        toast({ title: "Annonce créée avec succès" });
      } else if (mode === "edit" && property) {
        const { error } = await supabase.from("properties").update(form).eq("id", property.id);
        if (error) throw error;
        toast({ title: "Annonce mise à jour" });
      }
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !form.features.includes(newFeature.trim())) {
      setForm({ ...form, features: [...form.features, newFeature.trim()] });
      setNewFeature("");
    }
  };

  const removeFeature = (feat: string) => {
    setForm({ ...form, features: form.features.filter(f => f !== feat) });
  };

  const isReadOnly = mode === "view";
  const isVideo = (url: string) => /\.(mp4|mov|webm|avi)$/i.test(url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {mode === "view" && <Eye className="h-5 w-5" />}
              {mode === "edit" && <Edit className="h-5 w-5" />}
              {mode === "create" && <Home className="h-5 w-5" />}
              {mode === "view" ? "Aperçu de l'annonce" : mode === "edit" ? "Modifier l'annonce" : "Nouvelle annonce"}
            </span>
            {mode === "view" && property && (
              <Button variant="outline" size="sm" onClick={() => setMode("edit")}>
                <Edit className="h-4 w-4 mr-2" /> Modifier
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="location">Localisation</TabsTrigger>
              <TabsTrigger value="media">Médias</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  disabled={isReadOnly}
                  placeholder="Ex: Bel appartement à Cotonou"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  disabled={isReadOnly}
                  rows={4}
                  placeholder="Décrivez le bien..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Prix (FCFA/mois)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Caution</Label>
                  <Input
                    type="number"
                    value={form.deposit}
                    onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Bed className="h-3 w-3" /> Chambres</Label>
                  <Input
                    type="number"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Bath className="h-3 w-3" /> SdB</Label>
                  <Input
                    type="number"
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                    disabled={isReadOnly}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Maximize className="h-3 w-3" /> Surface (m²)</Label>
                <Input
                  type="number"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: Number(e.target.value) })}
                  disabled={isReadOnly}
                />
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Ville</Label>
                  <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou", "Bohicon"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quartier</Label>
                  <Input
                    value={form.quartier}
                    onChange={(e) => setForm({ ...form, quartier: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Ex: Akpakpa"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Risque inondation</Label>
                  <Select value={form.flood_risk} onValueChange={(v) => setForm({ ...form, flood_risk: v })} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {floodRisks.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Volume2 className="h-3 w-3" /> Niveau sonore</Label>
                  <Select value={form.noise_level} onValueChange={(v) => setForm({ ...form, noise_level: v })} disabled={isReadOnly}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {noiseLevels.map((n) => (
                        <SelectItem key={n} value={n} className="capitalize">{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Disponible à partir de</Label>
                <Input
                  type="date"
                  value={form.available_from}
                  onChange={(e) => setForm({ ...form, available_from: e.target.value })}
                  disabled={isReadOnly}
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              {/* Image/Video Upload Section */}
              {!isReadOnly && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/mov,video/webm"
                      className="hidden"
                      onChange={(e) => handleVideoUpload(e.target.files)}
                    />
                    
                    {uploadingImages ? (
                      <div className="space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">Upload en cours...</p>
                        <Progress value={uploadProgress} className="max-w-xs mx-auto" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Ajoutez des photos et vidéos de votre bien
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" /> Photos
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => videoInputRef.current?.click()}
                          >
                            <Video className="h-4 w-4 mr-2" /> Vidéo (max 50MB)
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Display uploaded images/videos */}
              {form.images.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" /> Médias ({form.images.length})
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group">
                        {isVideo(url) ? (
                          <video
                            src={url}
                            className="w-full h-24 object-cover rounded-lg border"
                            controls={false}
                            muted
                          />
                        ) : (
                          <img 
                            src={url} 
                            alt={`Image ${i + 1}`} 
                            className="w-full h-24 object-cover rounded-lg border" 
                          />
                        )}
                        {isVideo(url) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                        )}
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(i)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Features section */}
              <div className="space-y-2">
                <Label>Équipements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    disabled={isReadOnly}
                    placeholder="Ajouter un équipement"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  {!isReadOnly && (
                    <Button type="button" variant="secondary" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.features.map((feat) => (
                    <Badge key={feat} variant="secondary" className="flex items-center gap-1">
                      {feat}
                      {!isReadOnly && (
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeFeature(feat)} />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Publiée</span>
                  <Badge variant={form.is_published ? "default" : "secondary"}>
                    {form.is_published ? "Oui" : "Non"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Vérifiée</span>
                  <Badge variant={form.is_verified ? "default" : "secondary"}>
                    {form.is_verified ? "Oui" : "Non"}
                  </Badge>
                </div>
              </div>

              {property && (
                <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Propriétaire: {property.owner_id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{property.view_count || 0} vues</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Créée le {new Date(property.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {!isReadOnly && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={loading || !form.title || form.price <= 0}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
