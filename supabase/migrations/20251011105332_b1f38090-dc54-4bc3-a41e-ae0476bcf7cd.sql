-- Security Fix 1: Tighten Events Table RLS Policy
-- Remove ability for authenticated users to view anonymous events
-- This prevents potential exposure of anonymous user behavior patterns

DROP POLICY IF EXISTS "Users can view own events" ON public.events;

CREATE POLICY "Users can view own events" 
ON public.events 
FOR SELECT 
USING (user_id = (auth.uid())::text);

-- Security Fix 2: Drop insecure v_pql view
-- This view lacks RLS policies and could expose user statistics
-- Users should use the secure get_pql_metrics() function instead

DROP VIEW IF EXISTS public.v_pql;

-- The get_pql_metrics() function already exists and is secure:
-- It uses SECURITY DEFINER and filters by auth.uid()
-- Users can call: SELECT * FROM get_pql_metrics();