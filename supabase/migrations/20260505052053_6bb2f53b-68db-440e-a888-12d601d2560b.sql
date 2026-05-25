ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS blocked_until date;

CREATE OR REPLACE FUNCTION public.is_user_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (
      SELECT
        CASE
          WHEN is_active THEN true
          WHEN blocked_until IS NOT NULL AND blocked_until <= CURRENT_DATE THEN true
          ELSE false
        END
      FROM public.profiles
      WHERE id = _user_id
    ),
    false
  )
$function$;