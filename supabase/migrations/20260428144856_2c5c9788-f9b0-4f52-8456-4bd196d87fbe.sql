WITH latest_active_loan AS (
  SELECT DISTINCT ON (client_id)
    client_id,
    created_by
  FROM public.loans
  WHERE status = 'activo'::public.loan_status
  ORDER BY client_id, created_at DESC
)
UPDATE public.clients AS c
SET
  status = 'activo'::public.client_status,
  created_by = l.created_by,
  updated_at = now()
FROM latest_active_loan AS l
WHERE c.id = l.client_id
  AND c.status = 'en_aviso'::public.client_status
  AND c.created_by <> l.created_by;