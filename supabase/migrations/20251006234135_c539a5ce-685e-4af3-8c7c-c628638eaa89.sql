-- Fix security definer views by making them SECURITY INVOKER
-- This ensures views use the permissions of the querying user, not the creator

DROP VIEW IF EXISTS v_activation;
DROP VIEW IF EXISTS v_pql;
DROP VIEW IF EXISTS v_paid_clicks;

-- v_activation: Users who have added at least 1 item (SECURITY INVOKER)
CREATE OR REPLACE VIEW v_activation 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  COUNT(*) as items_count,
  MIN(created_at) as first_item_at,
  MAX(created_at) as last_item_at
FROM items
WHERE user_id = auth.uid()
GROUP BY user_id
HAVING COUNT(*) >= 1;

-- v_pql (Product Qualified Lead): Users with >=8 items AND have seen recall alerts (SECURITY INVOKER)
CREATE OR REPLACE VIEW v_pql 
WITH (security_invoker = true)
AS
SELECT 
  i.user_id,
  COUNT(DISTINCT i.id) as items_count,
  MAX(e.ts) as last_recall_alert_seen
FROM items i
LEFT JOIN events e ON e.user_id::uuid = i.user_id AND e.name = 'recall_alert_seen'
WHERE i.user_id = auth.uid()
GROUP BY i.user_id
HAVING COUNT(DISTINCT i.id) >= 8;

-- v_paid_clicks: Weekly counts of paid_click events (SECURITY INVOKER, admin only)
CREATE OR REPLACE VIEW v_paid_clicks 
WITH (security_invoker = true)
AS
SELECT 
  date_trunc('week', ts) as week,
  COUNT(*) as paid_clicks
FROM events
WHERE name = 'paid_click'
  AND has_role(auth.uid(), 'admin')
GROUP BY week
ORDER BY week DESC;

COMMENT ON VIEW v_activation IS 'Users who have added at least 1 item (uses querying user permissions)';
COMMENT ON VIEW v_pql IS 'Product Qualified Leads: Users with >=8 items who have seen recall alerts (uses querying user permissions)';
COMMENT ON VIEW v_paid_clicks IS 'Weekly aggregated paid click events (admin only, uses querying user permissions)';