
CREATE TYPE public.change_request_type AS ENUM (
  'update_client',
  'increase_loan',
  'decrease_loan',
  'waive_mora',
  'delete_payment',
  'delete_loan',
  'delete_client'
);

CREATE TYPE public.change_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.change_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by UUID NOT NULL,
  request_type public.change_request_type NOT NULL,
  client_id UUID,
  loan_id UUID,
  payment_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason TEXT,
  status public.change_request_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own or admin all change_requests"
ON public.change_requests FOR SELECT TO authenticated
USING (requested_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Asesor create change_requests"
ON public.change_requests FOR INSERT TO authenticated
WITH CHECK (requested_by = auth.uid() AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.is_user_active(auth.uid())));

CREATE POLICY "Admin update change_requests"
ON public.change_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin or owner delete change_requests"
ON public.change_requests FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role) OR (requested_by = auth.uid() AND status = 'pending'));

CREATE TRIGGER trg_change_requests_updated_at
BEFORE UPDATE ON public.change_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_change_requests_status ON public.change_requests(status);
CREATE INDEX idx_change_requests_requested_by ON public.change_requests(requested_by);
