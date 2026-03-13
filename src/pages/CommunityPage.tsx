import { useState } from "react";
import { Send, Search, Users, Hash, Smile, Image, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ReputationBadge from "@/components/ReputationBadge";
import Navbar from "@/components/Navbar";

const channels = [
  { id: "general", name: "Général", unread: 3 },
  { id: "cotonou", name: "Cotonou", unread: 0 },
  { id: "calavi", name: "Abomey-Calavi", unread: 1 },
  { id: "conseils", name: "Conseils location", unread: 0 },
  { id: "avis", name: "Avis & témoignages", unread: 5 },
];

const communityMessages = [
  { id: "1", author: "Kodjo A.", initials: "KA", score: 4.8, verified: true, text: "Bienvenue à tous les nouveaux membres ! N'hésitez pas à poser vos questions ici 🎉", time: "10:30", channel: "general" },
  { id: "2", author: "Aïcha M.", initials: "AM", score: 4.5, verified: true, text: "Quelqu'un connaît un bon quartier calme à Cotonou avec peu de risque d'inondation ?", time: "10:45", channel: "general" },
  { id: "3", author: "Yves D.", initials: "YD", score: 4.2, verified: false, text: "Haie Vive et Akpakpa sont des bons choix. Fidjrossè aussi si tu veux la proximité plage !", time: "10:48", channel: "general" },
  { id: "4", author: "Grâce H.", initials: "GH", score: 4.6, verified: true, text: "Rappel : la commission d'agence ne doit JAMAIS dépasser 50% du loyer mensuel. C'est la loi ! 💪", time: "11:00", channel: "general" },
  { id: "5", author: "Paul K.", initials: "PK", score: 3.8, verified: false, text: "Merci pour l'info ! J'ai failli payer 100% de commission la semaine dernière...", time: "11:05", channel: "general" },
  { id: "6", author: "Marie B.", initials: "MB", score: 4.0, verified: false, text: "La fonctionnalité de caution sécurisée est vraiment top. J'ai récupéré ma caution en 48h 🙌", time: "11:15", channel: "general" },
];

const CommunityPage = () => {
  const [selectedChannel, setSelectedChannel] = useState("general");
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount] = useState(42);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 h-screen flex">
        {/* Sidebar - Channels */}
        <div className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Communauté
            </h2>
            <p className="text-xs text-muted-foreground">{onlineCount} membres en ligne</p>
          </div>

          <div className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-9 h-8 text-xs" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            <p className="text-xs font-semibold text-muted-foreground px-2 mb-2 uppercase tracking-wider">Salons</p>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                  selectedChannel === ch.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Hash className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{ch.name}</span>
                {ch.unread > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px] h-5 min-w-5 flex items-center justify-center">
                    {ch.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">{channels.find(c => c.id === selectedChannel)?.name}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {onlineCount} en ligne
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {communityMessages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 group hover:bg-muted/30 -mx-2 px-2 py-1 rounded-lg transition-colors">
                <Avatar className="w-9 h-9 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{m.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-foreground text-sm">{m.author}</span>
                    <ReputationBadge score={m.score} reviews={0} verified={m.verified} size="sm" />
                    <span className="text-xs text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="text-sm text-foreground/90">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder={`Écrire dans #${channels.find(c => c.id === selectedChannel)?.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="h-11 pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button className="text-muted-foreground hover:text-foreground p-1"><Smile className="h-4 w-4" /></button>
                  <button className="text-muted-foreground hover:text-foreground p-1"><Image className="h-4 w-4" /></button>
                  <button className="text-muted-foreground hover:text-foreground p-1"><AtSign className="h-4 w-4" /></button>
                </div>
              </div>
              <Button size="icon" className="h-11 w-11"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
