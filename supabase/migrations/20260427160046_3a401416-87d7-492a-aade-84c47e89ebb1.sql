-- Allow all authenticated users (advisors + admins) to view ALL clients and loans globally
-- but keep edit/delete restricted to creator or admin

DROP POLICY IF EXISTS "View clients" ON public.clients;
CREATE POLICY "View clients"
ON public.clients
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "View loans" ON public.loans;
CREATE POLICY "View loans"
ON public.loans
FOR SELECT
TO authenticated
USING (true);

-- Allow all authenticated to view profiles (so we can show which advisor owns a client)
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);