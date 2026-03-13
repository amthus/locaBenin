import { useState, useRef } from "react";
import { Camera, MapPin, Info, Upload, Tag, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCreateProperty, useUploadPropertyImages } from "@/hooks/useProperties";
import { useNavigate } from "react-router-dom";

const PublishPage = () => {
  const [step, setStep] = useState(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [accepted, setAccepted] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewFiles, setPreviewFiles] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("1");
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [quartier, setQuartier] = useState("");
  const [floodRisk, setFloodRisk] = useState("faible");
  const [noiseLevel, setNoiseLevel] = useState("calme");
  const [availableFrom, setAvailableFrom] = useState("");

  const createProperty = useCreateProperty();
  const uploadImages = useUploadPropertyImages();

  const allFeatures = ["Carrelage neuf", "Cuisine équipée", "Eau courante", "Électricité SBEE", "Parking", "Meublé", "Internet fibre", "Gardien 24h", "Climatisation", "Eau chaude", "Jardin", "Piscine", "Groupe électrogène", "Citerne d'eau", "Terrasse"];

  const toggleFeature = (f: string) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPreviewFiles(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setPreviewFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePublish = async () => {
    // Upload images first
    let imageUrls = uploadedImages;
    if (previewFiles.length > 0) {
      const files = previewFiles.map(p => p.file);
      const urls = await uploadImages.mutateAsync(files);
      imageUrls = [...imageUrls, ...urls];
      setUploadedImages(imageUrls);
    }

    await createProperty.mutateAsync({
      title,
      type,
      price: Number(price),
      deposit: Number(deposit),
      area: area ? Number(area) : undefined,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      city,
      quartier: quartier || undefined,
      description: description || undefined,
      flood_risk: floodRisk,
      noise_level: noiseLevel,
      features,
      images: imageUrls,
      available_from: availableFrom || undefined,
    });

    navigate("/espace-proprietaire");
  };

  const isStep1Valid = title && type && price && deposit;
  const isStep2Valid = city;
  const isPublishing = createProperty.isPending || uploadImages.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">Publier une annonce</h1>
          <p className="text-muted-foreground mb-8">Processus en 5 étapes pour publier votre bien.</p>

          {/* Steps indicator */}
          <div className="flex items-center gap-1 mb-10 overflow-x-auto pb-2">
            {[
              { n: 1, label: "Infos" },
              { n: 2, label: "Localisation" },
              { n: 3, label: "Équipements" },
              { n: 4, label: "Photos" },
              { n: 5, label: "Validation" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {step > s.n ? <CheckCircle className="h-4 w-4" /> : s.n}
                </div>
                <span className={`text-xs hidden sm:inline ${step >= s.n ? "text-primary font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                {s.n < 5 && <div className={`w-6 h-0.5 ${step > s.n ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> Informations du bien
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre de l'annonce *</Label>
                  <Input id="title" placeholder="Ex: Bel appartement 3 pièces à Akpakpa" className="h-12" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type de bien *</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appartement">Appartement</SelectItem>
                        <SelectItem value="maison">Maison</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Surface (m²)</Label>
                    <Input id="area" type="number" placeholder="65" className="h-12" value={area} onChange={e => setArea(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Chambres</Label>
                    <Input id="bedrooms" type="number" placeholder="2" className="h-12" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Salles de bain</Label>
                    <Input id="bathrooms" type="number" placeholder="1" className="h-12" value={bathrooms} onChange={e => setBathrooms(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Loyer mensuel (FCFA) *</Label>
                    <Input id="price" type="number" placeholder="85000" className="h-12" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">Caution (FCFA) *</Label>
                  <Input id="deposit" type="number" placeholder="170000" className="h-12" value={deposit} onChange={e => setDeposit(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Décrivez votre bien en détail..." rows={5} value={description} onChange={e => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button size="lg" className="h-12 px-8" onClick={() => setStep(2)} disabled={!isStep1Valid}>Suivant</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> Localisation & Environnement
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ville *</Label>
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cotonou">Cotonou</SelectItem>
                        <SelectItem value="Abomey-Calavi">Abomey-Calavi</SelectItem>
                        <SelectItem value="Porto-Novo">Porto-Novo</SelectItem>
                        <SelectItem value="Parakou">Parakou</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quartier">Quartier</Label>
                    <Input id="quartier" placeholder="Ex: Akpakpa" className="h-12" value={quartier} onChange={e => setQuartier(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risque d'inondation</Label>
                    <Select value={floodRisk} onValueChange={setFloodRisk}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="faible">Faible</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="élevé">Élevé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Niveau sonore</Label>
                    <Select value={noiseLevel} onValueChange={setNoiseLevel}>
                      <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calme">Calme</SelectItem>
                        <SelectItem value="modéré">Modéré</SelectItem>
                        <SelectItem value="bruyant">Bruyant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="available">Date de disponibilité</Label>
                  <Input id="available" type="date" className="h-12" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" size="lg" className="h-12 px-8" onClick={() => setStep(1)}>Précédent</Button>
                <Button size="lg" className="h-12 px-8" onClick={() => setStep(3)} disabled={!isStep2Valid}>Suivant</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" /> Équipements & Caractéristiques
              </h2>
              <p className="text-sm text-muted-foreground">Sélectionnez les équipements disponibles dans votre bien.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allFeatures.map((f) => (
                  <div key={f} onClick={() => toggleFeature(f)} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${features.includes(f) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <Checkbox checked={features.includes(f)} className="pointer-events-none" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {features.map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                </div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" size="lg" className="h-12 px-8" onClick={() => setStep(2)}>Précédent</Button>
                <Button size="lg" className="h-12 px-8" onClick={() => setStep(4)}>Suivant</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" /> Photos du bien
              </h2>
              <p className="text-sm text-muted-foreground">Ajoutez des photos de qualité. Les annonces avec photos reçoivent 3x plus de demandes.</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />

              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                  const newPreviews = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
                  setPreviewFiles(prev => [...prev, ...newPreviews]);
                }}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-semibold text-foreground mb-1">Glissez vos photos ici</p>
                <p className="text-sm text-muted-foreground mb-4">ou cliquez pour parcourir</p>
                <Button variant="outline" type="button">Choisir des photos</Button>
              </div>

              {previewFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {previewFiles.map((p, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-square">
                      <img src={p.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" size="lg" className="h-12 px-8" onClick={() => setStep(3)}>Précédent</Button>
                <Button size="lg" className="h-12 px-8" onClick={() => setStep(5)}>Suivant</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" /> Validation & Publication
              </h2>

              <div className="bg-card p-6 rounded-lg shadow-card space-y-4">
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                  <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">Récapitulatif</p>
                    <p className="text-sm text-muted-foreground">
                      {title} — {type} — {Number(price).toLocaleString()} FCFA/mois — {city} {quartier}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isStep1Valid ? <CheckCircle className="h-4 w-4 text-primary" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm text-foreground">Informations du bien complétées</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isStep2Valid ? <CheckCircle className="h-4 w-4 text-primary" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm text-foreground">Localisation renseignée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">Équipements sélectionnés ({features.length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {previewFiles.length > 0 ? <CheckCircle className="h-4 w-4 text-primary" /> : <Loader2 className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm text-foreground">{previewFiles.length} photo(s) ajoutée(s)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg">
                <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} />
                <span className="text-sm text-foreground">J'accepte les conditions de publication et certifie l'exactitude des informations fournies.</span>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="lg" className="h-12 px-8" onClick={() => setStep(4)}>Précédent</Button>
                <Button 
                  size="lg" 
                  className="h-12 px-8" 
                  onClick={handlePublish} 
                  disabled={!accepted || isPublishing || !isStep1Valid || !isStep2Valid}
                >
                  {isPublishing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publication...</> : "Publier l'annonce"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PublishPage;
