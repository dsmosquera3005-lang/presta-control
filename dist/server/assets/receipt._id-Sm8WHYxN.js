import { l as createServerFn, Y as reactExports, P as jsxRuntimeExports } from "./worker-entry-DR4bSXle.js";
import { f as useParams } from "./router-CNRSrf85.js";
import { C as Card } from "./card-BZ2oXj9b.js";
import { B as Button } from "./button-C9pURHNj.js";
import { c as createSsrRpc } from "./createSsrRpc-BEAA5_MG.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const fetchReceiptData = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("56d06d808f618ec68a19f6603fa4eb5bb73c25b7a68af3de013911dba9a9d06d"));
function ReceiptPage() {
  const {
    id
  } = useParams({
    from: "/receipt/$id"
  });
  const [loading, setLoading] = reactExports.useState(true);
  const [receipt, setReceipt] = reactExports.useState(null);
  const [error, setError] = reactExports.useState(null);
  const loadReceiptData = async (receiptId) => {
    try {
      const res = await fetchReceiptData({
        data: {
          paymentId: receiptId
        }
      });
      console.debug("Server function response for fetchReceiptData:", res);
      return {
        payment_id: res.payment.id,
        amount: Number(res.payment.amount),
        payment_type: res.payment.payment_type,
        notes: res.payment.notes,
        created_at: res.payment.created_at,
        client_id: res.payment.client_id,
        client_full_name: res.client.full_name,
        payment_proof_url: res.client.payment_proof_url
      };
    } catch (err) {
      console.error("Exception calling fetchReceiptData:", err);
      throw err;
    }
  };
  reactExports.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      if (!id) {
        setError("ID de comprobante inválido.");
        setLoading(false);
        return;
      }
      try {
        const typedData = await loadReceiptData(id);
        setReceipt(typedData);
      } catch (fetchError) {
        console.error("Error cargando comprobante:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar el comprobante.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id]);
  const fmt = (n) => new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD"
  }).format(n);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 text-muted-foreground", children: "Cargando comprobante..." });
  }
  if (error || !receipt) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-xl p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold mb-3", children: "Comprobante no disponible" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: error ?? "No se encontró el comprobante solicitado." })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background px-4 py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm uppercase tracking-[0.2em] text-muted-foreground", children: "Comprobante de pago" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 text-3xl font-semibold text-foreground", children: "Detalle del pago" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Cliente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-lg", children: receipt.client_full_name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Monto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-xl", children: fmt(receipt.amount) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Tipo de pago" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold capitalize text-xl", children: receipt.payment_type })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Fecha" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: new Date(receipt.created_at).toLocaleDateString("es") })
      ] }),
      receipt.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Notas" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap text-foreground", children: receipt.notes })
      ] }),
      receipt.payment_proof_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted p-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Comprobante adjunto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: receipt.payment_proof_url, target: "_blank", rel: "noreferrer", className: "text-primary hover:underline", children: "Ver archivo de comprobante" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning-foreground", children: "No hay ningún comprobante adjunto en este momento." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      }, children: "Cerrar" }) })
    ] })
  ] }) });
}
export {
  ReceiptPage as component
};
