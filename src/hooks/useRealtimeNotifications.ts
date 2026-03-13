import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
    setLoading(false);
  }, [user]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;
    
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to new notifications
    const notificationsChannel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    // For property owners: listen to visits and payments
    if (user.role === "proprietaire") {
      const visitsChannel = supabase
        .channel(`visits-owner-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "visits",
            filter: `owner_id=eq.${user.id}`,
          },
          async (payload) => {
            // Create notification for new visit request
            const visit = payload.new as any;
            const { data: property } = await supabase
              .from("properties")
              .select("title")
              .eq("id", visit.property_id)
              .single();

            await supabase.from("notifications").insert({
              user_id: user.id,
              title: "Nouvelle demande de visite",
              message: `Une visite a été demandée pour "${property?.title || 'votre bien'}" le ${new Date(visit.scheduled_at).toLocaleDateString("fr-FR")}`,
              type: "info",
              link: "/espace-proprietaire?tab=visits",
            });
          }
        )
        .subscribe();

      const paymentsChannel = supabase
        .channel(`payments-owner-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "payments",
            filter: `owner_id=eq.${user.id}`,
          },
          async (payload) => {
            const payment = payload.new as any;
            
            await supabase.from("notifications").insert({
              user_id: user.id,
              title: "Nouveau paiement reçu",
              message: `Un paiement de ${payment.amount.toLocaleString()} FCFA a été enregistré.`,
              type: "success",
              link: "/paiements",
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(notificationsChannel);
        supabase.removeChannel(visitsChannel);
        supabase.removeChannel(paymentsChannel);
      };
    }

    return () => {
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  };
};

export default useRealtimeNotifications;
