import { Link, useRouter, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, Banknote, UserCog, LogOut, Wallet, Coins, Inbox, MessageCircle, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChatNotifications } from "@/hooks/useChatNotifications";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { to: "/clients", label: "Clientes", icon: Users, adminOnly: false },
  { to: "/loans", label: "Préstamos", icon: Banknote, adminOnly: false },
  { to: "/cash", label: "Caja del día", icon: Coins, adminOnly: false },
  { to: "/reports", label: "Informe mensual", icon: BarChart3, adminOnly: false },
  { to: "/chat", label: "Chat", icon: MessageCircle, adminOnly: false },
  { to: "/admin/novelties", label: "Novedades", icon: Inbox, adminOnly: true },
  { to: "/admin/users", label: "Usuarios", icon: UserCog, adminOnly: true },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, role, signOut, loading } = useAuth();
  const router = useRouter();
  const location = useLocation();
  const { unreadTotal } = useChatNotifications();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") router.navigate({ to: "/login" });
    return null;
  }

  const items = navItems.filter((i) => !i.adminOnly || role === "admin");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">PrestaControl</div>
            <div className="text-xs text-sidebar-foreground/60 capitalize">{role ?? "—"}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {items.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            const isChat = item.to === "/chat";
            const badge = isChat ? unreadTotal : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {badge > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-semibold text-destructive-foreground">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <div className="px-3 py-2 text-xs text-sidebar-foreground/60 truncate">
            {user.email}
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Wallet className="h-4 w-4" />
            </div>
            <span className="font-semibold">PrestaControl</span>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut} className="text-sidebar-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1">
          {items.map((item) => {
            const active = location.pathname.startsWith(item.to);
            const Icon = item.icon;
            const isChat = item.to === "/chat";
            const badge = isChat ? unreadTotal : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs whitespace-nowrap",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
                {badge > 0 && (
                  <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 overflow-x-hidden pt-24 md:pt-0">
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}