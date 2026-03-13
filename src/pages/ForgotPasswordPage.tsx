import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Email envoyé !</h1>
          <p className="text-muted-foreground">
            Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation sous quelques minutes.
          </p>
          <Button asChild variant="outline" className="h-12">
            <Link to="/connexion"><ArrowLeft className="h-4 w-4 mr-2" /> Retour à la connexion</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <Home className="h-7 w-7 text-primary" />
            LOCABENIN
          </Link>
          <h1 className="font-display text-3xl font-bold text-foreground mt-6 mb-2">Mot de passe oublié</h1>
          <p className="text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="nom@exemple.com" className="pl-10 h-12" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <Button className="w-full h-12 text-base" type="submit" disabled={loading}>
            {loading ? "Envoi..." : "Envoyer le lien"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link to="/connexion" className="text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
