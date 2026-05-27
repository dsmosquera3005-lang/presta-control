-- Public RPC for payment receipts without requiring authentication
CREATE OR REPLACE FUNCTION public.get_payment_receipt(p_payment_id uuid)
RETURNS TABLE (
  payment_id uuid,
  amount numeric,
  payment_type text,
  notes text,
  created_at timestamptz,
  client_id uuid,
  client_full_name text,
  payment_proof_url text
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.amount,
    p.payment_type,
    p.notes,
    p.created_at,
    p.client_id,
    c.full_name,
    c.payment_proof_url
  FROM public.payments AS p
  JOIN public.clients AS c ON c.id = p.client_id
  WHERE p.id = p_payment_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_payment_receipt(uuid) TO public;
