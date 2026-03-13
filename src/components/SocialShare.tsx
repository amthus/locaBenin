import { Share2, Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareProps {
  open: boolean;
  onClose: () => void;
  title: string;
  price: number;
  url: string;
}

const SocialShare = ({ open, onClose, title, price, url }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const formatPrice = (p: number) => new Intl.NumberFormat("fr-BJ").format(p) + " FCFA";
  const shareText = `🏠 ${title} - ${formatPrice(price)}/mois sur LOCABENIN`;

  const shareLinks = [
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + url)}`, color: "#25D366" },
    { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: "#1877F2" },
    { name: "Twitter", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`, color: "#1DA1F2" },
    { name: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`, color: "#0088CC" },
  ];

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Lien copié !", description: "Le lien a été copié dans votre presse-papiers." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> Partager cette annonce
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {shareLinks.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: s.color }}>
                  {s.name[0]}
                </div>
                <span className="text-sm font-medium text-foreground">{s.name}</span>
              </a>
            ))}
          </div>
          <Button variant="outline" className="w-full h-12" onClick={copyLink}>
            {copied ? <CheckCircle className="h-4 w-4 mr-2 text-primary" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Lien copié !" : "Copier le lien"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialShare;
