import { c as createServerRpc } from "./createServerRpc-C9FstJEG.js";
import { l as createServerFn } from "./worker-entry-u5osyKlM.js";
import { a as requireSupabaseAuth } from "./auth-middleware-CxkccP6c.js";
import { n as normalizePhoneNumber, b as buildWhatsAppMessage } from "./whatsappHelpers-CmEDameI.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./index-ChW4vIqc.js";
const sendWhatsAppReceipt_createServerFn_handler = createServerRpc({
  id: "030a98af93c578fb04a439d8bdc7450816ae34af6f0b13cb23c432853ff36155",
  name: "sendWhatsAppReceipt",
  filename: "src/lib/whatsappApi.ts"
}, (opts) => sendWhatsAppReceipt.__executeServer(opts));
const sendWhatsAppReceipt = createServerFn({
  method: "POST"
}).inputValidator((data) => data).middleware([requireSupabaseAuth]).handler(sendWhatsAppReceipt_createServerFn_handler, async ({
  data,
  context
}) => {
  const supabase = context?.supabase;
  const {
    userId,
    role
  } = context;
  if (!supabase) {
    throw new Error("No se pudo inicializar el cliente Supabase autenticado.");
  }
  const paymentId = data.paymentId;
  const {
    data: payment,
    error: paymentErr
  } = await supabase.from("payments").select("id, amount, payment_type, client_id, notes, advisor_id").eq("id", paymentId).maybeSingle();
  if (paymentErr) {
    throw new Error(paymentErr.message);
  }
  if (!payment) {
    throw new Error("Pago no encontrado");
  }
  const {
    data: client,
    error: clientErr
  } = await supabase.from("clients").select("id, full_name, phone, payment_proof_url").eq("id", payment.client_id).maybeSingle();
  if (clientErr) {
    throw new Error(clientErr.message);
  }
  if (!client || !client.phone) {
    throw new Error("Teléfono del cliente no encontrado");
  }
  const normalizedPhone = normalizePhoneNumber(client.phone);
  if (!normalizedPhone) {
    throw new Error("Número de teléfono inválido");
  }
  const receiptPath = `/receipt/${payment.id}`;
  const receiptUrl = client.payment_proof_url ?? null;
  const message = buildWhatsAppMessage(payment, client, receiptUrl ?? void 0);
  const {
    data: messageRow,
    error: insertErr
  } = await supabase.from("whatsapp_messages").insert({
    message_content: message,
    payment_id: payment.id,
    phone_number: normalizedPhone,
    status: "pending"
  }).select("id").maybeSingle();
  if (insertErr || !messageRow) {
    throw new Error(insertErr?.message ?? "No se pudo crear el registro de WhatsApp");
  }
  return {
    success: true,
    phoneNumber: normalizedPhone,
    receiptPath,
    receiptUrl,
    payment: {
      amount: payment.amount,
      payment_type: payment.payment_type,
      notes: payment.notes
    },
    clientFullName: client.full_name
  };
});
export {
  sendWhatsAppReceipt_createServerFn_handler
};
