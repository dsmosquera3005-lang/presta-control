ALTER TABLE public.advisor_daily_base
  ADD COLUMN IF NOT EXISTS additional_amount numeric NOT NULL DEFAULT 0;
