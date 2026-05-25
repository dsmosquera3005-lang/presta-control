import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Plus, UserCircle2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/clients")({
  component: ClientsPage,
});

interface ClientRow {
  id: string;
  cedula: string;
  full_name: string;
  phone: string | null;
  profile_photo_url: string | null;
  created_at: string;
  status: "activo" | "en_aviso" | "sacado";
}

function ClientsPage() {
  const location = useLocation();

  if (location.pathname !== "/clients") {
    return <Outlet />;
  }

  return <ClientsListPage />;
}

function ClientsListPage() {
  const { user, role } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("clients")
      .select("id, cedula, full_name, phone, profile_photo_url, created_at, status")
      .order("created_at", { ascending: false });
    if (role !== "admin" && user) {
      q = q.eq("created_by", user.id).eq("status", "activo");
    }
    const { data, error } = await q;
    if (error) toast.error(error.message);
    setClients(data ?? []);
    setLoading(false);
  };

  const handleSearch = async () => {
    const term = search.trim();
    if (!term) return load();
    let q = supabase
      .from("clients")
      .select("id, cedula, full_name, phone, profile_photo_url, created_at, status")
      .or(`cedula.ilike.%${term}%,full_name.ilike.%${term}%`);
    if (role !== "admin" && user) {
      q = q.eq("created_by", user.id).eq("status", "activo");
    }
    const { data } = await q;
    setClients(data ?? []);
  };

  return (
    <AppLayout>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Busca por cédula o crea uno nuevo</p>
        </div>
        <Link to="/clients/new" search={{ cedula: "" }}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nuevo cliente
          </Button>
        </Link>
      </header>

      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cédula o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary">
            Buscar
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : clients.length === 0 ? (
        <Card className="p-12 text-center">
          <UserCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">
            {search.trim()
              ? `No encontramos clientes con "${search.trim()}".`
              : "No hay clientes registrados."}
          </p>
          
        </Card>
      ) : (
        <div className="grid gap-3">
          {clients.map((c) => (
            <Link key={c.id} to="/clients/$id" params={{ id: c.id }}>
              <Card className="p-4 hover:shadow-[var(--shadow-card)] hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  {c.profile_photo_url ? (
                    <img
                      src={c.profile_photo_url}
                      alt={c.full_name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      Cédula {c.cedula} {c.phone ? `· ${c.phone}` : ""}
                    </div>
                  </div>
                  {c.status === "sacado" ? (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Sacado</Badge>
                  ) : c.status === "en_aviso" ? (
                    <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">En aviso</Badge>
                  ) : (
                    <Badge variant="outline">Ver</Badge>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}