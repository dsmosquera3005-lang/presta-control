import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import { buildWhatsAppMessage, normalizePhoneNumber } from './whatsappHelpers';

type PaymentRow = Database['public']['Tables']['payments']['Row'];
type ClientRow = Database['public']['Tables']['clients']['Row'];

type ReceiptPayment = { amount: number; payment_type: string; notes: string | null };
type ReceiptClient = { full_name: string; };

export const sendWhatsAppReceipt = createServerFn({ method: 'POST' })
  .inputValidator((data: { paymentId: string }) => data)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const supabase = (context as any)?.supabase;
    const { userId, role } = context as { userId: string; role: 'admin' | 'asesor' | null };
    if (!supabase) {
      throw new Error('No se pudo inicializar el cliente Supabase autenticado.');
    }

    const paymentId = data.paymentId;

    const { data: payment, error: paymentErr } = await supabase
      .from('payments')
      .select('id, amount, payment_type, client_id, notes, advisor_id')
      .eq('id', paymentId)
      .maybeSingle();

    if (paymentErr) {
      throw new Error(paymentErr.message);
    }
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('id, full_name, phone, payment_proof_url')
      .eq('id', payment.client_id)
      .maybeSingle();

    if (clientErr) {
      throw new Error(clientErr.message);
    }
    if (!client || !client.phone) {
      throw new Error('Teléfono del cliente no encontrado');
    }

    const normalizedPhone = normalizePhoneNumber(client.phone);
    if (!normalizedPhone) {
      throw new Error('Número de teléfono inválido');
    }

    const receiptPath = `/receipt/${payment.id}`;
    const receiptUrl = client.payment_proof_url ?? null;
    const message = buildWhatsAppMessage(payment as PaymentRow, client as ClientRow, receiptUrl ?? undefined);

    const { data: messageRow, error: insertErr } = await supabase
      .from('whatsapp_messages')
      .insert({
        message_content: message,
        payment_id: payment.id,
        phone_number: normalizedPhone,
        status: 'pending',
      })
      .select('id')
      .maybeSingle();

    if (insertErr || !messageRow) {
      throw new Error(insertErr?.message ?? 'No se pudo crear el registro de WhatsApp');
    }

    return {
      success: true,
      phoneNumber: normalizedPhone,
      receiptPath,
      receiptUrl,
      payment: {
        amount: payment.amount,
        payment_type: payment.payment_type,
        notes: payment.notes,
      } as ReceiptPayment,
      clientFullName: client.full_name,
    };
  });
