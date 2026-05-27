import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';

type ReceiptPayment = Database['public']['Tables']['payments']['Row'];
type ReceiptClient = Database['public']['Tables']['clients']['Row'];

export const fetchReceiptData = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { paymentId: string }) => data)
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { userId, role } = context as { userId: string; role: 'admin' | 'asesor' | null };

    const paymentId = data.paymentId;

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('id, amount, payment_type, notes, created_at, client_id, advisor_id')
      .eq('id', paymentId)
      .maybeSingle();

    if (paymentError) {
      throw new Error(paymentError.message);
    }
    if (!payment) {
      throw new Error('Comprobante no encontrado.');
    }

    if (role !== 'admin' && payment.advisor_id !== userId) {
      throw new Error('No autorizado para ver este comprobante.');
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('full_name, payment_proof_url')
      .eq('id', payment.client_id)
      .maybeSingle();

    if (clientError) {
      throw new Error(clientError.message);
    }
    if (!client) {
      throw new Error('Cliente no encontrado.');
    }

    return {
      payment,
      client,
    } as {
      payment: ReceiptPayment;
      client: ReceiptClient;
    };
  });
