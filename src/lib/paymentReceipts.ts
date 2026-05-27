import { supabase } from "@/integrations/supabase/client";
import { buildWhatsAppMessage, normalizePhoneNumber } from "./whatsappHelpers";

type SendResult = { success: true } | { success: false; error: string };

export async function sendPaymentComprobante(
  paymentId: string,
): Promise<SendResult> {
  const { data: payment, error: paymentErr } = await supabase
    .from("payments")
    .select("id, amount, payment_type, client_id, notes")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentErr) return { success: false, error: paymentErr.message };
  if (!payment) return { success: false, error: "payment not found" };

  const { data: client, error: clientErr } = await supabase
    .from("clients")
    .select("full_name, phone")
    .eq("id", payment.client_id)
    .maybeSingle();

  if (clientErr) return { success: false, error: clientErr.message };
  if (!client || !client.phone)
    return { success: false, error: "client phone not found" };

  const normalizedPhone = normalizePhoneNumber(client.phone);
  if (!normalizedPhone)
    return { success: false, error: "invalid client phone number" };

  const message = buildWhatsAppMessage(payment, client);

  const { error: insertErr } = await supabase.from("whatsapp_messages").insert({
    message_content: message,
    payment_id: payment.id,
    phone_number: normalizedPhone,
    status: "pending",
  });

  if (insertErr) return { success: false, error: insertErr.message };

  return { success: true };
}
