import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "asesor";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  isActive: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    const r = (data?.role as AppRole) ?? null;
    setRole(r);
    const { data: prof } = await supabase
      .from("profiles")
      .select("is_active, blocked_until")
      .eq("id", userId)
      .maybeSingle();
    let active = prof?.is_active ?? true;
    const blockedUntil = (prof as any)?.blocked_until as string | null | undefined;
    if (!active && blockedUntil) {
      const today = new Date().toISOString().slice(0, 10);
      if (blockedUntil <= today) {
        // Desbloqueo automático
        await supabase
          .from("profiles")
          .update({ is_active: true, blocked_until: null })
          .eq("id", userId);
        active = true;
      }
    }
    setIsActive(active);
    if (r !== "admin" && active === false) {
      await supabase.auth.signOut();
      if (typeof window !== "undefined") {
        window.location.href = "/login?blocked=1";
      }
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setTimeout(() => {
          fetchRole(newSession.user.id);
        }, 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      setUser(existing?.user ?? null);
      if (existing?.user) {
        fetchRole(existing.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Revisa periódicamente si el admin bloqueó al usuario para forzar logout en vivo
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchRole(user.id);
    }, 20000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const refreshRole = async () => {
    if (user) await fetchRole(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, isActive, loading, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}