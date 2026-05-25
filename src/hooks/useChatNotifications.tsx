import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ChatNotificationsValue {
  unreadTotal: number;
  unreadByConv: Record<string, number>;
  markRead: (conversationId: string) => void;
  activeConvId: string | null;
  setActiveConvId: (id: string | null) => void;
}

const Ctx = createContext<ChatNotificationsValue | undefined>(undefined);

function playBeep() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    o.start();
    o.stop(ctx.currentTime + 0.32);
    setTimeout(() => ctx.close(), 500);
  } catch {
    /* ignore */
  }
}

export function ChatNotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadByConv, setUnreadByConv] = useState<Record<string, number>>({});
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeConvId;
  const myConvsRef = useRef<Set<string>>(new Set());

  // Load conversations + initial unread counts
  useEffect(() => {
    if (!user) {
      setUnreadByConv({});
      myConvsRef.current = new Set();
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: parts } = await supabase
        .from("conversation_participants")
        .select("conversation_id, last_read_at")
        .eq("user_id", user.id);
      if (cancelled || !parts) return;
      myConvsRef.current = new Set(parts.map((p) => p.conversation_id));
      const counts: Record<string, number> = {};
      await Promise.all(
        parts.map(async (p) => {
          let q = supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("conversation_id", p.conversation_id)
            .neq("sender_id", user.id);
          if (p.last_read_at) q = q.gt("created_at", p.last_read_at);
          const { count } = await q;
          if (count && count > 0) counts[p.conversation_id] = count;
        })
      );
      if (!cancelled) setUnreadByConv(counts);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Realtime subscription to all messages (RLS limits to my conversations)
  useEffect(() => {
    if (!user) return;
    // Ask notification permission once
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    const channel = supabase
      .channel(`chat-notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        async (payload) => {
          const m = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string | null;
            message_type: string;
          };
          if (m.sender_id === user.id) return;
          if (!myConvsRef.current.has(m.conversation_id)) {
            // New conversation we may have just been added to — refresh set
            const { data: parts } = await supabase
              .from("conversation_participants")
              .select("conversation_id")
              .eq("user_id", user.id);
            myConvsRef.current = new Set((parts ?? []).map((p) => p.conversation_id));
            if (!myConvsRef.current.has(m.conversation_id)) return;
          }
          // If user is currently viewing this conversation in /chat, mark read
          const isActive =
            activeRef.current === m.conversation_id &&
            typeof document !== "undefined" &&
            document.visibilityState === "visible";
          if (isActive) {
            void supabase
              .from("conversation_participants")
              .update({ last_read_at: new Date().toISOString() })
              .eq("conversation_id", m.conversation_id)
              .eq("user_id", user.id);
            return;
          }
          setUnreadByConv((prev) => ({
            ...prev,
            [m.conversation_id]: (prev[m.conversation_id] ?? 0) + 1,
          }));
          // Fetch sender name + conversation name for the notification
          const [{ data: sender }, { data: conv }] = await Promise.all([
            supabase.from("profiles").select("full_name").eq("id", m.sender_id).maybeSingle(),
            supabase.from("conversations").select("type, name").eq("id", m.conversation_id).maybeSingle(),
          ]);
          const senderName = sender?.full_name ?? "Alguien";
          const title =
            conv?.type === "group" ? `${senderName} en #${conv?.name ?? "Grupo"}` : senderName;
          const body =
            m.message_type === "text"
              ? m.content ?? ""
              : m.message_type === "image"
                ? "📷 Imagen"
                : m.message_type === "audio"
                  ? "🎤 Audio"
                  : "📎 Documento";
          toast(title, { description: body });
          playBeep();
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(title, { body, tag: m.conversation_id });
            } catch {
              /* ignore */
            }
          }
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const markRead = (conversationId: string) => {
    setUnreadByConv((prev) => {
      if (!prev[conversationId]) return prev;
      const next = { ...prev };
      delete next[conversationId];
      return next;
    });
    if (user) {
      void supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);
    }
  };

  const unreadTotal = Object.values(unreadByConv).reduce((a, b) => a + b, 0);

  return (
    <Ctx.Provider value={{ unreadTotal, unreadByConv, markRead, activeConvId, setActiveConvId }}>
      {children}
    </Ctx.Provider>
  );
}

export function useChatNotifications() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChatNotifications must be used inside ChatNotificationsProvider");
  return ctx;
}