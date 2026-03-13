import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="gap-1.5 text-xs font-medium"
    >
      <Globe className="h-3.5 w-3.5" />
      {lang === "fr" ? "EN" : "FR"}
    </Button>
  );
};

export default LanguageSwitcher;
