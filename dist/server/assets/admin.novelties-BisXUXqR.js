import { a9 as useRouter, Y as reactExports, P as jsxRuntimeExports } from "./worker-entry-DR4bSXle.js";
import { A as AppLayout, I as Inbox } from "./AppLayout-CY9QZ-Kw.js";
import { C as Card } from "./card-BZ2oXj9b.js";
import { B as Button } from "./button-C9pURHNj.js";
import { B as Badge } from "./badge-HHM55BVR.js";
import { T as Tabs, b as TabsList, c as TabsTrigger, a as TabsContent } from "./tabs-o9rtLHuV.js";
import { T as Textarea } from "./textarea-DMJd0uqG.js";
import { u as useAuth, s as supabase, t as toast } from "./router-CNRSrf85.js";
import { R as REQUEST_LABELS, a as applyChangeRequest } from "./changeRequests-BWUKIM4n.js";
import { X } from "./x-DJbEe9gg.js";
import { C as Check } from "./index-DEX-kEHT.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./wallet-BP1busbB.js";
import "./index-C1dl1jUB.js";
import "./index-B_Ux4b9a.js";
import "./index-ChW4vIqc.js";
const FIELD_LABELS = {
  full_name: "Nombre",
  phone: "Teléfono",
  email: "Email",
  home_address: "Dirección casa",
  work_address: "Dirección trabajo",
  references_info: "Referencias",
  amount: "Capital prestado",
  expected_amount: "Monto a pagar"
};
const fmtMoney = (n) => new Intl.NumberFormat("es", {
  style: "currency",
  currency: "USD"
}).format(Number(n) || 0);
function ChangeDiff({
  req,
  currentLoan,
  currentClient
}) {
  const payload = req.payload ?? {};
  const keys = Object.keys(payload);
  if (!keys.length) return null;
  const isMoney = (k) => k === "amount" || k === "expected_amount";
  const current = req.loan_id ? currentLoan : currentClient;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-muted/30 p-3 mb-2 space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-muted-foreground mb-1", children: "Cambios solicitados" }),
    keys.map((k) => {
      const newVal = payload[k];
      const oldVal = current?.[k];
      const label = FIELD_LABELS[k] ?? k;
      const showOld = oldVal !== void 0 && oldVal !== null && String(oldVal) !== String(newVal);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground min-w-[120px]", children: [
          label,
          ":"
        ] }),
        showOld && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-through text-muted-foreground", children: isMoney(k) ? fmtMoney(oldVal) : String(oldVal) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "→" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: isMoney(k) ? fmtMoney(newVal) : String(newVal) })
      ] }, k);
    }),
    (req.request_type === "increase_loan" || req.request_type === "decrease_loan") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground pt-1 border-t border-border/60 mt-2", children: "Al aprobar, el cambio se reflejará automáticamente en la caja del asesor (préstamos del día)." })
  ] });
}
function NoveltiesPage() {
  const {
    role,
    loading
  } = useAuth();
  const router = useRouter();
  const [rows, setRows] = reactExports.useState([]);
  const [loadingRows, setLoadingRows] = reactExports.useState(true);
  const [profiles, setProfiles] = reactExports.useState({});
  const [clients, setClients] = reactExports.useState({});
  const [clientFull, setClientFull] = reactExports.useState({});
  const [loansFull, setLoansFull] = reactExports.useState({});
  const [notes, setNotes] = reactExports.useState({});
  const [working, setWorking] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (!loading && role !== "admin") router.navigate({
      to: "/dashboard"
    });
  }, [role, loading, router]);
  const load = async () => {
    setLoadingRows(true);
    const {
      data,
      error
    } = await supabase.from("change_requests").select("*").order("created_at", {
      ascending: false
    });
    if (error) toast.error(error.message);
    const list = data ?? [];
    setRows(list);
    const userIds = Array.from(new Set(list.map((r) => r.requested_by)));
    const clientIds = Array.from(new Set(list.map((r) => r.client_id).filter(Boolean)));
    if (userIds.length) {
      const {
        data: ps
      } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      const map = {};
      (ps ?? []).forEach((p) => map[p.id] = p.full_name);
      setProfiles(map);
    }
    if (clientIds.length) {
      const {
        data: cs
      } = await supabase.from("clients").select("id, full_name, phone, email, home_address, work_address, references_info").in("id", clientIds);
      const map = {};
      const full = {};
      (cs ?? []).forEach((c) => {
        map[c.id] = c.full_name;
        full[c.id] = c;
      });
      setClients(map);
      setClientFull(full);
    }
    const loanIds = Array.from(new Set(list.map((r) => r.loan_id).filter(Boolean)));
    if (loanIds.length) {
      const {
        data: ls
      } = await supabase.from("loans").select("id, amount, expected_amount").in("id", loanIds);
      const map = {};
      (ls ?? []).forEach((l) => map[l.id] = {
        amount: Number(l.amount),
        expected_amount: Number(l.expected_amount)
      });
      setLoansFull(map);
    }
    setLoadingRows(false);
  };
  reactExports.useEffect(() => {
    void load();
  }, []);
  const decide = async (req, approve) => {
    setWorking(req.id);
    try {
      if (approve) await applyChangeRequest(req.id);
      const {
        error
      } = await supabase.from("change_requests").update({
        status: approve ? "approved" : "rejected",
        admin_notes: notes[req.id] ?? null,
        reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", req.id);
      if (error) throw error;
      toast.success(approve ? "Novedad aplicada" : "Novedad rechazada");
      await load();
    } catch (e) {
      toast.error(e.message ?? "Error al procesar");
    } finally {
      setWorking(null);
    }
  };
  const renderList = (status) => {
    const filtered = rows.filter((r) => r.status === status);
    if (loadingRows) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground py-8 text-center", children: "Cargando..." });
    if (!filtered.length) return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "h-10 w-10 mx-auto text-muted-foreground mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Sin novedades" })
    ] });
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: REQUEST_LABELS[r.request_type] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            "De ",
            profiles[r.requested_by] ?? "Asesor",
            " ·",
            " ",
            new Date(r.created_at).toLocaleString("es-CO")
          ] }),
          r.client_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm mt-1", children: [
            "Cliente: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: clients[r.client_id] ?? r.client_id })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: status === "pending" ? "outline" : status === "approved" ? "default" : "destructive", children: status === "pending" ? "Pendiente" : status === "approved" ? "Aprobada" : "Rechazada" })
      ] }),
      r.reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm bg-muted/40 rounded p-2 mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Motivo: " }),
        r.reason
      ] }),
      r.payload && Object.keys(r.payload).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeDiff, { req: r, currentLoan: r.loan_id ? loansFull[r.loan_id] : null, currentClient: r.client_id ? clientFull[r.client_id] : null }),
      status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Notas del administrador (opcional)", value: notes[r.id] ?? "", onChange: (e) => setNotes((p) => ({
          ...p,
          [r.id]: e.target.value
        })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", disabled: working === r.id, onClick: () => decide(r, false), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mr-1 h-4 w-4" }),
            " Rechazar"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: working === r.id, onClick: () => decide(r, true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mr-1 h-4 w-4" }),
            " Aprobar y aplicar"
          ] })
        ] })
      ] }) : r.admin_notes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Notas: " }),
        r.admin_notes
      ] }) : null
    ] }, r.id)) });
  };
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Bandeja de novedades" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Solicitudes enviadas por los asesores" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "pending", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pending", children: [
          "Pendientes ",
          pendingCount > 0 && `(${pendingCount})`
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "approved", children: "Aprobadas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "rejected", children: "Rechazadas" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "pending", className: "mt-4", children: renderList("pending") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "approved", className: "mt-4", children: renderList("approved") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "rejected", className: "mt-4", children: renderList("rejected") })
    ] })
  ] });
}
export {
  NoveltiesPage as component
};
