import { useState, useRef, useEffect } from "react";
import { Upload, FileCheck, Clock, XCircle, Loader2, Camera, FileImage, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type KycStatus = "none" | "pending" | "approved" | "rejected";
type DocumentType = "cni" | "passport" | "permis" | "autre";

interface KycData {
  id?: string;
  document_type: DocumentType;
  document_url: string;
  document_back_url?: string;
  selfie_url?: string;
  status: KycStatus;
  rejection_reason?: string;
  submitted_at?: string;
}

const docTypeLabels: Record<DocumentType, string> = {
  cni: "Carte Nationale d'Identité",
  passport: "Passeport",
  permis: "Permis de conduire",
  autre: "Autre document officiel",
};

export const KycUpload = () => {
  const { user } = useAuth();
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<DocumentType>("cni");
  const [docFront, setDocFront] = useState<File | null>(null);
  const [docBack, setDocBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  // Load existing KYC on mount
  useEffect(() => {
    if (!user) return;
    
    const loadKyc = async () => {
      try {
        const { data, error } = await supabase
          .from("kyc_verifications" as any)
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (data && !error) {
          setKyc(data as unknown as KycData);
        }
      } catch {
        // No KYC found
      } finally {
        setLoading(false);
      }
    };
    
    loadKyc();
  }, [user]);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { error } = await supabase.storage.from("kyc-documents").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("kyc-documents").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user || !docFront) {
      toast({ title: "Erreur", description: "Veuillez sélectionner le recto de votre document.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const timestamp = Date.now();
      const frontUrl = await uploadFile(docFront, `${user.id}/front-${timestamp}.${docFront.name.split('.').pop()}`);
      let backUrl: string | undefined;
      let selfieUrl: string | undefined;

      if (docBack) {
        backUrl = await uploadFile(docBack, `${user.id}/back-${timestamp}.${docBack.name.split('.').pop()}`);
      }
      if (selfie) {
        selfieUrl = await uploadFile(selfie, `${user.id}/selfie-${timestamp}.${selfie.name.split('.').pop()}`);
      }

      const kycData = {
        user_id: user.id,
        document_type: docType,
        document_url: frontUrl,
        document_back_url: backUrl || null,
        selfie_url: selfieUrl || null,
        status: "pending" as const,
        submitted_at: new Date().toISOString(),
      };

      if (kyc?.id) {
        await supabase.from("kyc_verifications" as any).update(kycData as any).eq("id", kyc.id);
      } else {
        await supabase.from("kyc_verifications" as any).insert(kycData as any);
      }

      setKyc({ ...kycData, status: "pending" } as KycData);
      setDocFront(null);
      setDocBack(null);
      setSelfie(null);

      toast({ title: "Documents soumis", description: "Votre demande de vérification est en cours d'examen." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Already verified
  if (kyc?.status === "approved") {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="h-6 w-6 text-emerald-600" />
          <h3 className="font-display font-semibold text-emerald-800 dark:text-emerald-200">Identité vérifiée</h3>
        </div>
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Votre identité a été vérifiée avec succès. Le badge de confiance est actif sur votre profil.
        </p>
        <Badge className="mt-3 bg-emerald-600 text-white">
          <FileCheck className="h-3 w-3 mr-1" /> Vérifié
        </Badge>
      </div>
    );
  }

  // Pending verification
  if (kyc?.status === "pending") {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-6 w-6 text-amber-600" />
          <h3 className="font-display font-semibold text-amber-800 dark:text-amber-200">Vérification en cours</h3>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Votre demande de vérification est en cours d'examen par notre équipe. Vous serez notifié dès qu'elle sera traitée.
        </p>
        <p className="text-xs text-amber-600 mt-2">
          Document: {docTypeLabels[kyc.document_type as DocumentType]} • Soumis le {new Date(kyc.submitted_at!).toLocaleDateString("fr-FR")}
        </p>
      </div>
    );
  }

  // Rejected - allow resubmit
  if (kyc?.status === "rejected") {
    return (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="h-6 w-6 text-destructive" />
            <h3 className="font-display font-semibold text-destructive">Vérification refusée</h3>
          </div>
          <p className="text-sm text-destructive/80">
            {kyc.rejection_reason || "Votre demande de vérification n'a pas été acceptée. Veuillez soumettre de nouveaux documents."}
          </p>
        </div>
        <KycForm
          docType={docType}
          setDocType={setDocType}
          docFront={docFront}
          setDocFront={setDocFront}
          docBack={docBack}
          setDocBack={setDocBack}
          selfie={selfie}
          setSelfie={setSelfie}
          frontRef={frontRef}
          backRef={backRef}
          selfieRef={selfieRef}
          onSubmit={handleSubmit}
          uploading={uploading}
        />
      </div>
    );
  }

  // No KYC yet
  return (
    <div className="space-y-4">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground">Pourquoi vérifier votre identité ?</h4>
            <p className="text-sm text-muted-foreground mt-1">
              La vérification KYC renforce la confiance entre utilisateurs, vous donne accès à plus de fonctionnalités et affiche un badge de confiance sur votre profil.
            </p>
          </div>
        </div>
      </div>

      <KycForm
        docType={docType}
        setDocType={setDocType}
        docFront={docFront}
        setDocFront={setDocFront}
        docBack={docBack}
        setDocBack={setDocBack}
        selfie={selfie}
        setSelfie={setSelfie}
        frontRef={frontRef}
        backRef={backRef}
        selfieRef={selfieRef}
        onSubmit={handleSubmit}
        uploading={uploading}
      />
    </div>
  );
};

// Form component
const KycForm = ({
  docType, setDocType,
  docFront, setDocFront,
  docBack, setDocBack,
  selfie, setSelfie,
  frontRef, backRef, selfieRef,
  onSubmit, uploading
}: {
  docType: DocumentType;
  setDocType: (v: DocumentType) => void;
  docFront: File | null;
  setDocFront: (f: File | null) => void;
  docBack: File | null;
  setDocBack: (f: File | null) => void;
  selfie: File | null;
  setSelfie: (f: File | null) => void;
  frontRef: React.RefObject<HTMLInputElement>;
  backRef: React.RefObject<HTMLInputElement>;
  selfieRef: React.RefObject<HTMLInputElement>;
  onSubmit: () => void;
  uploading: boolean;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Type de document</Label>
      <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
        <SelectTrigger className="h-12">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
          <SelectItem value="passport">Passeport</SelectItem>
          <SelectItem value="permis">Permis de conduire</SelectItem>
          <SelectItem value="autre">Autre document officiel</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Recto */}
      <div className="space-y-2">
        <Label>Recto du document *</Label>
        <div
          onClick={() => frontRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-primary ${
            docFront ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          {docFront ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <FileImage className="h-5 w-5" />
              <span className="text-sm truncate">{docFront.name}</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Cliquez pour télécharger</p>
            </>
          )}
        </div>
        <input
          ref={frontRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setDocFront(e.target.files?.[0] || null)}
        />
      </div>

      {/* Verso */}
      <div className="space-y-2">
        <Label>Verso du document</Label>
        <div
          onClick={() => backRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-primary ${
            docBack ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          {docBack ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <FileImage className="h-5 w-5" />
              <span className="text-sm truncate">{docBack.name}</span>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Optionnel</p>
            </>
          )}
        </div>
        <input
          ref={backRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setDocBack(e.target.files?.[0] || null)}
        />
      </div>

      {/* Selfie */}
      <div className="space-y-2">
        <Label>Selfie avec document</Label>
        <div
          onClick={() => selfieRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:border-primary ${
            selfie ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          {selfie ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Camera className="h-5 w-5" />
              <span className="text-sm truncate">{selfie.name}</span>
            </div>
          ) : (
            <>
              <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Optionnel</p>
            </>
          )}
        </div>
        <input
          ref={selfieRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setSelfie(e.target.files?.[0] || null)}
        />
      </div>
    </div>

    <Button onClick={onSubmit} disabled={uploading || !docFront} className="w-full h-12">
      {uploading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Envoi en cours...
        </>
      ) : (
        <>
          <Upload className="h-4 w-4 mr-2" />
          Soumettre ma demande de vérification
        </>
      )}
    </Button>
  </div>
);

export default KycUpload;
