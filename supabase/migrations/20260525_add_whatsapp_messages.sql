-- Crear tabla para almacenar logs de mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID,
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON DELETE CASCADE
);

ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Política: Admin y usuario propietario del pago pueden ver
DROP POLICY IF EXISTS "View whatsapp_messages" ON public.whatsapp_messages;
CREATE POLICY "View whatsapp_messages"
ON public.whatsapp_messages FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR
  EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.id = payment_id AND p.advisor_id = auth.uid()
  )
);

-- Política: Solo el sistema puede insertar
DROP POLICY IF EXISTS "Insert whatsapp_messages system only" ON public.whatsapp_messages;
CREATE POLICY "Insert whatsapp_messages system only"
ON public.whatsapp_messages FOR INSERT TO authenticated
WITH CHECK (false);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_payment_id ON public.whatsapp_messages(payment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);
