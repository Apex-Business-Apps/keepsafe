-- Drop the insecure v_activation view
-- Users should use the secure get_activation_metrics() function instead
DROP VIEW IF EXISTS v_activation;

-- The get_activation_metrics() function already exists and is secure:
-- It uses SECURITY DEFINER and filters by auth.uid()
-- Users can call: SELECT * FROM get_activation_metrics();