-- Drop the insecure v_paid_clicks view
-- Users should use the secure get_paid_clicks_metrics() function instead
DROP VIEW IF EXISTS v_paid_clicks;

-- The get_paid_clicks_metrics() function already exists and is secure:
-- It uses SECURITY DEFINER and requires admin role via has_role(auth.uid(), 'admin')
-- Users can call: SELECT * FROM get_paid_clicks_metrics();