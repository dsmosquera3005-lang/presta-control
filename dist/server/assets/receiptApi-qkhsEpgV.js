import { c as createServerRpc } from "./createServerRpc-C9FstJEG.js";
import { l as createServerFn } from "./worker-entry-u5osyKlM.js";
import { a as requireSupabaseAuth } from "./auth-middleware-CxkccP6c.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const fetchReceiptData_createServerFn_handler = createServerRpc({
  id: "56d06d808f618ec68a19f6603fa4eb5bb73c25b7a68af3de013911dba9a9d06d",
  name: "fetchReceiptData",
  filename: "src/lib/receiptApi.ts"
}, (opts) => fetchReceiptData.__executeServer(opts));
const fetchReceiptData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((data) => data).handler(fetchReceiptData_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-ByIo5Byn.js");
  const {
    userId,
    role
  } = context;
  const paymentId = data.paymentId;
  const {
    data: payment,
    error: paymentError
  } = await supabaseAdmin.from("payments").select("id, amount, payment_type, notes, created_at, client_id, advisor_id").eq("id", paymentId).maybeSingle();
  if (paymentError) {
    throw new Error(paymentError.message);
  }
  if (!payment) {
    throw new Error("Comprobante no encontrado.");
  }
  if (role !== "admin" && payment.advisor_id !== userId) {
    throw new Error("No autorizado para ver este comprobante.");
  }
  const {
    data: client,
    error: clientError
  } = await supabaseAdmin.from("clients").select("full_name, payment_proof_url").eq("id", payment.client_id).maybeSingle();
  if (clientError) {
    throw new Error(clientError.message);
  }
  if (!client) {
    throw new Error("Cliente no encontrado.");
  }
  return {
    payment,
    client
  };
});
export {
  fetchReceiptData_createServerFn_handler
};
