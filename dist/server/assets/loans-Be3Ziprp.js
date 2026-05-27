import { Y as reactExports, P as jsxRuntimeExports } from "./worker-entry-u5osyKlM.js";
import { u as useAuth, s as supabase, b as cn, l as localIsoDate, L as Link } from "./router-Qm6JXj-0.js";
import { A as AppLayout, U as Users } from "./AppLayout-K_SdKmBk.js";
import { C as Card } from "./card-B7GkNEAy.js";
import { I as Input } from "./input-BSrnxUAA.js";
import { B as Badge } from "./badge-D8T-nd2b.js";
import { B as Button } from "./button-CBWpG-_X.js";
import { C as CircleCheck, c as calcMora, t as totalDue, P as Phone } from "./mora-IxTxd2Ua.js";
import { c as createLucideIcon } from "./wallet-DqkLRMIT.js";
import { D as DollarSign } from "./dollar-sign-Bv_oneof.js";
import { F as FileText } from "./file-text-QGoRE7X4.js";
import { T as TriangleAlert } from "./triangle-alert-DB-fqSS_.js";
import { S as Search } from "./search-BCBGiS30.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const __iconNode$5 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "m9 16 2 2 4-4", key: "19s6y9" }]
];
const CalendarCheck = createLucideIcon("calendar-check", __iconNode$5);
const __iconNode$4 = [
  ["path", { d: "M16 14v2.2l1.6 1", key: "fo4ql5" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5", key: "1osxxc" }],
  ["path", { d: "M3 10h5", key: "r794hk" }],
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["circle", { cx: "16", cy: "16", r: "6", key: "qoo3c4" }]
];
const CalendarClock = createLucideIcon("calendar-clock", __iconNode$4);
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$3);
const __iconNode$2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
];
const Clock = createLucideIcon("clock", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
      key: "r04s7s"
    }
  ]
];
const Star = createLucideIcon("star", __iconNode);
const todayStr = () => localIsoDate();
const fmt = (n) => new Intl.NumberFormat("es", {
  style: "currency",
  currency: "USD"
}).format(n);
function daysBetween(fromIso, to = /* @__PURE__ */ new Date()) {
  const a = /* @__PURE__ */ new Date(fromIso + "T00:00:00");
  const ms = to.getTime() - a.getTime();
  return Math.floor(ms / 864e5);
}
function LoansBandejaPage() {
  const {
    user,
    role
  } = useAuth();
  const [clients, setClients] = reactExports.useState([]);
  const [loans, setLoans] = reactExports.useState([]);
  const [payments, setPayments] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("totales");
  const [selectedId, setSelectedId] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (user) void load();
  }, [user, role]);
  const load = async () => {
    setLoading(true);
    const today = todayStr();
    let cq = supabase.from("clients").select("id, cedula, full_name, phone, email, profile_photo_url, status, created_by").order("full_name", {
      ascending: true
    });
    if (role !== "admin" && user) cq = cq.eq("created_by", user.id);
    const {
      data: cs
    } = await cq;
    setClients(cs ?? []);
    let lq = supabase.from("loans").select("id, amount, expected_amount, loan_date, payment_date, status, client_id, created_by, renewed_from, mora_waived");
    if (role !== "admin" && user) lq = lq.eq("created_by", user.id);
    const {
      data: ls
    } = await lq;
    setLoans(ls ?? []);
    let pq = supabase.from("payments").select("id, amount, payment_type, payment_date, client_id, loan_id").eq("payment_date", today);
    if (role !== "admin" && user) pq = pq.eq("advisor_id", user.id);
    const {
      data: ps
    } = await pq;
    setPayments(ps ?? []);
    setLoading(false);
  };
  const clientInfo = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
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
        paidToday
      });
    }
    return map;
  }, [clients, loans, payments]);
  const filtered = reactExports.useMemo(() => {
    const term = search.trim().toLowerCase();
    const arr = Array.from(clientInfo.values()).filter(({
      client,
      activeLoan,
      daysOverdue,
      paidToday
    }) => {
      if (term) {
        const hit = client.full_name.toLowerCase().includes(term) || client.cedula.toLowerCase().includes(term);
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
  const counts = reactExports.useMemo(() => {
    const all = Array.from(clientInfo.values());
    return {
      totales: all.length,
      pagan_hoy: all.filter((x) => x.activeLoan?.payment_date === todayStr()).length,
      pendientes_hoy: all.filter((x) => x.activeLoan?.payment_date === todayStr() && x.paidToday.length === 0).length,
      gestionados_hoy: all.filter((x) => x.paidToday.length > 0).length,
      mora_1_15: all.filter((x) => x.activeLoan && x.daysOverdue >= 1 && x.daysOverdue <= 15).length,
      mora_16_30: all.filter((x) => x.activeLoan && x.daysOverdue >= 16 && x.daysOverdue <= 30).length,
      mora_30_mas: all.filter((x) => x.activeLoan && x.daysOverdue > 30).length,
      pg: all.filter((x) => x.paidToday.length > 0).length,
      np: all.filter((x) => x.activeLoan && x.daysOverdue >= 0 && x.paidToday.length === 0).length,
      acuerdos: all.filter((x) => x.client.status === "en_aviso").length
    };
  }, [clientInfo]);
  const sideItems = [{
    key: "totales",
    label: "Clientes Totales",
    icon: Users,
    tone: "text-primary"
  }, {
    key: "pagan_hoy",
    label: "Pagan Hoy",
    icon: CalendarCheck,
    tone: "text-primary"
  }, {
    key: "pendientes_hoy",
    label: "Pendientes Hoy",
    icon: Clock,
    tone: "text-warning"
  }, {
    key: "gestionados_hoy",
    label: "Gestionados Hoy",
    icon: CircleCheck,
    tone: "text-success"
  }, {
    key: "pg",
    label: "PG (Pago)",
    icon: DollarSign,
    tone: "text-success"
  }, {
    key: "np",
    label: "NP (No Pago)",
    icon: CircleX,
    tone: "text-destructive"
  }, {
    key: "acuerdos",
    label: "Acuerdos Pago",
    icon: FileText,
    tone: "text-warning"
  }, {
    key: "mora_1_15",
    label: "Mora 1 - 15",
    icon: TriangleAlert,
    tone: "text-warning"
  }, {
    key: "mora_16_30",
    label: "Mora 16 - 30",
    icon: TriangleAlert,
    tone: "text-destructive"
  }, {
    key: "mora_30_mas",
    label: "Mora +30",
    icon: TriangleAlert,
    tone: "text-destructive"
  }];
  const selected = selectedId ? clientInfo.get(selectedId) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "Bandeja de cobro" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Busca, filtra y gestiona tus clientes del día" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-12 gap-4 min-h-[calc(100vh-220px)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "col-span-12 lg:col-span-3 p-3 overflow-y-auto max-h-[calc(100vh-160px)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase text-muted-foreground px-2 pb-2", children: "Bandeja" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-1", children: sideItems.map((it) => {
          const Icon = it.icon;
          const active = filter === it.key;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setFilter(it.key), className: cn("w-full flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors", active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/60"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: cn("h-4 w-4", active ? "text-primary" : it.tone) }),
              it.label
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: counts[it.key] })
          ] }, it.key);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "col-span-12 lg:col-span-4 p-3 overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Buscar cliente...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 rounded-full" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1 px-1 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { color: "primary", label: "HOY", count: counts.pagan_hoy }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { color: "warning", label: "1CR", count: Array.from(clientInfo.values()).filter((x) => x.creditCount === 1).length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { color: "primary", label: "PTE", count: counts.pendientes_hoy }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { color: "destructive", label: "MOR", count: counts.mora_1_15 + counts.mora_16_30 + counts.mora_30_mas }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { color: "success", label: "PAG", count: counts.pg })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground px-1 pb-2", children: [
          "Mostrando ",
          filtered.length,
          " ",
          filtered.length === 1 ? "cliente" : "clientes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-2 pr-1", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground py-8", children: "Cargando..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground py-8", children: "Sin resultados." }) : filtered.map(({
          client,
          activeLoan,
          daysOverdue,
          paidToday
        }) => {
          const isSelected = selectedId === client.id;
          const moraTone = daysOverdue > 30 ? "text-destructive" : daysOverdue > 0 ? "text-warning" : "text-muted-foreground";
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedId(client.id), className: cn("w-full text-left rounded-lg border p-3 transition-all", isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/30"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
            client.profile_photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: client.profile_photo_url, alt: client.full_name, className: "h-10 w-10 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm", children: client.full_name.charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm truncate", children: client.full_name }),
                activeLoan && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground whitespace-nowrap", children: new Date(activeLoan.payment_date).toLocaleDateString("es", {
                  day: "2-digit",
                  month: "short"
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 mt-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs", moraTone), children: activeLoan ? daysOverdue > 0 ? `${daysOverdue}d mora` : daysOverdue === 0 ? "Vence hoy" : `${Math.abs(daysOverdue)}d resta` : "Sin crédito" }),
                activeLoan && (() => {
                  const m = calcMora(activeLoan);
                  const due = totalDue(Number(activeLoan.expected_amount), m.fee);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-primary text-right", children: [
                    fmt(due),
                    m.fee > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-[10px] font-normal text-destructive", children: [
                      "+",
                      fmt(m.fee),
                      " mora (",
                      m.percent,
                      "%)"
                    ] })
                  ] });
                })()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-2", children: [
                paidToday.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-success/10 text-success border-success/30 text-[10px] py-0", children: "Pago" }),
                client.status === "en_aviso" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-warning/15 text-warning border-warning/30 text-[10px] py-0", children: "Aviso" }),
                activeLoan && daysOverdue > 0 && paidToday.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-destructive/10 text-destructive border-destructive/30 text-[10px] py-0", children: "Mora" })
              ] })
            ] })
          ] }) }, client.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "col-span-12 lg:col-span-5 p-4 overflow-y-auto max-h-[calc(100vh-160px)]", children: !selected ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-10 w-10 mb-2 opacity-40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Selecciona un cliente para ver el resumen" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ClientDetail, { info: selected }) })
    ] })
  ] });
}
function Chip({
  color,
  label,
  count
}) {
  const tones = {
    primary: "bg-primary/10 text-primary border-primary/30",
    warning: "bg-warning/15 text-warning border-warning/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    success: "bg-success/15 text-success border-success/30"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", tones[color]), children: [
    label,
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: count })
  ] });
}
function ClientDetail({
  info
}) {
  const {
    client,
    activeLoan,
    daysOverdue,
    creditCount,
    paidToday
  } = info;
  const cobrado = paidToday.reduce((s, p) => s + Number(p.amount), 0);
  const mora = activeLoan ? calcMora(activeLoan) : null;
  const due = activeLoan ? totalDue(Number(activeLoan.expected_amount), mora?.fee ?? 0) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      client.profile_photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: client.profile_photo_url, alt: client.full_name, className: "h-14 w-14 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold", children: client.full_name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-lg leading-tight", children: client.full_name }),
        client.email && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: client.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3 mr-1" }),
            "Cédula ",
            client.cedula
          ] }),
          client.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3 mr-1" }),
            client.phone
          ] }),
          activeLoan && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-[11px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3 w-3 mr-1" }),
            "Pago: ",
            new Date(activeLoan.payment_date).toLocaleDateString("es")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/clients/$id", params: {
        id: client.id
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "default", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-1" }),
        " Abrir ficha"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4 bg-muted/20 border-muted", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-3", children: "Resumen Financiero" }),
      activeLoan ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Total a cobrar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-primary", children: fmt(due) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "Cuota ",
            fmt(Number(activeLoan.expected_amount)),
            mora && mora.fee > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-destructive", children: [
              "+ Mora ",
              fmt(mora.fee),
              " (",
              mora.percent,
              "%)"
            ] }),
            mora?.waived && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-success", children: "Mora anulada por administrador" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Préstamo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: fmt(Number(activeLoan.amount)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Mora (días)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-semibold", daysOverdue > 0 ? "text-destructive" : "text-success"), children: daysOverdue > 0 ? daysOverdue : 0 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Recargo mora" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-semibold", (mora?.fee ?? 0) > 0 ? "text-destructive" : ""), children: fmt(mora?.fee ?? 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Créditos totales" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: creditCount })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Sin crédito activo." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold mb-3", children: "Pagos de hoy" }),
      paidToday.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Sin pagos registrados hoy." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        paidToday.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize text-muted-foreground", children: p.payment_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: fmt(Number(p.amount)) })
        ] }, p.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm pt-2 border-t mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Total cobrado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-success", children: fmt(cobrado) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/clients/$id", params: {
      id: client.id
    }, className: "block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full", size: "lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-4 w-4 mr-2" }),
      " Ir a cobrar / gestionar"
    ] }) })
  ] });
}
export {
  LoansBandejaPage as component
};
