-- Fix views to be explicitly SECURITY INVOKER
DROP VIEW IF EXISTS public.v_activation CASCADE;
DROP VIEW IF EXISTS public.v_pql CASCADE;
DROP VIEW IF EXISTS public.v_paid_clicks CASCADE;

-- View: v_activation (users with >=1 item) - SECURITY INVOKER
CREATE OR REPLACE VIEW public.v_activation 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  COUNT(*) as items_count,
  MIN(created_at) as first_item_at,
  MAX(created_at) as last_item_at
FROM public.items
GROUP BY user_id
HAVING COUNT(*) >= 1;

-- View: v_pql (Product Qualified Leads: users with >=8 items & recall_alert_seen) - SECURITY INVOKER
CREATE OR REPLACE VIEW public.v_pql
WITH (security_invoker = true) AS
SELECT DISTINCT
  i.user_id,
  COUNT(i.id) as items_count,
  MAX(e.ts) as last_recall_alert_seen
FROM public.items i
LEFT JOIN public.events e ON e.user_id = i.user_id::text AND e.name = 'recall_alert_seen'
GROUP BY i.user_id
HAVING COUNT(i.id) >= 8 AND MAX(e.ts) IS NOT NULL;

-- View: v_paid_clicks (count by week) - SECURITY INVOKER
CREATE OR REPLACE VIEW public.v_paid_clicks
WITH (security_invoker = true) AS
SELECT 
  date_trunc('week', ts) as week,
  COUNT(*) as paid_clicks
FROM public.events
WHERE name = 'paid_click'
GROUP BY date_trunc('week', ts)
ORDER BY week DESC;