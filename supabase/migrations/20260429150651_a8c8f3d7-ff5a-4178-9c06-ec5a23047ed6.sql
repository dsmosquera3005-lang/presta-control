-- Cash transfers between advisors with approval workflow
CREATE TABLE public.cash_transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_advisor uuid NOT NULL,
  to_advisor uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  transfer_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

ALTER TABLE public.cash_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own transfers" ON public.cash_transfers FOR SELECT TO authenticated
  USING (from_advisor = auth.uid() OR to_advisor = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Create transfers" ON public.cash_transfers FOR INSERT TO authenticated
  WITH CHECK (from_advisor = auth.uid() AND (has_role(auth.uid(), 'admin'::app_role) OR is_user_active(auth.uid())));

CREATE POLICY "Respond transfers" ON public.cash_transfers FOR UPDATE TO authenticated
  USING (to_advisor = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admin delete transfers" ON public.cash_transfers FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER cash_transfers_updated_at BEFORE UPDATE ON public.cash_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();