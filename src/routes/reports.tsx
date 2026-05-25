import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Users, Banknote, AlertTriangle, Calendar } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

// Periodo laboral: del día 4 al día 3 del mes siguiente
function getWorkPeriod(reference: Date): { start: Date; end: Date; label: string } {
  const d = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  let startYear = d.getFullYear();
  let startMonth = d.getMonth();
  if (d.getDate() < 4) {
    // aún en periodo del mes anterior
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }
  const start = new Date(startYear, startMonth, 4);
  const end = new Date(startYear, startMonth + 1, 3);
  const label = `${start.toLocaleDateString("es", { day: "2-digit", month: "short" })} – ${end.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}`;
  return { start, end, label };
}

function prevPeriod(p: { start: Date }): { start: Date; end: Date; label: string } {
  const ref = new Date(p.start);
  ref.setDate(ref.getDate() - 1); // un día antes del inicio actual cae en el periodo anterior
  return getWorkPeriod(ref);
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

interface PeriodStats {
  label: string;
  start: string;
  end: string;
  prestado: number; // capital prestado en el periodo
  esperado: number; // suma de expected_amount con payment_date en el periodo (capital + interés)
  intereses: number; // esperado - prestado de los préstamos del periodo
  cobrado: number; // pagos hechos en el periodo
  adicionales: number; // adicionales cobrados, incluidos dentro de cobrado
  clientesInicio: number; // clientes activos al inicio del periodo
  clientesFin: number; // clientes activos al final del periodo
  mas15: number; // préstamos con +15 días de mora al final del periodo
}

const isAdditionalPayment = (p: { payment_type?: string | null; notes?: string | null }) =>
  p.payment_type === "adicional" ||
  (p.payment_type === "abono" && (p.notes ?? "").toLowerCase().includes("cobro adicional"));

function ReportsPage() {
  const { user, role } = useAuth();
  const [current, setCurrent] = useState<PeriodStats | null>(null);
  const [previous, setPrevious] = useState<PeriodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [advisors, setAdvisors] = useState<{ id: string; full_name: string }[]>([]);
  // 'global' o id del asesor. Para asesores no admin se fuerza a su propio id.
  const [scope, setScope] = useState<string>("global");

  useEffect(() => {
    if (!user) return;
    if (role !== "admin") {
      setScope(user.id);
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      setAdvisors(data ?? []);
    })();
  }, [user, role]);

  useEffect(() => {
    if (!user) return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, role, scope]);

  const load = async () => {
    setLoading(true);
    const isAdmin = role === "admin";
    // Si admin y scope = global, no filtra por asesor. Si scope es un id, filtra a ese asesor.
    const advisorFilter = isAdmin ? (scope === "global" ? null : scope) : user?.id ?? null;
    const cur = getWorkPeriod(new Date());
    const prev = prevPeriod(cur);

    let loansQ = supabase
      .from("loans")
      .select("id, amount, expected_amount, loan_date, payment_date, status, created_by, created_at");
    let clientsQ = supabase.from("clients").select("id, status, created_at, created_by");
    let paymentsQ = supabase.from("payments").select("amount, payment_date, advisor_id, payment_type, notes");
    if (advisorFilter) {
      loansQ = loansQ.eq("created_by", advisorFilter);
      clientsQ = clientsQ.eq("created_by", advisorFilter);
      paymentsQ = paymentsQ.eq("advisor_id", advisorFilter);
    }

    const [{ data: loans }, { data: clients }, { data: payments }] = await Promise.all([
      loansQ,
      clientsQ,
      paymentsQ,
    ]);

    const buildStats = (p: { start: Date; end: Date; label: string }): PeriodStats => {
      const startIso = isoDate(p.start);
      const endIso = isoDate(p.end);
      const inRange = (iso: string) => iso >= startIso && iso <= endIso;

      const periodLoans = (loans ?? []).filter((l) => inRange(l.loan_date));
      const prestado = periodLoans.reduce((s, l) => s + Number(l.amount), 0);
      const esperado = (loans ?? [])
        .filter((l) => inRange(l.payment_date))
        .reduce((s, l) => s + Number(l.expected_amount), 0);
      const intereses = periodLoans.reduce(
        (s, l) => s + (Number(l.expected_amount) - Number(l.amount)),
        0
      );
      const cobrado = (payments ?? [])
        .filter((pa) => inRange(pa.payment_date))
        .reduce((s, pa) => s + Number(pa.amount), 0);
      const adicionales = (payments ?? [])
        .filter((pa) => inRange(pa.payment_date) && isAdditionalPayment(pa))
        .reduce((s, pa) => s + Number(pa.amount), 0);

      // Clientes al inicio: creados antes o en startIso
      const clientesInicio = (clients ?? []).filter(
        (c) => isoDate(new Date(c.created_at)) < startIso
      ).length;
      const clientesFin = (clients ?? []).filter(
        (c) => isoDate(new Date(c.created_at)) <= endIso
      ).length;

      // +15 días de mora al final del periodo (préstamos activos cuyo payment_date <= end - 15)
      const cutoff = new Date(p.end);
      cutoff.setDate(cutoff.getDate() - 15);
      const cutoffIso = isoDate(cutoff);
      const mas15 = (loans ?? []).filter(
        (l) => l.status === "activo" && l.payment_date <= cutoffIso
      ).length;

      return {
        label: p.label,
        start: startIso,
        end: endIso,
        prestado,
        esperado,
        intereses,
        cobrado,
        adicionales,
        clientesInicio,
        clientesFin,
        mas15,
      };
    };

    setCurrent(buildStats(cur));
    setPrevious(buildStats(prev));
    setLoading(false);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("es", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <AppLayout>
      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Informe mensual</h1>
            <p className="text-muted-foreground">
              Periodo laboral del día 4 al día 3 del mes siguiente. Comparativa entre el mes actual y el anterior.
            </p>
          </div>
          {role === "admin" && (
            <div className="min-w-[240px]">
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger>
                  <SelectValue placeholder="Ámbito" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (todos los asesores)</SelectItem>
                  {advisors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {role !== "admin" && (
          <p className="text-xs text-muted-foreground mt-2">Mostrando tu informe personal.</p>
        )}
      </header>

      {loading || !current || !previous ? (
        <div className="text-muted-foreground">Cargando…</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <PeriodHeader title="Mes anterior" stats={previous} tone="muted" />
            <PeriodHeader title="Mes actual" stats={current} tone="primary" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <CompareCard
              icon={<Banknote className="h-5 w-5" />}
              label="Cartera prestada (capital)"
              hint="Suma del monto prestado en el periodo"
              prev={previous.prestado}
              curr={current.prestado}
              fmt={fmt}
            />
            <CompareCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Cobro esperado (capital + interés)"
              hint="Suma de cuotas con vencimiento en el periodo"
              prev={previous.esperado}
              curr={current.esperado}
              fmt={fmt}
            />
            <CompareCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Intereses generados"
              hint="Diferencia entre esperado y capital prestado"
              prev={previous.intereses}
              curr={current.intereses}
              fmt={fmt}
            />
            <CompareCard
              icon={<Banknote className="h-5 w-5" />}
              label="Total cobrado"
              hint="Pagos recibidos durante el periodo"
              prev={previous.cobrado}
              curr={current.cobrado}
              fmt={fmt}
            />
            <CompareCard
              icon={<Banknote className="h-5 w-5" />}
              label="Adicionales cobrados"
              hint="Incluidos dentro del total cobrado"
              prev={previous.adicionales}
              curr={current.adicionales}
              fmt={fmt}
            />
            <CompareCard
              icon={<Users className="h-5 w-5" />}
              label="Clientes al inicio del periodo"
              prev={previous.clientesInicio}
              curr={current.clientesInicio}
            />
            <CompareCard
              icon={<Users className="h-5 w-5" />}
              label="Clientes al cierre del periodo"
              prev={previous.clientesFin}
              curr={current.clientesFin}
            />
            <CompareCard
              icon={<AlertTriangle className="h-5 w-5" />}
              label="Clientes con +15 días de mora"
              prev={previous.mas15}
              curr={current.mas15}
              invert
            />
          </div>

          <Card className="p-6">
            <h2 className="font-semibold mb-3">Resumen</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong className="text-foreground">Cobro esperado:</strong> ya incluye capital + intereses,
                porque cada préstamo guarda el monto esperado como capital más el interés pactado.
              </p>
              <p>
                <strong className="text-foreground">Periodo actual:</strong> {current.label}.
              </p>
              <p>
                <strong className="text-foreground">Periodo anterior:</strong> {previous.label}.
              </p>
            </div>
          </Card>
        </>
      )}
    </AppLayout>
  );
}

function PeriodHeader({
  title,
  stats,
  tone,
}: {
  title: string;
  stats: PeriodStats;
  tone: "primary" | "muted";
}) {
  return (
    <Card className={`p-5 ${tone === "primary" ? "border-primary/40" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{title}</div>
          <div className="font-semibold text-lg">{stats.label}</div>
        </div>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
}

function CompareCard({
  icon,
  label,
  hint,
  prev,
  curr,
  fmt,
  invert = false,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  prev: number;
  curr: number;
  fmt?: (n: number) => string;
  invert?: boolean;
}) {
  const diff = curr - prev;
  const pct = prev === 0 ? (curr === 0 ? 0 : 100) : (diff / Math.abs(prev)) * 100;
  const positive = invert ? diff < 0 : diff > 0;
  const negative = invert ? diff > 0 : diff < 0;
  const tone = positive
    ? "text-success bg-success/15"
    : negative
      ? "text-destructive bg-destructive/15"
      : "text-muted-foreground bg-muted";
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  const display = (n: number) => (fmt ? fmt(n) : String(n));

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      </div>
      <div className="text-2xl font-bold tracking-tight">{display(curr)}</div>
      <div className="text-xs text-muted-foreground mt-1">Anterior: {display(prev)}</div>
      <div className={`mt-3 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${tone}`}>
        <Icon className="h-3 w-3" />
        {diff === 0 ? "Sin cambios" : `${diff > 0 ? "+" : ""}${fmt ? fmt(diff) : diff} (${pct.toFixed(1)}%)`}
      </div>
      {hint && <div className="text-[11px] text-muted-foreground mt-2">{hint}</div>}
    </Card>
  );
}
