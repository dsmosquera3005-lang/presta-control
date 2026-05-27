import { Y as reactExports, P as jsxRuntimeExports } from "./worker-entry-DR4bSXle.js";
import { A as AppLayout, B as Banknote, U as Users } from "./AppLayout-CY9QZ-Kw.js";
import { C as Card } from "./card-BZ2oXj9b.js";
import { u as useAuth, s as supabase, l as localIsoDate } from "./router-CNRSrf85.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BVT3-eYc.js";
import { T as TrendingUp } from "./trending-up-DfqWW6_3.js";
import { T as TriangleAlert } from "./triangle-alert-LT4FcGEt.js";
import { C as Calendar } from "./calendar-C1xaeimH.js";
import { c as createLucideIcon } from "./wallet-BP1busbB.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./button-C9pURHNj.js";
import "./index-ChW4vIqc.js";
import "./Combination-DwOo3BR9.js";
import "./index-C1dl1jUB.js";
import "./index-DEX-kEHT.js";
const __iconNode$1 = [["path", { d: "M5 12h14", key: "1ays0h" }]];
const Minus = createLucideIcon("minus", __iconNode$1);
const __iconNode = [
  ["path", { d: "M16 17h6v-6", key: "t6n2it" }],
  ["path", { d: "m22 17-8.5-8.5-5 5L2 7", key: "x473p" }]
];
const TrendingDown = createLucideIcon("trending-down", __iconNode);
function getWorkPeriod(reference) {
  const d = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  let startYear = d.getFullYear();
  let startMonth = d.getMonth();
  if (d.getDate() < 4) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }
  const start = new Date(startYear, startMonth, 4);
  const end = new Date(startYear, startMonth + 1, 3);
  const label = `${start.toLocaleDateString("es", {
    day: "2-digit",
    month: "short"
  })} – ${end.toLocaleDateString("es", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  })}`;
  return {
    start,
    end,
    label
  };
}
function prevPeriod(p) {
  const ref = new Date(p.start);
  ref.setDate(ref.getDate() - 1);
  return getWorkPeriod(ref);
}
function isoDate(d) {
  return localIsoDate(d);
}
const isAdditionalPayment = (p) => p.payment_type === "adicional" || p.payment_type === "abono" && (p.notes ?? "").toLowerCase().includes("cobro adicional");
function ReportsPage() {
  const {
    user,
    role
  } = useAuth();
  const [current, setCurrent] = reactExports.useState(null);
  const [previous, setPrevious] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [advisors, setAdvisors] = reactExports.useState([]);
  const [scope, setScope] = reactExports.useState("global");
  reactExports.useEffect(() => {
    if (!user) return;
    if (role !== "admin") {
      setScope(user.id);
      return;
    }
    void (async () => {
      const {
        data
      } = await supabase.from("profiles").select("id, full_name").order("full_name");
      setAdvisors(data ?? []);
    })();
  }, [user, role]);
  reactExports.useEffect(() => {
    if (!user) return;
    void load();
  }, [user, role, scope]);
  const load = async () => {
    setLoading(true);
    const isAdmin = role === "admin";
    const advisorFilter = isAdmin ? scope === "global" ? null : scope : user?.id ?? null;
    const cur = getWorkPeriod(/* @__PURE__ */ new Date());
    const prev = prevPeriod(cur);
    let loansQ = supabase.from("loans").select("id, amount, expected_amount, loan_date, payment_date, status, created_by, created_at");
    let clientsQ = supabase.from("clients").select("id, status, created_at, created_by");
    let paymentsQ = supabase.from("payments").select("amount, payment_date, advisor_id, payment_type, notes");
    if (advisorFilter) {
      loansQ = loansQ.eq("created_by", advisorFilter);
      clientsQ = clientsQ.eq("created_by", advisorFilter);
      paymentsQ = paymentsQ.eq("advisor_id", advisorFilter);
    }
    const [{
      data: loans
    }, {
      data: clients
    }, {
      data: payments
    }] = await Promise.all([loansQ, clientsQ, paymentsQ]);
    const buildStats = (p) => {
      const startIso = isoDate(p.start);
      const endIso = isoDate(p.end);
      const inRange = (iso) => iso >= startIso && iso <= endIso;
      const periodLoans = (loans ?? []).filter((l) => inRange(l.loan_date));
      const prestado = periodLoans.reduce((s, l) => s + Number(l.amount), 0);
      const esperado = (loans ?? []).filter((l) => inRange(l.payment_date)).reduce((s, l) => s + Number(l.expected_amount), 0);
      const intereses = periodLoans.reduce((s, l) => s + (Number(l.expected_amount) - Number(l.amount)), 0);
      const cobrado = (payments ?? []).filter((pa) => inRange(pa.payment_date)).reduce((s, pa) => s + Number(pa.amount), 0);
      const adicionales = (payments ?? []).filter((pa) => inRange(pa.payment_date) && isAdditionalPayment(pa)).reduce((s, pa) => s + Number(pa.amount), 0);
      const clientesInicio = (clients ?? []).filter((c) => isoDate(new Date(c.created_at)) < startIso).length;
      const clientesFin = (clients ?? []).filter((c) => isoDate(new Date(c.created_at)) <= endIso).length;
      const cutoff = new Date(p.end);
      cutoff.setDate(cutoff.getDate() - 15);
      const cutoffIso = isoDate(cutoff);
      const mas15 = (loans ?? []).filter((l) => l.status === "activo" && l.payment_date <= cutoffIso).length;
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
        mas15
      };
    };
    setCurrent(buildStats(cur));
    setPrevious(buildStats(prev));
    setLoading(false);
  };
  const fmt = (n) => new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Informe mensual" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Periodo laboral del día 4 al día 3 del mes siguiente. Comparativa entre el mes actual y el anterior." })
        ] }),
        role === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-[240px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: scope, onValueChange: setScope, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Ámbito" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "global", children: "Global (todos los asesores)" }),
            advisors.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: a.id, children: a.full_name }, a.id))
          ] })
        ] }) })
      ] }),
      role !== "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2", children: "Mostrando tu informe personal." })
    ] }),
    loading || !current || !previous ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Cargando…" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodHeader, { title: "Mes anterior", stats: previous, tone: "muted" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(PeriodHeader, { title: "Mes actual", stats: current, tone: "primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-5 w-5" }), label: "Cartera prestada (capital)", hint: "Suma del monto prestado en el periodo", prev: previous.prestado, curr: current.prestado, fmt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5" }), label: "Cobro esperado (capital + interés)", hint: "Suma de cuotas con vencimiento en el periodo", prev: previous.esperado, curr: current.esperado, fmt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5" }), label: "Intereses generados", hint: "Diferencia entre esperado y capital prestado", prev: previous.intereses, curr: current.intereses, fmt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-5 w-5" }), label: "Total cobrado", hint: "Pagos recibidos durante el periodo", prev: previous.cobrado, curr: current.cobrado, fmt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-5 w-5" }), label: "Adicionales cobrados", hint: "Incluidos dentro del total cobrado", prev: previous.adicionales, curr: current.adicionales, fmt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }), label: "Clientes al inicio del periodo", prev: previous.clientesInicio, curr: current.clientesInicio }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }), label: "Clientes al cierre del periodo", prev: previous.clientesFin, curr: current.clientesFin }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CompareCard, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" }), label: "Clientes con +15 días de mora", prev: previous.mas15, curr: current.mas15, invert: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-3", children: "Resumen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Cobro esperado:" }),
            " ya incluye capital + intereses, porque cada préstamo guarda el monto esperado como capital más el interés pactado."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Periodo actual:" }),
            " ",
            current.label,
            "."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Periodo anterior:" }),
            " ",
            previous.label,
            "."
          ] })
        ] })
      ] })
    ] })
  ] });
}
function PeriodHeader({
  title,
  stats,
  tone
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: `p-5 ${tone === "primary" ? "border-primary/40" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-lg", children: stats.label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5 text-muted-foreground" })
  ] }) });
}
function CompareCard({
  icon,
  label,
  hint,
  prev,
  curr,
  fmt,
  invert = false
}) {
  const diff = curr - prev;
  const pct = prev === 0 ? curr === 0 ? 0 : 100 : diff / Math.abs(prev) * 100;
  const positive = invert ? diff < 0 : diff > 0;
  const negative = invert ? diff > 0 : diff < 0;
  const tone = positive ? "text-success bg-success/15" : negative ? "text-destructive bg-destructive/15" : "text-muted-foreground bg-muted";
  const Icon = positive ? TrendingUp : negative ? TrendingDown : Minus;
  const display = (n) => fmt ? fmt(n) : String(n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 rounded-lg bg-primary/10 text-primary", children: icon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold tracking-tight", children: display(curr) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
      "Anterior: ",
      display(prev)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-3 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${tone}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
      diff === 0 ? "Sin cambios" : `${diff > 0 ? "+" : ""}${fmt ? fmt(diff) : diff} (${pct.toFixed(1)}%)`
    ] }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground mt-2", children: hint })
  ] });
}
export {
  ReportsPage as component
};
