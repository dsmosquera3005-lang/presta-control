DROP POLICY IF EXISTS "Update clients" ON public.clients;

CREATE POLICY "Update clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR created_by = auth.uid()
    OR status = 'en_aviso'::public.client_status
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR created_by = auth.uid()
  );
  