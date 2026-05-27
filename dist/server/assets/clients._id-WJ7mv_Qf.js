import { a9 as useRouter, Y as reactExports, L as isRedirect, l as createServerFn, P as jsxRuntimeExports } from "./worker-entry-DR4bSXle.js";
import { l as localIsoDate, s as supabase, t as toast, f as useParams, u as useAuth, L as Link, b as cn } from "./router-CNRSrf85.js";
import { A as AppLayout } from "./AppLayout-CY9QZ-Kw.js";
import { C as Card } from "./card-BZ2oXj9b.js";
import { B as Button } from "./button-C9pURHNj.js";
import { B as Badge } from "./badge-HHM55BVR.js";
import { I as Input } from "./input-MtMwySKV.js";
import { L as Label } from "./label-BvGZFAJt.js";
import { T as Textarea } from "./textarea-DMJd0uqG.js";
import { D as Dialog, e as DialogTrigger, a as DialogContent, c as DialogHeader, d as DialogTitle, b as DialogFooter } from "./dialog-De4gqTSZ.js";
import { S as Select, c as SelectTrigger, d as SelectValue, a as SelectContent, b as SelectItem } from "./select-BVT3-eYc.js";
import { c as createSsrRpc } from "./createSsrRpc-BEAA5_MG.js";
import { r as requireSupabaseAuth, b as buildWhatsAppMessage } from "./whatsappHelpers-EuXWngwu.js";
import { P as Phone, c as calcMora, t as totalDue, C as CircleCheck } from "./mora-B_AIzhcM.js";
import { R as REQUEST_LABELS, c as createChangeRequest } from "./changeRequests-BWUKIM4n.js";
import { S as Send } from "./send-B2N-dWzj.js";
import { A as ArrowLeft } from "./arrow-left-1gJc8L64.js";
import { c as createLucideIcon } from "./wallet-BP1busbB.js";
import { C as Calendar } from "./calendar-C1xaeimH.js";
import { F as FileText } from "./file-text-NUOw4-lQ.js";
import { P as Plus } from "./plus-YQO1h4JZ.js";
import { T as TriangleAlert } from "./triangle-alert-LT4FcGEt.js";
import { o as objectType, s as stringType, n as numberType } from "./types-DRCBwTGg.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
import "./index-C1dl1jUB.js";
import "./Combination-DwOo3BR9.js";
import "./index-B_Ux4b9a.js";
import "./x-DJbEe9gg.js";
import "./index-DEX-kEHT.js";
function useServerFn(serverFn) {
  const router = useRouter();
  return reactExports.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M4.929 4.929 19.07 19.071", key: "196cmz" }]
];
const Ban = createLucideIcon("ban", __iconNode$3);
const __iconNode$2 = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
];
const Mail = createLucideIcon("mail", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
];
const MapPin = createLucideIcon("map-pin", __iconNode$1);
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode);
const sendWhatsAppReceipt = createServerFn({
  method: "POST"
}).inputValidator((data) => data).middleware([requireSupabaseAuth]).handler(createSsrRpc("030a98af93c578fb04a439d8bdc7450816ae34af6f0b13cb23c432853ff36155"));
const TYPES = [
  "update_client",
  "increase_loan",
  "decrease_loan",
  "waive_mora",
  "delete_payment",
  "delete_loan",
  "delete_client"
];
const isAdditionalPayment = (p) => p.payment_type === "adicional" || p.payment_type === "abono" && (p.notes ?? "").toLowerCase().includes("cobro adicional");
function NoveltyDialog({ trigger, defaultType, clientId, loanId, paymentId, clientName, current }) {
  const [open, setOpen] = reactExports.useState(false);
  const [type, setType] = reactExports.useState(defaultType ?? "update_client");
  const [reason, setReason] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [fullName, setFullName] = reactExports.useState(current?.full_name ?? "");
  const [phone, setPhone] = reactExports.useState(current?.phone ?? "");
  const [email, setEmail] = reactExports.useState(current?.email ?? "");
  const [home, setHome] = reactExports.useState(current?.home_address ?? "");
  const [work, setWork] = reactExports.useState(current?.work_address ?? "");
  const [newAmount, setNewAmount] = reactExports.useState("");
  const [newExpected, setNewExpected] = reactExports.useState("");
  const [payments, setPayments] = reactExports.useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = reactExports.useState(paymentId ?? "");
  const [activeLoan, setActiveLoan] = reactExports.useState(null);
  const loadAux = async (t = type) => {
    if (!clientId) return;
    if (t === "delete_payment") {
      const today = localIsoDate();
      const { data } = await supabase.from("payments").select("id, amount, payment_type, payment_date, notes").eq("client_id", clientId).eq("payment_date", today).order("created_at", { ascending: false });
      setPayments(data ?? []);
    }
    if (t === "increase_loan" || t === "decrease_loan" || t === "waive_mora" || t === "delete_loan") {
      const { data } = await supabase.from("loans").select("id, amount, expected_amount, status, loan_date").eq("client_id", clientId).order("loan_date", { ascending: false }).limit(1);
      const l = (data ?? [])[0];
      if (l) {
        setActiveLoan({ id: l.id, amount: Number(l.amount), expected_amount: Number(l.expected_amount) });
        if (t === "increase_loan" || t === "decrease_loan") {
          setNewAmount(String(l.amount));
          setNewExpected(String(l.expected_amount));
        }
      } else {
        setActiveLoan(null);
      }
    }
  };
  const submit = async () => {
    if (!reason.trim()) {
      toast.error("Escribe un motivo");
      return;
    }
    let payload = {};
    let resolvedLoanId = loanId ?? null;
    let resolvedPaymentId = paymentId ?? null;
    if (type === "update_client") {
      if (fullName) payload.full_name = fullName;
      if (phone) payload.phone = phone;
      if (email) payload.email = email;
      if (home) payload.home_address = home;
      if (work) payload.work_address = work;
      if (Object.keys(payload).length === 0) {
        toast.error("Cambia al menos un dato");
        return;
      }
    }
    if (type === "increase_loan" || type === "decrease_loan") {
      const a = Number(newAmount);
      const e = Number(newExpected);
      if (!a || !e) {
        toast.error("Ingresa nuevo capital y monto a pagar");
        return;
      }
      if (!activeLoan) {
        toast.error("Este cliente no tiene un crédito para modificar");
        return;
      }
      resolvedLoanId = activeLoan.id;
      payload = {
        amount: a,
        expected_amount: e,
        previous_amount: activeLoan.amount,
        previous_expected: activeLoan.expected_amount
      };
    }
    if (type === "waive_mora" || type === "delete_loan") {
      if (!activeLoan) {
        toast.error("Este cliente no tiene un crédito");
        return;
      }
      resolvedLoanId = activeLoan.id;
    }
    if (type === "delete_payment") {
      if (!selectedPaymentId) {
        toast.error("Selecciona el movimiento a eliminar");
        return;
      }
      resolvedPaymentId = selectedPaymentId;
      const p = payments.find((x) => x.id === selectedPaymentId);
      if (p) {
        const { data: pay } = await supabase.from("payments").select("loan_id, advisor_id, client_id").eq("id", p.id).maybeSingle();
        let prevDate = null;
        let renewedFrom = null;
        let currentLoanId = null;
        if (pay?.loan_id) {
          resolvedLoanId = pay.loan_id;
          currentLoanId = pay.loan_id;
          const { data: ln } = await supabase.from("loans").select("payment_date, renewed_from").eq("id", pay.loan_id).maybeSingle();
          prevDate = ln?.payment_date ?? null;
          renewedFrom = ln?.renewed_from ?? null;
        }
        payload = {
          amount: p.amount,
          payment_type: p.payment_type,
          payment_date: p.payment_date,
          previous_loan_payment_date: prevDate,
          renewed_from: renewedFrom,
          current_loan_id: currentLoanId,
          advisor_id: pay?.advisor_id,
          client_id: pay?.client_id
        };
      }
    }
    setSaving(true);
    try {
      await createChangeRequest({
        request_type: type,
        client_id: clientId ?? null,
        loan_id: resolvedLoanId,
        payment_id: resolvedPaymentId,
        payload,
        reason
      });
      toast.success("Novedad enviada al administrador");
      setOpen(false);
      setReason("");
    } catch (e) {
      toast.error(e.message ?? "Error al enviar novedad");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: (o) => {
    setOpen(o);
    if (o) void loadAux();
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: trigger ?? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "mr-2 h-4 w-4" }),
      " Enviar novedad"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Enviar novedad al administrador" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        clientName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "Cliente: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: clientName })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tipo de novedad" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: type, onValueChange: (v) => {
            const nt = v;
            setType(nt);
            void loadAux(nt);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: REQUEST_LABELS[t] }, t)) })
          ] })
        ] }),
        type === "update_client" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nombre completo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: fullName, onChange: (e) => setFullName(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Teléfono" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: phone, onChange: (e) => setPhone(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Email" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: email, onChange: (e) => setEmail(e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dirección casa" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: home, onChange: (e) => setHome(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dirección trabajo" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: work, onChange: (e) => setWork(e.target.value) })
          ] })
        ] }),
        (type === "increase_loan" || type === "decrease_loan") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          activeLoan ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground rounded-md bg-muted/40 px-2 py-1.5", children: [
            "Crédito actual: capital ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: activeLoan.amount }),
            " · a pagar ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: activeLoan.expected_amount })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-destructive", children: "Este cliente no tiene crédito registrado." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nuevo capital" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: newAmount, onChange: (e) => setNewAmount(e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nuevo monto a pagar" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: newExpected, onChange: (e) => setNewExpected(e.target.value) })
            ] })
          ] })
        ] }),
        type === "delete_payment" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Movimiento a eliminar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedPaymentId, onValueChange: setSelectedPaymentId, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Selecciona un pago" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: payments.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: p.id, children: [
              p.payment_date,
              " · ",
              isAdditionalPayment(p) ? "adicional" : p.payment_type,
              " · $",
              p.amount
            ] }, p.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Para quitar un adicional, selecciona el movimiento marcado como adicional." }),
          payments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-1", children: "Este cliente no tiene movimientos." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Motivo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Explica al administrador por qué se necesita el cambio" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: "Cancelar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: submit, disabled: saving, children: saving ? "Enviando..." : "Enviar novedad" })
      ] })
    ] })
  ] });
}
function ClientDetailPage() {
  const {
    id
  } = useParams({
    from: "/clients/$id"
  });
  const {
    user,
    role
  } = useAuth();
  const [client, setClient] = reactExports.useState(null);
  const [loans, setLoans] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    void load();
  }, [id]);
  const load = async () => {
    setLoading(true);
    const {
      data: c
    } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
    const {
      data: l
    } = await supabase.from("loans").select("id, amount, expected_amount, loan_date, payment_date, status, notes, created_by, mora_waived").eq("client_id", id).order("status", {
      ascending: true
    }).order("loan_date", {
      ascending: false
    });
    setClient(c);
    setLoans(l ?? []);
    setLoading(false);
  };
  const fmt = (n) => new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD"
  }).format(n);
  const hasActiveLoan = loans.some((l) => l.status === "activo");
  const isAdmin = role === "admin";
  const isOwner = !!user && client?.created_by === user.id;
  const canManage = isAdmin || isOwner;
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground", children: "Cargando..." }) });
  }
  if (!client) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Cliente no encontrado." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/clients", className: "text-primary underline mt-2 inline-block", children: "Volver a clientes" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/clients", className: "text-sm text-muted-foreground hover:text-foreground inline-flex items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-1 h-4 w-4" }),
      " Clientes"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "p-6 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-6", children: [
        client.profile_photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: client.profile_photo_url, alt: client.full_name, className: "h-24 w-24 rounded-full object-cover ring-4 ring-primary/10" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold", children: client.full_name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: client.full_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground", children: [
                "Cédula ",
                client.cedula
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientStatusControl, { client, isAdmin, onChanged: load }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 flex-wrap", children: !isAdmin && isOwner && /* @__PURE__ */ jsxRuntimeExports.jsx(NoveltyDialog, { clientId: client.id, clientName: client.full_name, current: {
              full_name: client.full_name,
              phone: client.phone ?? "",
              email: client.email ?? "",
              home_address: client.home_address ?? "",
              work_address: client.work_address ?? ""
            } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-2 mt-3 text-sm", children: [
            client.phone && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }), children: client.phone }),
            client.email && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5" }), children: client.email }),
            client.birth_date && /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3.5 w-3.5" }), children: new Date(client.birth_date).toLocaleDateString("es") })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
            " Direcciones y referencias"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "space-y-3 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pair, { label: "Dirección casa", value: client.home_address }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pair, { label: "Dirección trabajo", value: client.work_address }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pair, { label: "Referencias", value: client.references_info })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
            " Documentos"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocLink, { url: client.cedula_front_url, label: "Cédula (frente)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocLink, { url: client.cedula_back_url, label: "Cédula (reverso)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocLink, { url: client.utility_bill_url, label: "Servicio público" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DocLink, { url: client.payment_proof_url, label: "Comprobante" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold", children: [
            "Préstamos (",
            loans.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open, onOpenChange: setOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: client.status === "sacado" || hasActiveLoan || client.status === "activo" && !canManage, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
              " Nuevo préstamo"
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Registrar nuevo préstamo" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(NewLoanForm, { clientId: client.id, userId: user.id, onCreated: () => {
                setOpen(false);
                void load();
              } })
            ] })
          ] })
        ] }),
        client.status === "sacado" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-4 w-4" }),
          " Cliente sacado: no se permiten nuevos préstamos."
        ] }),
        client.status !== "sacado" && hasActiveLoan && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-primary flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
          " Este cliente ya tiene un préstamo activo. Debe pagarlo o renovarlo antes de crear otro."
        ] }),
        client.status === "en_aviso" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4" }),
          " Cliente en aviso. Cualquier asesor puede reactivarlo."
        ] }),
        loans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "Aún no hay préstamos para este cliente." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: loans.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(LoanRow, { loan: l, fmt, clientId: client.id, userId: user.id, isAdmin, currentUserId: user.id, onChanged: load }, l.id)) })
      ] })
    ] }),
    ")"
  ] });
}
function Info({
  icon,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground", children: [
    icon,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children })
  ] });
}
function Pair({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5", children: value || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "No registrado" }) })
  ] });
}
function DocLink({
  url,
  label
}) {
  if (!url) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-md bg-muted/40 text-xs text-muted-foreground", children: [
      label,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "italic mt-0.5", children: "No subido" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: url, target: "_blank", rel: "noreferrer", className: "p-3 rounded-md bg-primary/5 text-xs hover:bg-primary/10 transition-colors block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5 inline mr-1" }),
    label,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-primary mt-0.5", children: "Ver archivo" })
  ] });
}
const loanSchema = objectType({
  amount: numberType().positive(),
  expected_amount: numberType().positive(),
  payment_date: stringType().min(1)
});
function NewLoanForm({
  clientId,
  userId,
  onCreated
}) {
  const [amount, setAmount] = reactExports.useState("");
  const [expected, setExpected] = reactExports.useState("");
  const localDate = (date2) => {
    const year = date2.getFullYear();
    const month = String(date2.getMonth() + 1).padStart(2, "0");
    const day = String(date2.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = localDate(/* @__PURE__ */ new Date());
  const maxDate = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + 20);
    return localDate(d);
  })();
  const [date, setDate] = reactExports.useState(maxDate);
  const [notes, setNotes] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [rate, setRate] = reactExports.useState(20);
  reactExports.useEffect(() => {
    void (async () => {
      const {
        data
      } = await supabase.from("app_settings").select("interest_rate").eq("id", true).maybeSingle();
      setRate(Number(data?.interest_rate ?? 20));
    })();
  }, []);
  reactExports.useEffect(() => {
    const a = Number(amount);
    if (Number.isFinite(a) && a > 0) {
      setExpected((a + a * rate / 100).toFixed(2));
    } else {
      setExpected("");
    }
  }, [amount, rate]);
  const submit = async (e) => {
    e.preventDefault();
    const parsed = loanSchema.safeParse({
      amount: Number(amount),
      expected_amount: Number(expected),
      payment_date: date
    });
    if (!parsed.success) return toast.error("Revisa los montos y la fecha");
    const startOfDay = /* @__PURE__ */ new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = /* @__PURE__ */ new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const {
      data: renewedToday,
      error: renewCheckError
    } = await supabase.from("loans").select("id").eq("client_id", clientId).not("renewed_from", "is", null).gte("created_at", startOfDay.toISOString()).lte("created_at", endOfDay.toISOString()).limit(1);
    if (renewCheckError) {
      return toast.error("Error validando renovaciones");
    }
    if (renewedToday && renewedToday.length > 0) {
      return toast.error("Este cliente ya fue renovado hoy");
    }
    setSaving(true);
    const {
      error
    } = await supabase.from("loans").insert({
      client_id: clientId,
      amount: parsed.data.amount,
      expected_amount: parsed.data.expected_amount,
      payment_date: parsed.data.payment_date,
      notes: notes || null,
      created_by: userId
    });
    if (error) {
      setSaving(false);
      return toast.error(error.message);
    }
    const {
      error: clientErr
    } = await supabase.from("clients").update({
      status: "activo",
      created_by: userId
    }).eq("id", clientId);
    setSaving(false);
    if (clientErr) return toast.error(clientErr.message);
    toast.success("Préstamo registrado");
    onCreated();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto prestado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: amount, onChange: (e) => setAmount(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto esperado" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: expected, readOnly: true, required: true })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fecha de pago" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value), min: today, max: maxDate, required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Máximo 20 días desde hoy." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas (opcional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "w-full", children: saving ? "Guardando..." : "Registrar préstamo" })
  ] });
}
function LoanRow({
  loan,
  fmt,
  clientId,
  userId,
  isAdmin,
  currentUserId,
  onChanged
}) {
  const overdue = loan.status === "activo" && new Date(loan.payment_date) < /* @__PURE__ */ new Date();
  const status = overdue ? "vencido" : loan.status;
  const tones = {
    activo: "bg-primary/10 text-primary border-primary/30",
    pagado: "bg-success/15 text-success border-success/30",
    vencido: "bg-destructive/10 text-destructive border-destructive/30"
  };
  const [renewOpen, setRenewOpen] = reactExports.useState(false);
  const [payOpen, setPayOpen] = reactExports.useState(false);
  const [nextStatus, setNextStatus] = reactExports.useState("en_aviso");
  const [paying, setPaying] = reactExports.useState(false);
  const [waiving, setWaiving] = reactExports.useState(false);
  const [additionalOpen, setAdditionalOpen] = reactExports.useState(false);
  const mora = calcMora(loan);
  const totalACobrar = totalDue(Number(loan.expected_amount), mora.fee);
  const {
    session
  } = useAuth();
  const sendWhatsAppReceiptFn = useServerFn(sendWhatsAppReceipt);
  const sendReceiptMessage = async (paymentId, blankWindow) => {
    if (!session?.access_token) {
      if (blankWindow) blankWindow.close();
      return {
        success: false,
        error: "No se encontró la sesión de usuario."
      };
    }
    try {
      const result = await sendWhatsAppReceiptFn({
        data: {
          paymentId
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (!result || !result.phoneNumber) {
        if (blankWindow) blankWindow.close();
        return {
          success: false,
          error: "No se pudo generar el enlace de WhatsApp."
        };
      }
      const receiptUrl = result.receiptUrl ?? `${window.location.origin}${result.receiptPath}`;
      const message = buildWhatsAppMessage(result.payment, {
        full_name: result.clientFullName
      }, receiptUrl);
      const whatsappUrl = `https://wa.me/${result.phoneNumber}?text=${encodeURIComponent(message)}`;
      if (blankWindow) {
        blankWindow.location.href = whatsappUrl;
      } else {
        window.location.href = whatsappUrl;
      }
      return {
        success: true
      };
    } catch (error) {
      if (blankWindow) blankWindow.close();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error enviando el comprobante WhatsApp."
      };
    }
  };
  const canActOnLoan = isAdmin || loan.created_by === currentUserId;
  const confirmPayTotal = async () => {
    const blankWindow = window.open("", "_blank");
    setPaying(true);
    const {
      error: loanErr
    } = await supabase.from("loans").update({
      status: "pagado"
    }).eq("id", loan.id);
    if (loanErr) {
      blankWindow?.close();
      setPaying(false);
      return toast.error(loanErr.message);
    }
    const {
      error: clientErr
    } = await supabase.from("clients").update({
      status: nextStatus
    }).eq("id", clientId);
    if (!clientErr) {
      const {
        data: paymentData,
        error: paymentErr
      } = await supabase.from("payments").insert({
        loan_id: loan.id,
        client_id: clientId,
        advisor_id: currentUserId,
        payment_type: "total",
        amount: totalACobrar,
        notes: mora.fee > 0 ? `Incluye mora ${mora.percent}% (${mora.fee})` : null
      }).select("id").maybeSingle();
      if (paymentErr) {
        blankWindow?.close();
        setPaying(false);
        return toast.error(paymentErr.message);
      }
      if (paymentData?.id) {
        const result = await sendReceiptMessage(paymentData.id, blankWindow);
        if (!result.success) {
          toast.error(`Pago registrado, pero no se pudo enviar el comprobante WhatsApp. ${result.error ?? ""}`);
        }
      }
    }
    setPaying(false);
    if (clientErr) {
      blankWindow?.close();
      return toast.error(clientErr.message);
    }
    toast.success("Pago total registrado");
    setPayOpen(false);
    onChanged();
  };
  const toggleWaiveMora = async () => {
    setWaiving(true);
    const {
      error
    } = await supabase.from("loans").update({
      mora_waived: !loan.mora_waived
    }).eq("id", loan.id);
    setWaiving(false);
    if (error) return toast.error(error.message);
    toast.success(loan.mora_waived ? "Mora reactivada" : "Mora anulada");
    onChanged();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-lg border border-border bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold", children: [
          fmt(Number(loan.amount)),
          " → ",
          fmt(Number(loan.expected_amount))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Prestado: ",
          new Date(loan.loan_date).toLocaleDateString("es"),
          " · Pago: ",
          new Date(loan.payment_date).toLocaleDateString("es")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: tones[status], children: status })
    ] }),
    loan.status !== "pagado" && (mora.days > 0 || mora.waived) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mt-2 rounded-md px-3 py-2 text-xs flex items-center justify-between gap-2 border", mora.waived ? "border-success/30 bg-success/10 text-success" : mora.fee > 0 ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/10 text-warning"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5" }),
        mora.waived ? `Mora anulada (${mora.days}d de atraso)` : mora.fee > 0 ? `${mora.days}d en mora · Recargo ${mora.percent}% = ${fmt(mora.fee)}` : `${mora.days}d de atraso · sin recargo aún`
      ] }),
      mora.fee > 0 && !mora.waived && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
        "Total: ",
        fmt(totalACobrar)
      ] })
    ] }),
    loan.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: loan.notes }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-2", children: [
      loan.status !== "pagado" && canActOnLoan && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: additionalOpen, onOpenChange: setAdditionalOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-1.5 h-4 w-4" }),
            " Adicional"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Registrar adicional" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AdditionalLoanForm, { loan, clientId, userId, onDone: () => {
              setAdditionalOpen(false);
              onChanged();
            } })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: payOpen, onOpenChange: setPayOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "default", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-1.5 h-4 w-4" }),
            " Pagar total"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Confirmar pago total" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "¿Estás seguro de marcar este crédito como pagado en su totalidad? Esta acción cerrará el préstamo." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/40 p-3 text-sm space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Cuota esperada" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: fmt(Number(loan.expected_amount)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                    "Recargo mora (",
                    mora.percent,
                    "%)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: mora.fee > 0 ? "text-destructive font-semibold" : "", children: fmt(mora.fee) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t pt-1 mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Total a cobrar" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: fmt(totalACobrar) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estado del cliente después del pago" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: nextStatus, onValueChange: (v) => setNextStatus(v), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "en_aviso", children: "En aviso (cualquier asesor puede reactivarlo)" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sacado", children: "Sacado (solo admin puede reactivar)" })
                  ] })
                ] }),
                nextStatus === "sacado" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-destructive flex items-center gap-1 mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3 w-3" }),
                  " Solo un administrador podrá reactivarlo."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setPayOpen(false), disabled: paying, children: "Cancelar" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirmPayTotal, disabled: paying, children: paying ? "Guardando..." : "Confirmar pago" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: renewOpen, onOpenChange: setRenewOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "mr-1.5 h-4 w-4" }),
            " Renovar (solo interés)"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Renovar crédito" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(RenewLoanForm, { loan, clientId, userId, onDone: () => {
              setRenewOpen(false);
              onChanged();
            } })
          ] })
        ] })
      ] }),
      loan.status !== "pagado" && isAdmin && (mora.days >= 5 || mora.waived) && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: toggleWaiveMora, disabled: waiving, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "mr-1.5 h-4 w-4" }),
        loan.mora_waived ? "Reactivar mora" : "Anular mora y días"
      ] })
    ] })
  ] });
}
function AdditionalLoanForm({
  loan,
  clientId,
  userId,
  onDone
}) {
  const [additionalAmount, setAdditionalAmount] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [rate, setRate] = reactExports.useState(20);
  reactExports.useEffect(() => {
    void (async () => {
      const {
        data
      } = await supabase.from("app_settings").select("interest_rate").eq("id", true).maybeSingle();
      setRate(Number(data?.interest_rate ?? 20));
    })();
  }, []);
  const adicional = Number(additionalAmount || 0);
  const submit = async (e) => {
    e.preventDefault();
    if (!adicional || adicional <= 0) {
      return toast.error("Ingresa un valor válido");
    }
    setSaving(true);
    const {
      error
    } = await supabase.from("payments").insert({
      loan_id: loan.id,
      client_id: clientId,
      advisor_id: userId,
      payment_type: "abono",
      amount: adicional,
      notes: `Cobro adicional`
    });
    setSaving(false);
    if (error) {
      return toast.error(error.message);
    }
    toast.success("Adicional registrado");
    onDone();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-muted/40 p-3 text-sm", children: "Este valor será registrado como un cobro adicional y se sumará en caja del día." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monto adicional" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: additionalAmount, onChange: (e) => setAdditionalAmount(e.target.value), required: true })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "w-full", children: saving ? "Procesando..." : "Confirmar adicional" })
  ] });
}
function ClientStatusControl({
  client,
  isAdmin,
  onChanged
}) {
  const [saving, setSaving] = reactExports.useState(false);
  const {
    user
  } = useAuth();
  const [activateOpen, setActivateOpen] = reactExports.useState(false);
  const tones = {
    activo: "bg-success/15 text-success border-success/30",
    en_aviso: "bg-warning/15 text-warning border-warning/30",
    sacado: "bg-destructive/10 text-destructive border-destructive/30"
  };
  const labels = {
    activo: "Activo",
    en_aviso: "En aviso",
    sacado: "Sacado"
  };
  const lockedForNonAdmin = client.status === "sacado" && !isAdmin;
  const change = async (next) => {
    if (next === client.status) return;
    setSaving(true);
    const updatePayload = {
      status: next
    };
    if (!isAdmin && user && client.status === "en_aviso" && next === "activo") {
      updatePayload.created_by = user.id;
    }
    const {
      error
    } = await supabase.from("clients").update(updatePayload).eq("id", client.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Estado cambiado a ${labels[next]}`);
    onChanged();
  };
  if (lockedForNonAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: tones.sacado, children: labels.sacado });
  }
  if (!isAdmin) {
    if (client.status === "en_aviso") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: tones.en_aviso, children: labels.en_aviso }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: activateOpen, onOpenChange: setActivateOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "secondary", disabled: saving, children: "Activar cliente" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Activar cliente y registrar préstamo" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Al registrar el préstamo, el cliente pasará a estar activo bajo tu cuenta." }),
            user && /* @__PURE__ */ jsxRuntimeExports.jsx(NewLoanForm, { clientId: client.id, userId: user.id, onCreated: () => {
              setActivateOpen(false);
              onChanged();
            } })
          ] })
        ] })
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: tones[client.status], children: labels[client.status] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: tones[client.status], children: labels[client.status] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: client.status, onValueChange: (v) => change(v), disabled: saving, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 w-[140px] text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "activo", children: "Activo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "en_aviso", children: "En aviso" }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "sacado", children: "Sacado" })
      ] })
    ] })
  ] });
}
function RenewLoanForm({
  loan,
  clientId,
  userId,
  onDone
}) {
  const [rate, setRate] = reactExports.useState(20);
  const [interest, setInterest] = reactExports.useState("");
  const moraInfo = calcMora(loan);
  const moraFee = moraInfo.fee;
  const today = localIsoDate();
  const maxDate = (() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + 20);
    return localIsoDate(d);
  })();
  const [nextDate, setNextDate] = reactExports.useState(maxDate);
  const [notes, setNotes] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const {
    session
  } = useAuth();
  const sendWhatsAppReceiptFn = useServerFn(sendWhatsAppReceipt);
  reactExports.useEffect(() => {
    void (async () => {
      const {
        data
      } = await supabase.from("app_settings").select("interest_rate").eq("id", true).maybeSingle();
      const r = Number(data?.interest_rate ?? 20);
      setRate(r);
      const baseInteres = Number(loan.amount) * r / 100;
      setInterest((baseInteres + moraFee).toFixed(2));
    })();
  }, [loan.amount, moraFee]);
  const fmt = (n) => new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD"
  }).format(n);
  const submit = async (e) => {
    e.preventDefault();
    const interestNum = Number(interest);
    if (!Number.isFinite(interestNum) || interestNum <= 0) return toast.error("Monto de interés inválido");
    if (!nextDate) return toast.error("Selecciona la próxima fecha de pago");
    setSaving(true);
    const startOfDay = /* @__PURE__ */ new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = /* @__PURE__ */ new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const {
      data: renewedToday,
      error: renewCheckError
    } = await supabase.from("loans").select("id").eq("client_id", clientId).not("renewed_from", "is", null).gte("created_at", startOfDay.toISOString()).lte("created_at", endOfDay.toISOString()).limit(1);
    if (renewCheckError) {
      setSaving(false);
      return toast.error("Error validando renovaciones de hoy");
    }
    if (renewedToday && renewedToday.length > 0) {
      setSaving(false);
      return toast.error("Este cliente ya tuvo una renovación de interés el día de hoy");
    }
    const {
      error: e1
    } = await supabase.from("loans").update({
      status: "pagado"
    }).eq("id", loan.id);
    if (e1) {
      setSaving(false);
      return toast.error(e1.message);
    }
    const newExpected = Number(loan.amount) + interestNum;
    const {
      error: e2
    } = await supabase.from("loans").insert({
      client_id: clientId,
      created_by: userId,
      amount: Number(loan.amount),
      expected_amount: newExpected,
      payment_date: nextDate,
      notes: notes || `Renovación. Interés pagado: ${fmt(interestNum)}`,
      renewed_from: loan.id,
      interest_paid: interestNum
    });
    if (e2) {
      setSaving(false);
      return toast.error(e2.message);
    }
    const {
      data: paymentData,
      error: paymentErr
    } = await supabase.from("payments").insert({
      loan_id: loan.id,
      client_id: clientId,
      advisor_id: userId,
      payment_type: "interes",
      amount: interestNum
    }).select("id").maybeSingle();
    if (paymentErr) {
      setSaving(false);
      return toast.error(paymentErr.message);
    }
    if (paymentData?.id) {
      const blankWindow = window.open("", "_blank");
      if (!session?.access_token) {
        blankWindow?.close();
        toast.error("No se encontró la sesión de usuario para enviar el comprobante.");
      } else {
        try {
          const result = await sendWhatsAppReceiptFn({
            data: {
              paymentId: paymentData.id
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          });
          if (!result || !result.phoneNumber) {
            blankWindow?.close();
            toast.error("Pago registrado, pero no se pudo generar el enlace de WhatsApp.");
          } else {
            const receiptUrl = result.receiptUrl ?? `${window.location.origin}${result.receiptPath}`;
            const message = buildWhatsAppMessage(result.payment, {
              full_name: result.clientFullName
            }, receiptUrl);
            const whatsappUrl = `https://wa.me/${result.phoneNumber}?text=${encodeURIComponent(message)}`;
            if (blankWindow) {
              blankWindow.location.href = whatsappUrl;
            } else {
              window.location.href = whatsappUrl;
            }
          }
        } catch (error) {
          blankWindow?.close();
          toast.error(`Pago registrado, pero no se pudo enviar el comprobante WhatsApp. ${error instanceof Error ? error.message : ""}`);
        }
      }
    }
    setSaving(false);
    toast.success("Crédito renovado");
    onDone();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md bg-muted/40 p-3 text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "Capital actual: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(Number(loan.amount)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-muted-foreground text-xs", children: [
        "Tasa configurada: ",
        rate,
        "%"
      ] }),
      moraFee > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-destructive text-xs", children: [
        "Mora (",
        moraInfo.days,
        " días, ",
        moraInfo.percent,
        "%): ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmt(moraFee) }),
        " incluida en el servicio"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
        "Servicio a pagar ",
        moraFee > 0 ? "(interés + mora)" : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: interest, readOnly: true, required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Calculado automáticamente: capital × ",
        rate,
        "%",
        moraFee > 0 ? " + mora acumulada" : "",
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Próxima fecha de pago" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: nextDate, onChange: (e) => setNextDate(e.target.value), min: today, max: maxDate, required: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Máximo 20 días desde hoy." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notas (opcional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), rows: 2 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
      "Nuevo monto esperado: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: fmt(Number(loan.amount) + (Number(interest) || 0)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving, className: "w-full", children: saving ? "Procesando..." : "Confirmar renovación" })
  ] });
}
export {
  ClientDetailPage as component
};
