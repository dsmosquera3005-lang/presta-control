-- Permitir INSERTs en public.whatsapp_messages por admin o por el asesor propietario del pago

DROP POLICY IF EXISTS "Insert whatsapp_messages system only" ON public.whatsapp_messages;

CREATE POLICY "Insert whatsapp_messages for advisors"
ON public.whatsapp_messages FOR INSERT TO authenticated
WITH CHECK (
  (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.payments p
      WHERE p.id = payment_id AND p.advisor_id = auth.uid()
    )
  )
  AND phone_number IS NOT NULL
  AND phone_number <> ''
  AND status IN ('pending', 'sent')
);
