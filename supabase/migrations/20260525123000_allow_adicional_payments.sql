ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_payment_type_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_payment_type_check
  CHECK (payment_type IN ('interes', 'total', 'renovacion', 'abono', 'adicional'));
