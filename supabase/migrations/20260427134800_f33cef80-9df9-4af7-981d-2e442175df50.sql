-- 1. Enum de estado de cliente
CREATE TYPE public.client_status AS ENUM ('activo', 'en_aviso', 'sacado');

-- 2. Columna status en clients
ALTER TABLE public.clients
  ADD COLUMN status public.client_status NOT NULL DEFAULT 'activo';

-- 3. Columnas para renovación en loans
ALTER TABLE public.loans
  ADD COLUMN renewed_from uuid REFERENCES public.loans(id) ON DELETE SET NULL,
  ADD COLUMN interest_paid numeric;

-- 4. Tabla app_settings (single-row)
CREATE TABLE public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  interest_rate numeric NOT NULL DEFAULT 20,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

INSERT INTO public.app_settings (id, interest_rate) VALUES (true, 20);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View settings"
  ON public.app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Update settings"
  ON public.app_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 5. Reemplazar política de UPDATE en clients para que 'sacado' solo lo cambie un admin
DROP POLICY IF EXISTS "Update clients" ON public.clients;

CREATE POLICY "Update clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR (created_by = auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR (created_by = auth.uid()));

-- 6. Trigger para impedir que un no-admin saque a un cliente del estado 'sacado'
CREATE OR REPLACE FUNCTION public.enforce_sacado_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'sacado' AND NEW.status <> 'sacado' THEN
    IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Solo un administrador puede cambiar el estado de un cliente sacado';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_sacado_admin_only_trg
  BEFORE UPDATE OF status ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_sacado_admin_only();