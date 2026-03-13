import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, Mail, Lock, Eye, EyeOff, User, Phone, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PASSWORD_RULES = [
  { label: "Au moins 8 caractères", test: (p: string) => p.length >= 8 },
  { label: "Une lettre majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Une lettre minuscule", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
  { label: "Un caractère spécial (!@#$...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("locataire");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated, isLoading, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordChecks = useMemo(() => PASSWORD_RULES.map(r => ({ ...r, passed: r.test(password) })), [password]);
  const allPasswordValid = passwordChecks.every(c => c.passed);
  const emailValid = EMAIL_REGEX.test(email);

  if (!isLoading && isAuthenticated) {
    navigate(getDashboardPath(), { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailValid) {
      toast({ title: "Erreur", description: "Veuillez entrer une adresse email valide (ex: nom@domaine.com)", variant: "destructive" });
      return;
    }

    if (!allPasswordValid) {
      toast({ title: "Erreur", description: "Le mot de passe ne respecte pas tous les critères de sécurité", variant: "destructive" });
      return;
    }

    // Prevent admin role from being set via registration
    const safeRole: UserRole = role === "admin" ? "locataire" : role;

    setLoading(true);
    try {
      await register(email, password, `${firstname} ${lastname}`.trim(), safeRole, phone || undefined);
      toast({ 
        title: "Compte créé !", 
        description: "Vérifiez votre email pour confirmer votre inscription." 
      });
      navigate("/connexion");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 bg-primary relative items-center justify-center">
        <div className="relative z-10 text-center px-12">
          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-4">Bienvenue sur LOCABENIN</h2>
          <p className="text-primary-foreground/80 text-lg max-w-md">Annonces vérifiées, caution sécurisée, contrats digitaux. Inscrivez-vous gratuitement.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <Home className="h-7 w-7 text-primary" />
              LOCABENIN
            </Link>
            <h1 className="font-display text-3xl font-bold text-foreground mt-6 mb-2">Créer un compte</h1>
            <p className="text-muted-foreground">Inscription gratuite en 2 minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Je suis</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)} className="flex gap-4">
                <div className={`flex-1 border rounded-lg p-4 cursor-pointer transition-colors ${role === "locataire" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="locataire" id="locataire" className="sr-only" />
                  <label htmlFor="locataire" className="cursor-pointer block text-center">
                    <p className="font-semibold text-foreground">Locataire</p>
                    <p className="text-xs text-muted-foreground">Je cherche un logement</p>
                  </label>
                </div>
                <div className={`flex-1 border rounded-lg p-4 cursor-pointer transition-colors ${role === "proprietaire" ? "border-primary bg-primary/5" : "border-border"}`}>
                  <RadioGroupItem value="proprietaire" id="proprietaire" className="sr-only" />
                  <label htmlFor="proprietaire" className="cursor-pointer block text-center">
                    <p className="font-semibold text-foreground">Propriétaire</p>
                    <p className="text-xs text-muted-foreground">Je propose un bien</p>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname">Prénom</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="firstname" placeholder="Prénom" className="pl-10 h-12" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Nom</Label>
                <Input id="lastname" placeholder="Nom" className="h-12" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" placeholder="+229 01 46 87 91 42 " className="pl-10 h-12" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nom@exemple.com" 
                  className={`pl-10 h-12 ${email && !emailValid ? "border-destructive" : ""}`}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              {email && !emailValid && (
                <p className="text-xs text-destructive">Veuillez entrer une adresse email valide</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-12" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1 mt-2 p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Critères du mot de passe :</p>
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {check.passed ? (
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-destructive shrink-0" />
                      )}
                      <span className={check.passed ? "text-primary" : "text-muted-foreground"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button className="w-full h-12 text-base" type="submit" disabled={loading || !allPasswordValid || !emailValid}>
              {loading ? "Création..." : "Créer mon compte"}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              En vous inscrivant, vous acceptez nos{" "}
              <Link to="/juridique" className="text-primary hover:underline">conditions d'utilisation</Link>.
            </p>
          </form>

          <Separator />

          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/connexion" className="text-primary font-semibold hover:underline">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
