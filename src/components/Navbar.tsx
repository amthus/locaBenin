import { Link, useNavigate } from "react-router-dom";
import { Home, Menu, X, ChevronDown, Scale, HelpCircle, Users, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const { isAuthenticated, user, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/recherche", label: t.nav.search },
    { to: "/premium", label: t.nav.premium },
  ];

  const exploreLinks = [
    { to: "/juridique", label: "Juridique", icon: Scale, desc: "Cadre légal & droits locataires", color: "text-amber-500" },
    { to: "/aide", label: "Centre d'aide", icon: HelpCircle, desc: "FAQ & support technique", color: "text-blue-500" },
    { to: "/communaute", label: "Communauté", icon: Users, desc: "Échanges entre utilisateurs", color: "text-emerald-500" },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Home className="h-6 w-6 text-primary" />
          LOCABENIN
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-5">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </Link>
          ))}

          {/* Mega menu Explorer */}
          <div ref={exploreRef} className="relative">
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Explorer
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 rounded-xl border border-border bg-popover p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                {exploreLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setExploreOpen(false)}
                    className="group flex items-start gap-3 rounded-lg p-3 hover:bg-accent transition-all duration-200"
                  >
                    <div className={`p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                      <l.icon className={`h-5 w-5 ${l.color} transition-all duration-300 group-hover:scale-110`} />
                    </div>
                    <div className="pt-0.5">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200">{l.label}</div>
                      <div className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-200">{l.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Button size="sm" variant="outline" asChild>
                <Link to="/profil" className="gap-1.5">
                  <User className="h-4 w-4" />
                  Profil
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={getDashboardPath()} className="gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-destructive">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" asChild>
                <Link to="/connexion">{t.nav.login}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/publier">{t.nav.publish}</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-background border-b border-border px-4 pb-4 space-y-2 animate-fade-in">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}

          <button
            onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
            className="flex items-center justify-between w-full text-sm font-medium py-2"
          >
            Explorer
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileExploreOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileExploreOpen && (
            <div className="pl-3 space-y-1">
              {exploreLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => { setOpen(false); setMobileExploreOpen(false); }}
                  className="flex items-center gap-3 text-sm py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="p-1.5 rounded-md bg-muted">
                    <l.icon className={`h-4 w-4 ${l.color}`} />
                  </div>
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          <div className="py-2"><LanguageSwitcher /></div>

          {isAuthenticated ? (
            <>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link to="/profil" onClick={() => setOpen(false)}>
                  <User className="h-4 w-4 mr-2" />
                  Mon Profil
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link to={getDashboardPath()} onClick={() => setOpen(false)}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Mon Dashboard
                </Link>
              </Button>
              <Button size="sm" variant="ghost" className="w-full text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" className="w-full" asChild>
                <Link to="/connexion" onClick={() => setOpen(false)}>{t.nav.login}</Link>
              </Button>
              <Button size="sm" className="w-full" asChild>
                <Link to="/publier" onClick={() => setOpen(false)}>{t.nav.publish}</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
