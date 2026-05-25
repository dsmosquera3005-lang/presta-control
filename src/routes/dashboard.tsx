import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Banknote, TrendingUp, AlertTriangle, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

interface Stats {
  totalLoaned: number;
  expectedInterest: number;
  collectedInterest: number;
  overdue: number;
  activeClients: number;
  monthly: { month: string; prestado: number; esperado: number }[];
  upcoming: Array<{
    id: string;
    expected_amount: number;
    payment_date: string;
    clients: { full_name: string; cedula: string } | null;
  }>;
}

function DashboardPage() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadStats = async () => {
    const isAdmin = role === "admin";
    let loansQ = supabase
      .from("loans")
      .select("amount, expected_amount, payment_date, status, loan_date");
    let clientsQ = supabase.from("clients").select("id, status");
    let upcomingQ = supabase
      .from("loans")
      .select("id, expected_amount, payment_date, clients(full_name, cedula)")
      .eq("status", "activo")
      .gte("payment_date", new Date().toISOString().slice(0, 10))
      .order("payment_date", { ascending: true })
      .limit(5);
    let paymentsQ = supabase
      .from("payments")
      .select("amount, payment_date, payment_type, advisor_id");

    if (!isAdmin && user) {
      loansQ = loansQ.eq("created_by", user.id);
      clientsQ = clientsQ.eq("created_by", user.id).eq("status", "activo");
      upcomingQ = upcomingQ.eq("created_by", user.id);
      paymentsQ = paymentsQ.eq("advisor_id", user.id);
    }

    const { data: loans } = await loansQ;
    const { data: clients } = await clientsQ;
    const { data: upcoming } = await upcomingQ;
    const { data: payments } = await paymentsQ;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const totalLoaned = (loans ?? [])
      .filter((l) => l.status !== "pagado")
      .reduce((s, l) => s + Number(l.amount), 0);
    // Interés esperado: solo el interés (expected - capital) de los préstamos activos
    const expectedInterest = (loans ?? [])
      .filter((l) => l.status === "activo")
      .reduce(
        (s, l) => s + Math.max(0, Number(l.expected_amount) - Number(l.amount)),
        0
      );
    // Interés cobrado este mes (pagos tipo "interes")
    const monthStartIso = monthStart.toISOString().slice(0, 10);
    const monthEndIso = monthEnd.toISOString().slice(0, 10);
    const collectedInterest = (payments ?? [])
      .filter(
        (p) =>
          p.payment_type === "interes" &&
          p.payment_date >= monthStartIso &&
          p.payment_date <= monthEndIso
      )
      .reduce((s, p) => s + Number(p.amount), 0);
    const overdue = (loans ?? []).filter(
      (l) => l.status === "activo" && new Date(l.payment_date) < today
    ).length;

    // Datos mensuales últimos 6 meses
    const monthly: { month: string; prestado: number; esperado: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      const label = d.toLocaleDateString("es", { month: "short" });
      const prestado = (loans ?? [])
        .filter((l) => {
          const ld = new Date(l.loan_date);
          return ld >= d && ld <= end;
        })
        .reduce((s, l) => s + Number(l.amount), 0);
      const esperado = (loans ?? [])
        .filter((l) => {
          const pd = new Date(l.payment_date);
          return pd >= d && pd <= end;
        })
        .reduce((s, l) => s + Number(l.expected_amount), 0);
      monthly.push({ month: label, prestado, esperado });
    }

    setStats({
      totalLoaned,
      expectedInterest,
      collectedInterest,
      overdue,
      activeClients: clients?.length ?? 0,
      monthly,
      upcoming: (upcoming ?? []) as Stats["upcoming"],
    });
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <AppLayout>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {role === "admin" ? "Vista global del negocio" : "Resumen de tu cartera"}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Total prestado activo"
          value={stats ? fmt(stats.totalLoaned) : "—"}
          tone="primary"
        />
        <InterestCard
          expected={stats?.expectedInterest ?? 0}
          collected={stats?.collectedInterest ?? 0}
          fmt={fmt}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Préstamos vencidos"
          value={stats ? String(stats.overdue) : "—"}
          tone="warning"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Clientes"
          value={stats ? String(stats.activeClients) : "—"}
          tone="muted"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card className="p-6">
          <h2 className="font-semibold mb-1">Actividad mensual</h2>
          <p className="text-xs text-muted-foreground mb-4">Prestado vs esperado (últimos 6 meses)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 240)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.03 240)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 240)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.01 240)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="prestado" fill="oklch(0.45 0.16 155)" radius={[4, 4, 0, 0]} name="Prestado" />
                <Bar dataKey="esperado" fill="oklch(0.62 0.18 155)" radius={[4, 4, 0, 0]} name="Esperado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold mb-1">Tendencia de cobros</h2>
          <p className="text-xs text-muted-foreground mb-4">Monto esperado por mes</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthly ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 240)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.03 240)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 240)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.9 0.01 240)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="esperado"
                  stroke="oklch(0.45 0.16 155)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold mb-4">Próximos pagos</h2>
        {stats?.upcoming.length ? (
          <div className="space-y-3">
            {stats.upcoming.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/50"
              >
                <div>
                  <div className="font-medium">{l.clients?.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    Cédula {l.clients?.cedula ?? "—"} · {new Date(l.payment_date).toLocaleDateString("es")}
                  </div>
                </div>
                <Badge variant="secondary" className="font-semibold">
                  {fmt(Number(l.expected_amount))}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay pagos próximos.</p>
        )}
      </Card>
    </AppLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "primary" | "success" | "warning" | "muted";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`p-2 rounded-lg ${tones[tone]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </Card>
  );
}

function InterestCard({
  expected,
  collected,
  fmt,
}: {
  expected: number;
  collected: number;
  fmt: (n: number) => string;
}) {
  const pct = expected > 0 ? Math.min(100, (collected / expected) * 100) : 0;
  return (
    <Card className="p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">Interés esperado</span>
        <div className="p-2 rounded-lg bg-success/15 text-success">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{fmt(expected)}</div>
      <div className="mt-3 space-y-1">
        <Progress value={pct} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Cobrado: {fmt(collected)}</span>
          <span className="font-medium text-foreground">{pct.toFixed(1)}%</span>
        </div>
      </div>
    </Card>
  );
}