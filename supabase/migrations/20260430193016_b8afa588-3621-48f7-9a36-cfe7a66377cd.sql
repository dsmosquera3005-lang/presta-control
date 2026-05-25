-- Permitir a admins actualizar cualquier perfil (incluido is_active)
DROP POLICY IF EXISTS "Admin update profiles" ON public.profiles;
CREATE POLICY "Admin update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));