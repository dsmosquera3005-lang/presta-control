import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Paperclip, Send, Smile, Mic, Square, FileText, Image as ImageIcon, Plus } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type Conversation = {
  id: string;
  type: "direct" | "group";
  name: string | null;
  other_name?: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  message_type: "text" | "image" | "document" | "audio";
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  sender_name?: string;
};

function ChatPage() {
  const { user } = useAuth();
  const { unreadByConv, markRead, setActiveConvId } = useChatNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [profiles, setProfiles] = useState<{ id: string; full_name: string }[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    void loadConversations();
    void loadProfiles();
  }, [user]);

  async function loadProfiles() {
    const { data } = await supabase.from("profiles").select("id, full_name");
    setProfiles((data ?? []).filter((p) => p.id !== user!.id));
  }

  async function loadConversations() {
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user!.id);
    const ids = (parts ?? []).map((p) => p.conversation_id);
    if (ids.length === 0) {
      setConversations([]);
      return;
    }
    const { data: convs } = await supabase
      .from("conversations")
      .select("id, type, name")
      .in("id", ids);
    const list = (convs ?? []) as Conversation[];
    // Resolve direct chat names
    for (const c of list) {
      if (c.type === "direct") {
        const { data: others } = await supabase
          .from("conversation_participants")
          .select("user_id")
          .eq("conversation_id", c.id)
          .neq("user_id", user!.id);
        const otherId = others?.[0]?.user_id;
        if (otherId) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherId)
            .maybeSingle();
          c.other_name = prof?.full_name ?? "Usuario";
        }
      }
    }
    list.sort((a, b) => (a.type === "group" ? -1 : 1));
    setConversations(list);
    if (!activeConv && list.length > 0) setActiveConv(list[0]);
  }

  useEffect(() => {
    if (!activeConv) return;
    setActiveConvId(activeConv.id);
    markRead(activeConv.id);
    void loadMessages(activeConv.id);
    const channel = supabase
      .channel(`messages-${activeConv.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeConv.id}` },
        async (payload) => {
          const m = payload.new as Message;
          const { data: p } = await supabase.from("profiles").select("full_name").eq("id", m.sender_id).maybeSingle();
          setMessages((prev) => [...prev, { ...m, sender_name: p?.full_name ?? "Usuario" }]);
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeConv?.id]);

  useEffect(() => {
    return () => setActiveConvId(null);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    const msgs = (data ?? []) as Message[];
    const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
    if (senderIds.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", senderIds);
      const map = new Map((profs ?? []).map((p) => [p.id, p.full_name]));
      msgs.forEach((m) => (m.sender_name = map.get(m.sender_id) ?? "Usuario"));
    }
    setMessages(msgs);
  }

  async function sendText() {
    if (!input.trim() || !activeConv) return;
    const content = input.trim();
    setInput("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: user!.id,
      content,
      message_type: "text",
    });
    if (error) toast.error(error.message);
  }

  async function uploadAndSend(file: File, type: "image" | "document" | "audio") {
    if (!activeConv) return;
    const ext = file.name.split(".").pop() || "bin";
    const path = `${user!.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("chat-files").upload(path, file);
    if (upErr) {
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("chat-files").getPublicUrl(path);
    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConv.id,
      sender_id: user!.id,
      message_type: type,
      file_url: pub.publicUrl,
      file_name: file.name,
    });
    if (error) toast.error(error.message);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: "audio/webm" });
        await uploadAndSend(file, "audio");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      toast.error("No se pudo acceder al micrófono");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
  }

  async function startDirectChat(otherId: string) {
    // Find existing direct conv with both users
    const { data: mine } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user!.id);
    const myIds = (mine ?? []).map((m) => m.conversation_id);
    if (myIds.length) {
      const { data: shared } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations!inner(type)")
        .eq("user_id", otherId)
        .in("conversation_id", myIds);
      const direct = (shared ?? []).find((s: any) => s.conversations?.type === "direct");
      if (direct) {
        await loadConversations();
        const found = conversations.find((c) => c.id === direct.conversation_id);
        if (found) setActiveConv(found);
        setShowNew(false);
        return;
      }
    }
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({ type: "direct", created_by: user!.id })
      .select()
      .single();
    if (error || !newConv) {
      toast.error(error?.message ?? "Error");
      return;
    }
    await supabase.from("conversation_participants").insert([
      { conversation_id: newConv.id, user_id: user!.id },
      { conversation_id: newConv.id, user_id: otherId },
    ]);
    setShowNew(false);
    await loadConversations();
    setActiveConv({ ...(newConv as any), type: "direct" });
  }

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] gap-4">
        {/* Sidebar */}
        <div className="w-72 flex flex-col border rounded-lg bg-card">
          <div className="p-3 border-b flex items-center justify-between">
            <h2 className="font-semibold">Conversaciones</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowNew((v) => !v)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {showNew && (
            <div className="p-2 border-b max-h-60 overflow-y-auto">
              <p className="text-xs text-muted-foreground px-2 py-1">Nuevo chat con:</p>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => startDirectChat(p.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded"
                >
                  {p.full_name}
                </button>
              ))}
            </div>
          )}
          <ScrollArea className="flex-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveConv(c)}
                className={cn(
                  "w-full text-left px-3 py-3 border-b text-sm hover:bg-accent",
                  activeConv?.id === c.id && "bg-accent"
                )}
              >
                <div className="font-medium flex items-center justify-between gap-2">
                  <span className="truncate">
                    {c.type === "group" ? `# ${c.name ?? "Grupo"}` : c.other_name ?? "Chat"}
                  </span>
                  {(unreadByConv[c.id] ?? 0) > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                      {unreadByConv[c.id]}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {c.type === "group" ? "Grupo" : "Directo"}
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col border rounded-lg bg-card">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecciona una conversación
            </div>
          ) : (
            <>
              <div className="p-3 border-b">
                <div className="font-semibold">
                  {activeConv.type === "group" ? `# ${activeConv.name}` : activeConv.other_name}
                </div>
              </div>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const mine = m.sender_id === user?.id;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                          mine ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                      >
                        {!mine && activeConv.type === "group" && (
                          <div className="text-xs font-semibold mb-1 opacity-80">{m.sender_name}</div>
                        )}
                        {m.message_type === "text" && <div className="whitespace-pre-wrap break-words">{m.content}</div>}
                        {m.message_type === "image" && m.file_url && (
                          <a href={m.file_url} target="_blank" rel="noreferrer">
                            <img src={m.file_url} alt={m.file_name ?? ""} className="rounded max-w-xs" />
                          </a>
                        )}
                        {m.message_type === "document" && m.file_url && (
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 underline"
                          >
                            <FileText className="h-4 w-4" /> {m.file_name}
                          </a>
                        )}
                        {m.message_type === "audio" && m.file_url && (
                          <audio controls src={m.file_url} className="max-w-xs" />
                        )}
                        <div className="text-[10px] opacity-60 mt-1 text-right">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t flex items-end gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost"><Smile className="h-4 w-4" /></Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top" align="start">
                    <EmojiPicker onEmojiClick={(e) => setInput((v) => v + e.emoji)} />
                  </PopoverContent>
                </Popover>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadAndSend(e.target.files[0], "image")}
                  />
                  <Button size="icon" variant="ghost" asChild><span><ImageIcon className="h-4 w-4" /></span></Button>
                </label>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && uploadAndSend(e.target.files[0], "document")}
                  />
                  <Button size="icon" variant="ghost" asChild><span><Paperclip className="h-4 w-4" /></span></Button>
                </label>

                <Button
                  size="icon"
                  variant={recording ? "destructive" : "ghost"}
                  onClick={recording ? stopRecording : startRecording}
                >
                  {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>

                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendText();
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                />
                <Button size="icon" onClick={() => void sendText()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}