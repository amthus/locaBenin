import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const defaultResponses: Record<string, string> = {
  "bonjour": "Bonjour ! 👋 Bienvenue sur LOCABENIN. Comment puis-je vous aider aujourd'hui ? Je peux vous guider pour :\n\n• Trouver un logement\n• Publier une annonce\n• Comprendre la caution sécurisée\n• Questions juridiques",
  "caution": "La caution sécurisée LOCABENIN fonctionne ainsi :\n\n1. Vous déposez votre caution via Mobile Money\n2. L'argent est bloqué sur un compte séquestre\n3. À la fin du bail, les deux parties valident\n4. La caution est libérée automatiquement\n\nVotre argent est protégé à 100% !",
  "commission": "Selon la loi béninoise, la commission d'agence est plafonnée à 50% du loyer mensuel. Chez LOCABENIN, nous appliquons seulement 3-7%, soit jusqu'à 10x moins que les agents traditionnels.",
  "visite": "Pour planifier une visite :\n\n1. Consultez l'annonce qui vous intéresse\n2. Cliquez sur 'Planifier une visite'\n3. Choisissez une date et un créneau\n4. Le propriétaire confirme le RDV\n\nC'est gratuit et sans engagement !",
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! 👋 Je suis l'assistant LOCABENIN. Comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const lowerMsg = userMsg.toLowerCase();
      let response = "Merci pour votre question ! Pour une assistance plus détaillée, consultez notre Centre d'aide ou contactez-nous directement. Je peux vous renseigner sur la caution, les commissions, les visites et plus encore.";

      for (const [key, value] of Object.entries(defaultResponses)) {
        if (lowerMsg.includes(key)) {
          response = value;
          break;
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-card-hover overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <p className="font-display font-semibold text-sm">Assistant LOCABENIN</p>
                  <p className="text-xs opacity-80">En ligne • Réponse instantanée</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-2 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === "user" ? "bg-primary/10" : "bg-primary"}`}>
                      {m.role === "user" ? <User className="h-3.5 w-3.5 text-primary" /> : <Bot className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <div className={`p-3 rounded-xl text-sm whitespace-pre-line ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted p-3 rounded-xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Posez votre question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="h-10 text-sm"
                />
                <Button size="icon" className="h-10 w-10 flex-shrink-0" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </>
  );
};

export default AIAssistant;
