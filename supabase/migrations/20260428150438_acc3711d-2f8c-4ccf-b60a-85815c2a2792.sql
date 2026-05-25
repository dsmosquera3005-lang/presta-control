
-- 1) Add active flag to profiles for advisor access control
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2) Payments table: registers each payment (interest or full payoff)
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL,
  client_id uuid NOT NULL,
  advisor_id uuid NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('interes','total','renovacion','abono','adicional')),
  amount numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);



CREATE INDEX IF NOT EXISTS idx_payments_advisor_date ON public.payments(advisor_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View payments" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (advisor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin') OR advisor_id = auth.uid());
CREATE POLICY "Delete payments" ON public.payments FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- 3) Daily base assignment per advisor (admin-defined fixed base + manual adjustment)
CREATE TABLE IF NOT EXISTS public.advisor_daily_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  base_amount numeric NOT NULL DEFAULT 0,
  manual_adjustment numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(advisor_id, date)
);

ALTER TABLE public.advisor_daily_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View base" ON public.advisor_daily_base FOR SELECT TO authenticated USING (advisor_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admin manage base" ON public.advisor_daily_base FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_advisor_daily_base_updated BEFORE UPDATE ON public.advisor_daily_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4) Block inactive advisors from inserting/updating clients & loans via RLS
-- Helper function
CREATE OR REPLACE FUNCTION public.is_user_active(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_active FROM public.profiles WHERE id = _user_id), false)
$$;

-- Update existing client/loan policies to require active user (admins always pass)
DROP POLICY IF EXISTS "Insert clients" ON public.clients;
CREATE POLICY "Insert clients" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.is_user_active(auth.uid())));

DROP POLICY IF EXISTS "Update clients" ON public.clients;
CREATE POLICY "Update clients" ON public.clients FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR ((created_by = auth.uid() OR status = 'en_aviso') AND public.is_user_active(auth.uid())))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR (created_by = auth.uid() AND public.is_user_active(auth.uid())));

DROP POLICY IF EXISTS "Insert loans" ON public.loans;
CREATE POLICY "Insert loans" ON public.loans FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (public.has_role(auth.uid(),'admin') OR public.is_user_active(auth.uid())));

DROP POLICY IF EXISTS "Update loans" ON public.loans;
CREATE POLICY "Update loans" ON public.loans FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR (created_by = auth.uid() AND public.is_user_active(auth.uid())));
