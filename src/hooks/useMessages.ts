import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";

export interface ConversationWithDetails {
  id: string;
  participant_1: string;
  participant_2: string;
  property_id: string | null;
  last_message_at: string | null;
  created_at: string;
  other_user_name: string;
  other_user_initials: string;
  last_message?: string;
  unread_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: convs, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user!.id},participant_2.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      if (!convs?.length) return [];

      // Fetch other user profiles and last messages
      const results: ConversationWithDetails[] = [];

      for (const c of convs) {
        const otherId = c.participant_1 === user!.id ? c.participant_2 : c.participant_1;

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", otherId)
          .single();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", c.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", c.id)
          .eq("is_read", false)
          .neq("sender_id", user!.id);

        const name = profile?.full_name || "Utilisateur";
        const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

        results.push({
          ...c,
          other_user_name: name,
          other_user_initials: initials,
          last_message: lastMsg?.content,
          unread_count: count || 0,
        });
      }

      return results;
    },
  });
}

export function useMessages(conversationId: string | null) {
  const [realtimeMessages, setRealtimeMessages] = useState<Message[]>([]);

  const query = useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  // Subscribe to realtime
  useEffect(() => {
    if (!conversationId) return;

    setRealtimeMessages([]);

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setRealtimeMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const allMessages = [
    ...(query.data || []),
    ...realtimeMessages.filter(
      (rm) => !(query.data || []).some((m) => m.id === rm.id)
    ),
  ];

  return { ...query, data: allMessages };
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error("Non authentifié");
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      });
      if (error) throw error;

      // Update last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", conversationId);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ otherUserId, propertyId }: { otherUserId: string; propertyId?: string }) => {
      if (!user) throw new Error("Non authentifié");

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`
        )
        .maybeSingle();

      if (existing) return existing.id;

      const { data, error } = await supabase
        .from("conversations")
        .insert({
          participant_1: user.id,
          participant_2: otherUserId,
          property_id: propertyId || null,
        })
        .select("id")
        .single();

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return data.id;
    },
  });
}
