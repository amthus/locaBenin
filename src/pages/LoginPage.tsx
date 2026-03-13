import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, getDashboardPath, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (!isLoading && isAuthenticated) {
    navigate(getDashboardPath(), { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Connexion réussie", description: "Bienvenue sur LOCABENIN !" });
      // Wait for auth state to update, then redirect based on role
      setTimeout(() => {
        navigate(getDashboardPath(), { replace: true });
      }, 800);
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Email ou mot de passe incorrect", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground mb-2">
              <Home className="h-7 w-7 text-primary" />
              LOCABENIN
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground mt-6 mb-2">Bon retour !</h1>
            <p className="text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/mot-de-passe-oublie" className="text-sm text-primary hover:underline">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button className="w-full h-12 text-base" type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <Separator />

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link to="/inscription" className="text-primary font-semibold hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary relative items-center justify-center">
        <div className="relative z-10 text-center px-12">
          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-4">La confiance digitalisée</h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">Rejoignez la communauté LOCABENIN et louez en toute sérénité à Cotonou.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
