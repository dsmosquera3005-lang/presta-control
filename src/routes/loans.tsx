import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Star,
  XCircle,
  FileText,
  DollarSign,
  AlertTriangle,
  CalendarClock,
  Phone,
  ExternalLink,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, localIsoDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { calcMora, totalDue } from "@/lib/mora";

export const Route = createFileRoute("/loans")({
  component: LoansBandejaPage,
});

type LoanRow = {
  id: string;
  amount: number;
  expected_amount: number;
  loan_date: string;
  payment_date: string;
  status: "activo" | "pagado" | "vencido";
  client_id: string;
  created_by: string;
  renewed_from: string | null;
  mora_waived: boolean | null;
};

type ClientRow = {
  id: string;
  cedula: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  profile_photo_url: string | null;
  status: "activo" | "en_aviso" | "sacado";
  created_by: string;
};

type PaymentRow = {
  id: string;
  amount: number;
  payment_type: string;
  payment_date: string;
  client_id: string;
  loan_id: string | null;
};

type FilterKey =
  | "totales"
  | "pagan_hoy"
  | "pendientes_hoy"
  | "gestionados_hoy"
  | "mora_1_15"
  | "mora_16_30"
  | "mora_30_mas"
  | "pg"
  | "np"
  | "acuerdos";

const todayStr = () => localIsoDate();
const fmt = (n: number) =>
  new Intl.NumberFormat("es", { style: "currency", currency: "USD" }).format(n);

function daysBetween(fromIso: string, to = new Date()) {
  const a = new Date(fromIso + "T00:00:00");
  const ms = to.getTime() - a.getTime();
  return Math.floor(ms / 86400000);
}

