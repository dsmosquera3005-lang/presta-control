import { P as jsxRuntimeExports, O as Outlet, Y as reactExports } from "./worker-entry-DR4bSXle.js";
import { u as useAuth, s as supabase, t as toast, L as Link } from "./router-CNRSrf85.js";
import { u as useLocation, A as AppLayout } from "./AppLayout-CY9QZ-Kw.js";
import { C as Card } from "./card-BZ2oXj9b.js";
import { I as Input } from "./input-MtMwySKV.js";
import { B as Button } from "./button-C9pURHNj.js";
import { B as Badge } from "./badge-HHM55BVR.js";
import { P as Plus } from "./plus-YQO1h4JZ.js";
import { S as Search } from "./search-F8cVrw3C.js";
import { c as createLucideIcon } from "./wallet-BP1busbB.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const __iconNode = [
  ["path", { d: "M18 20a6 6 0 0 0-12 0", key: "1qehca" }],
  ["circle", { cx: "12", cy: "10", r: "4", key: "1h16sb" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const CircleUserRound = createLucideIcon("circle-user-round", __iconNode);
function ClientsPage() {
  const location = useLocation();
  if (location.pathname !== "/clients") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientsListPage, {});
}
function ClientsListPage() {
  const {
    user,
    role
  } = useAuth();
  const [clients, setClients] = reactExports.useState([]);
  const [search, setSearch] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (user) void load();
  }, [user, role]);
  const load = async () => {
    setLoading(true);
    let q = supabase.from("clients").select("id, cedula, full_name, phone, profile_photo_url, created_at, status").order("created_at", {
      ascending: false
    });
    if (role !== "admin" && user) {
      q = q.eq("created_by", user.id).eq("status", "activo");
    }
    const {
      data,
      error
    } = await q;
    if (error) toast.error(error.message);
    setClients(data ?? []);
    setLoading(false);
  };
  const handleSearch = async () => {
    const term = search.trim();
    if (!term) return load();
    let q = supabase.from("clients").select("id, cedula, full_name, phone, profile_photo_url, created_at, status").or(`cedula.ilike.%${term}%,full_name.ilike.%${term}%`);
    if (role !== "admin" && user) {
      q = q.eq("created_by", user.id).eq("status", "activo");
    }
    const {
      data
    } = await q;
    setClients(data ?? []);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Clientes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Busca por cédula o crea uno nuevo" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/clients/new", search: {
        cedula: ""
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        " Nuevo cliente"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Buscar por cédula o nombre...", value: search, onChange: (e) => setSearch(e.target.value), onKeyDown: (e) => e.key === "Enter" && handleSearch(), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleSearch, variant: "secondary", children: "Buscar" })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "Cargando..." }) : clients.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUserRound, { className: "h-12 w-12 mx-auto text-muted-foreground mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-4", children: search.trim() ? `No encontramos clientes con "${search.trim()}".` : "No hay clientes registrados." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: clients.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/clients/$id", params: {
      id: c.id
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-4 hover:shadow-[var(--shadow-card)] hover:border-primary/30 transition-all cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      c.profile_photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.profile_photo_url, alt: c.full_name, className: "h-12 w-12 rounded-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold", children: c.full_name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: c.full_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Cédula ",
          c.cedula,
          " ",
          c.phone ? `· ${c.phone}` : ""
        ] })
      ] }),
      c.status === "sacado" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-destructive/10 text-destructive border-destructive/30", children: "Sacado" }) : c.status === "en_aviso" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "bg-warning/15 text-warning border-warning/30", children: "En aviso" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: "Ver" })
    ] }) }) }, c.id)) })
  ] });
}
export {
  ClientsPage as component
};
