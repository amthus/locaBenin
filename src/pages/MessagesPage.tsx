import { useState, useEffect, useRef } from "react";
import { Send, Search, Phone, MoreVertical, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import { useConversations, useMessages, useSendMessage } from "@/hooks/useMessages";
import { useAuth } from "@/contexts/AuthContext";

const MessagesPage = () => {
  const { user } = useAuth();
  const { data: conversations = [], isLoading: convLoading } = useConversations();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { data: messages = [], isLoading: msgLoading } = useMessages(selectedConvId);
  const sendMessage = useSendMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConvId) {
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, selectedConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvId) return;
    const content = newMessage.trim();
    setNewMessage("");
    await sendMessage.mutateAsync({ conversationId: selectedConvId, content });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    if (diff < 172800000) return "Hier";
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-16 h-screen flex">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher..." className="pl-10 h-10" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm">Aucune conversation</p>
                <p className="text-xs mt-1">Contactez un propriétaire depuis une annonce</p>
              </div>
            ) : (
              conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedConvId(c.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted transition-colors ${selectedConvId === c.id ? "bg-muted" : ""}`}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{c.other_user_initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm truncate">{c.other_user_name}</p>
                      <span className="text-xs text-muted-foreground">{c.last_message_at ? formatTime(c.last_message_at) : ""}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{c.last_message || "Nouvelle conversation"}</p>
                  </div>
                  {c.unread_count > 0 && (
                    <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {c.unread_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedConv ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{selectedConv.other_user_initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{selectedConv.other_user_name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon"><Phone className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {msgLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <p className="text-sm">Démarrez la conversation</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] p-3 rounded-lg text-sm ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        <p>{m.content}</p>
                        <p className={`text-xs mt-1 ${m.sender_id === user?.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="h-12"
                  />
                  <Button size="lg" className="h-12 px-6" onClick={handleSend} disabled={!newMessage.trim() || sendMessage.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