function LoansBandejaPage() {
  const { user, role } = useAuth();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("totales");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role]);

  const load = async () => {
    setLoading(true);
    const today = todayStr();
    let cq = supabase
      .from("clients")
      .select("id, cedula, full_name, phone, email, profile_photo_url, status, created_by")
      .order("full_name", { ascending: true });
    if (role !== "admin" && user) cq = cq.eq("created_by", user.id);
    const { data: cs } = await cq;
    setClients((cs ?? []) as ClientRow[]);

    let lq = supabase
      .from("loans")
      .select(
        "id, amount, expected_amount, loan_date, payment_date, status, client_id, created_by, renewed_from, mora_waived",
      );
    if (role !== "admin" && user) lq = lq.eq("created_by", user.id);
    const { data: ls } = await lq;
    setLoans((ls ?? []) as LoanRow[]);

    let pq = supabase
      .from("payments")
      .select("id, amount, payment_type, payment_date, client_id, loan_id")
      .eq("payment_date", today);
    if (role !== "admin" && user) pq = pq.eq("advisor_id", user.id);
    const { data: ps } = await pq;
    setPayments((ps ?? []) as PaymentRow[]);

    setLoading(false);
  };

  // Derive per-client info: active loan, days overdue, totals
  const clientInfo = useMemo(() => {
    const map = new Map<
      string,
      {
        client: ClientRow;
        activeLoan: LoanRow | null;
        daysOverdue: number; // negative => still has time
        creditCount: number;
        paidToday: PaymentRow[];
      }
    >();
    for (const c of clients) {
      const myLoans = loans.filter((l) => l.client_id === c.id);
      const active = myLoans.find((l) => l.status === "activo") ?? null;
      const days = active ? daysBetween(active.payment_date) : 0;
      const paidToday = payments.filter((p) => p.client_id === c.id);
      map.set(c.id, {
        client: c,
        activeLoan: active,
        daysOverdue: days,
        creditCount: myLoans.length,
        paidToday,
      });
    }
    return map;
  }, [clients, loans, payments]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const arr = Array.from(clientInfo.values()).filter(({ client, activeLoan, daysOverdue, paidToday }) => {
      if (term) {
        const hit =
          client.full_name.toLowerCase().includes(term) ||
          client.cedula.toLowerCase().includes(term);
        if (!hit) return false;
      }
      switch (filter) {
        case "totales":
          return true;
        case "pagan_hoy":
          return !!activeLoan && activeLoan.payment_date === todayStr();
        case "pendientes_hoy":
          return !!activeLoan && activeLoan.payment_date === todayStr() && paidToday.length === 0;
        case "gestionados_hoy":
          return paidToday.length > 0;
        case "mora_1_15":
          return !!activeLoan && daysOverdue >= 1 && daysOverdue <= 15;
        case "mora_16_30":
          return !!activeLoan && daysOverdue >= 16 && daysOverdue <= 30;
        case "mora_30_mas":
          return !!activeLoan && daysOverdue > 30;
        case "pg":
          return paidToday.some((p) => p.payment_type !== "interes" || Number(p.amount) > 0);
        case "np":
          return !!activeLoan && daysOverdue >= 0 && paidToday.length === 0;
        case "acuerdos":
          return client.status === "en_aviso";
      }
      return true;
    });
    arr.sort((a, b) => b.daysOverdue - a.daysOverdue);
    return arr;
  }, [clientInfo, search, filter]);

  // Counts for sidebar
  const counts = useMemo(() => {
    const all = Array.from(clientInfo.values());
    return {
      totales: all.length,
      pagan_hoy: all.filter((x) => x.activeLoan?.payment_date === todayStr()).length,
      pendientes_hoy: all.filter(
        (x) => x.activeLoan?.payment_date === todayStr() && x.paidToday.length === 0,
      ).length,
      gestionados_hoy: all.filter((x) => x.paidToday.length > 0).length,
      mora_1_15: all.filter((x) => x.activeLoan && x.daysOverdue >= 1 && x.daysOverdue <= 15).length,
      mora_16_30: all.filter((x) => x.activeLoan && x.daysOverdue >= 16 && x.daysOverdue <= 30).length,
      mora_30_mas: all.filter((x) => x.activeLoan && x.daysOverdue > 30).length,
      pg: all.filter((x) => x.paidToday.length > 0).length,
      np: all.filter((x) => x.activeLoan && x.daysOverdue >= 0 && x.paidToday.length === 0).length,
      acuerdos: all.filter((x) => x.client.status === "en_aviso").length,
    } as Record<FilterKey, number>;
  }, [clientInfo]);

  const sideItems: { key: FilterKey; label: string; icon: typeof Users; tone: string }[] = [
    { key: "totales", label: "Clientes Totales", icon: Users, tone: "text-primary" },
    { key: "pagan_hoy", label: "Pagan Hoy", icon: CalendarCheck, tone: "text-primary" },
    { key: "pendientes_hoy", label: "Pendientes Hoy", icon: Clock, tone: "text-warning" },
    { key: "gestionados_hoy", label: "Gestionados Hoy", icon: CheckCircle2, tone: "text-success" },
    { key: "pg", label: "PG (Pago)", icon: DollarSign, tone: "text-success" },
    { key: "np", label: "NP (No Pago)", icon: XCircle, tone: "text-destructive" },
    { key: "acuerdos", label: "Acuerdos Pago", icon: FileText, tone: "text-warning" },
    { key: "mora_1_15", label: "Mora 1 - 15", icon: AlertTriangle, tone: "text-warning" },
    { key: "mora_16_30", label: "Mora 16 - 30", icon: AlertTriangle, tone: "text-destructive" },
    { key: "mora_30_mas", label: "Mora +30", icon: AlertTriangle, tone: "text-destructive" },
  ];

  const selected = selectedId ? clientInfo.get(selectedId) : null;

  return (
    <AppLayout>
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Bandeja de cobro</h1>
        <p className="text-sm text-muted-foreground">Busca, filtra y gestiona tus clientes del día</p>
      </header>

      <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-220px)]">
        {/* Sidebar filters */}
        <Card className="col-span-12 lg:col-span-3 p-3 overflow-y-auto max-h-[calc(100vh-160px)]">
          <div className="text-xs font-semibold uppercase text-muted-foreground px-2 pb-2">Bandeja</div>
          <nav className="space-y-1">
            {sideItems.map((it) => {
              const Icon = it.icon;
              const active = filter === it.key;
              return (
                <button
                  key={it.key}
                  onClick={() => setFilter(it.key)}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", active ? "text-primary" : it.tone)} />
                    {it.label}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {counts[it.key]}
                  </Badge>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Client list */}
        <Card className="col-span-12 lg:col-span-4 p-3 overflow-hidden flex flex-col">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full"
            />
          </div>
          <div className="flex flex-wrap gap-1 px-1 pb-2">
            <Chip color="primary" label="HOY" count={counts.pagan_hoy} />
            <Chip color="warning" label="1CR" count={Array.from(clientInfo.values()).filter(x => x.creditCount === 1).length} />
            <Chip color="primary" label="PTE" count={counts.pendientes_hoy} />
            <Chip color="destructive" label="MOR" count={counts.mora_1_15 + counts.mora_16_30 + counts.mora_30_mas} />
            <Chip color="success" label="PAG" count={counts.pg} />
          </div>
          <div className="text-xs text-muted-foreground px-1 pb-2">
            Mostrando {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center text-sm text-muted-foreground py-8">Cargando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">Sin resultados.</div>
            ) : (
              filtered.map(({ client, activeLoan, daysOverdue, paidToday }) => {
                const isSelected = selectedId === client.id;
                const moraTone =
                  daysOverdue > 30
                    ? "text-destructive"
                    : daysOverdue > 0
                      ? "text-warning"
                      : "text-muted-foreground";
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border hover:border-primary/30 hover:bg-muted/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {client.profile_photo_url ? (
                        <img
                          src={client.profile_photo_url}
                          alt={client.full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                          {client.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-medium text-sm truncate">{client.full_name}</div>
                          {activeLoan && (
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(activeLoan.payment_date).toLocaleDateString("es", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className={cn("text-xs", moraTone)}>
                            {activeLoan
                              ? daysOverdue > 0
                                ? `${daysOverdue}d mora`
                                : daysOverdue === 0
                                  ? "Vence hoy"
                                  : `${Math.abs(daysOverdue)}d resta`
                              : "Sin crédito"}
                          </span>
                          {activeLoan && (
                              (() => {
                                const m = calcMora(activeLoan);
                                const due = totalDue(Number(activeLoan.expected_amount), m.fee);
                                return (
                                  <span className="text-sm font-semibold text-primary text-right">
                                    {fmt(due)}
                                    {m.fee > 0 && (
                                      <span className="block text-[10px] font-normal text-destructive">
                                        +{fmt(m.fee)} mora ({m.percent}%)
                                      </span>
                                    )}
                                  </span>
                                );
                              })()
                          )}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {paidToday.length > 0 && (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px] py-0">
                              Pago
                            </Badge>
                          )}
                          {client.status === "en_aviso" && (
                            <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30 text-[10px] py-0">
                              Aviso
                            </Badge>
                          )}
                          {activeLoan && daysOverdue > 0 && paidToday.length === 0 && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] py-0">
                              Mora
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Right detail panel */}
        <Card className="col-span-12 lg:col-span-5 p-4 overflow-y-auto max-h-[calc(100vh-160px)]">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
              <Star className="h-10 w-10 mb-2 opacity-40" />
              <p>Selecciona un cliente para ver el resumen</p>
            </div>
          ) : (
            <ClientDetail info={selected} />
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function Chip({
  color,
  label,
  count,
}: {
  color: "primary" | "warning" | "destructive" | "success";
  label: string;
  count: number;
}) {
  const tones = {
    primary: "bg-primary/10 text-primary border-primary/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    success: "bg-success/15 text-success border-success/30",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", tones[color])}>
      {label} <span className="opacity-70">{count}</span>
    </span>
  );
}

function ClientDetail({
  info,
}: {
  info: {
    client: ClientRow;
    activeLoan: LoanRow | null;
    daysOverdue: number;
    creditCount: number;
    paidToday: PaymentRow[];
  };
}) {
  const { client, activeLoan, daysOverdue, creditCount, paidToday } = info;
  const cobrado = paidToday.reduce((s, p) => s + Number(p.amount), 0);
  const mora = activeLoan ? calcMora(activeLoan) : null;
  const due = activeLoan ? totalDue(Number(activeLoan.expected_amount), mora?.fee ?? 0) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        {client.profile_photo_url ? (
          <img src={client.profile_photo_url} alt={client.full_name} className="h-14 w-14 rounded-full object-cover" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold">
            {client.full_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-lg leading-tight">{client.full_name}</div>
          {client.email && <div className="text-xs text-muted-foreground truncate">{client.email}</div>}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-[11px]"><Users className="h-3 w-3 mr-1" />Cédula {client.cedula}</Badge>
            {client.phone && (
              <Badge variant="outline" className="text-[11px]"><Phone className="h-3 w-3 mr-1" />{client.phone}</Badge>
            )}
            {activeLoan && (
              <Badge variant="outline" className="text-[11px]">
                <CalendarClock className="h-3 w-3 mr-1" />
                Pago: {new Date(activeLoan.payment_date).toLocaleDateString("es")}
              </Badge>
            )}
          </div>
        </div>
        <Link to="/clients/$id" params={{ id: client.id }}>
          <Button size="sm" variant="default">
            <ExternalLink className="h-4 w-4 mr-1" /> Abrir ficha
          </Button>
        </Link>
      </div>

      <Card className="p-4 bg-muted/20 border-muted">
        <div className="font-semibold mb-3">Resumen Financiero</div>
        {activeLoan ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Total a cobrar</div>
              <div className="text-2xl font-bold text-primary">{fmt(due)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Cuota {fmt(Number(activeLoan.expected_amount))}
                {mora && mora.fee > 0 && (
                  <span className="block text-destructive">+ Mora {fmt(mora.fee)} ({mora.percent}%)</span>
                )}
                {mora?.waived && (
                  <span className="block text-success">Mora anulada por administrador</span>
                )}
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Préstamo</span><span className="font-semibold">{fmt(Number(activeLoan.amount))}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mora (días)</span><span className={cn("font-semibold", daysOverdue > 0 ? "text-destructive" : "text-success")}>{daysOverdue > 0 ? daysOverdue : 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Recargo mora</span><span className={cn("font-semibold", (mora?.fee ?? 0) > 0 ? "text-destructive" : "")}>{fmt(mora?.fee ?? 0)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Créditos totales</span><span className="font-semibold">{creditCount}</span></div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Sin crédito activo.</div>
        )}
      </Card>

      <Card className="p-4">
        <div className="font-semibold mb-3">Pagos de hoy</div>
        {paidToday.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin pagos registrados hoy.</div>
        ) : (
          <div className="space-y-2">
            {paidToday.map((p) => (
              <div key={p.id} className="flex justify-between items-center text-sm">
                <span className="capitalize text-muted-foreground">{p.payment_type}</span>
                <span className="font-semibold">{fmt(Number(p.amount))}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm pt-2 border-t mt-2">
              <span className="font-semibold">Total cobrado</span>
              <span className="font-bold text-success">{fmt(cobrado)}</span>
            </div>
          </div>
        )}
      </Card>

      <Link to="/clients/$id" params={{ id: client.id }} className="block">
        <Button className="w-full" size="lg">
          <DollarSign className="h-4 w-4 mr-2" /> Ir a cobrar / gestionar
        </Button>
      </Link>
    </div>
  );
}