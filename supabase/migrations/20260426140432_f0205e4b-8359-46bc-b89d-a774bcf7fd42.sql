
-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'asesor');

-- Tabla profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tabla user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función security definer para chequear roles (evita RLS recursivo)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Función helper para obtener el rol principal
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Tabla clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  home_address TEXT,
  work_address TEXT,
  references_info TEXT,
  profile_photo_url TEXT,
  cedula_front_url TEXT,
  cedula_back_url TEXT,
  utility_bill_url TEXT,
  payment_proof_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clients_cedula ON public.clients(cedula);
CREATE INDEX idx_clients_created_by ON public.clients(created_by);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Tabla loans
CREATE TYPE public.loan_status AS ENUM ('activo', 'pagado', 'vencido');

CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  expected_amount NUMERIC(12,2) NOT NULL CHECK (expected_amount > 0),
  loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_date DATE NOT NULL,
  status loan_status NOT NULL DEFAULT 'activo',
  notes TEXT,
  created_at timestamp,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_loans_client ON public.loans(client_id);
CREATE INDEX idx_loans_created_by ON public.loans(created_by);
CREATE INDEX idx_loans_payment_date ON public.loans(payment_date);
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS profiles: usuario ve su propio perfil; admin ve todos
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admin insert profiles" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR auth.uid() = id);
CREATE POLICY "Admin delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS user_roles: usuario ve sus roles, admin gestiona todo
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS clients: admin ve todo, asesor solo los suyos
CREATE POLICY "View clients" ON public.clients
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());
CREATE POLICY "Insert clients" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Update clients" ON public.clients
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());
CREATE POLICY "Delete clients" ON public.clients
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

-- RLS loans
CREATE POLICY "View loans" ON public.loans
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());
CREATE POLICY "Insert loans" ON public.loans
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "Update loans" ON public.loans
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());
CREATE POLICY "Delete loans" ON public.loans
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_loans_updated BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger handle_new_user: crea profile automáticamente y asigna rol asesor por defecto.
-- El primer usuario registrado se promueve a admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
  assigned_role app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  SELECT COUNT(*) INTO user_count FROM public.profiles;
  IF user_count = 1 THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'asesor');
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, assigned_role);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket para documentos de clientes (privado)
INSERT INTO storage.buckets (id, name, public) VALUES ('client-docs', 'client-docs', false);

-- Políticas storage: cada asesor sube/lee sus archivos; admin todo.
CREATE POLICY "View client docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'client-docs' AND (
    public.has_role(auth.uid(), 'admin') OR (storage.foldername(name))[1] = auth.uid()::text
  ));
CREATE POLICY "Upload client docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Update client docs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'client-docs' AND (
    public.has_role(auth.uid(), 'admin') OR (storage.foldername(name))[1] = auth.uid()::text
  ));
CREATE POLICY "Delete client docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-docs' AND (
    public.has_role(auth.uid(), 'admin') OR (storage.foldername(name))[1] = auth.uid()::text
  ));
