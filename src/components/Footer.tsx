import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 font-display text-xl font-bold mb-4">
              <Home className="h-5 w-5" />
              LOCABENIN
            </div>
            <p className="text-sm opacity-70">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">{t.footer.tenant}</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/recherche" className="hover:opacity-100 transition-opacity">{t.nav.search}</Link></li>
              <li><Link to="/juridique" className="hover:opacity-100 transition-opacity">{t.nav.legal}</Link></li>
              <li><Link to="/premium" className="hover:opacity-100 transition-opacity">{t.nav.premium}</Link></li>
              <li><Link to="/aide" className="hover:opacity-100 transition-opacity">{t.nav.help}</Link></li>
              <li><Link to="/communaute" className="hover:opacity-100 transition-opacity">{t.nav.community}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">{t.footer.owner}</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/publier" className="hover:opacity-100 transition-opacity">{t.nav.publish}</Link></li>
              <li><Link to="/espace-proprietaire" className="hover:opacity-100 transition-opacity">Gestion locative</Link></li>
              <li><Link to="/maintenance" className="hover:opacity-100 transition-opacity">Maintenance</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">LOCABENIN</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to="/a-propos" className="hover:opacity-100 transition-opacity">{t.nav.about}</Link></li>
              <li><Link to="/contact" className="hover:opacity-100 transition-opacity">Contact</Link></li>
              <li>contact@locabenin.com</li>
              <li>+229 01 46 87 91 42 </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-6 text-center text-sm opacity-50">
          © 2026 LOCABENIN. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
