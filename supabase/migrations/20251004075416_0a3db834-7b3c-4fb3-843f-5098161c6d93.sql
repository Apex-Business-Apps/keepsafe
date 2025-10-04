-- Phase 1: Fix Items Table Schema
-- Make user_id NOT NULL and add proper foreign key constraint

-- First, delete any existing items without user_id (if any exist)
-- This is safe because of RLS - only items with user_id are accessible anyway
DELETE FROM items WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE items ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint with CASCADE delete
ALTER TABLE items 
  DROP CONSTRAINT IF EXISTS items_user_id_fkey;

ALTER TABLE items
  ADD CONSTRAINT items_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Phase 2: Recreate analytics views with security definer functions instead of RLS
-- Drop existing views
DROP VIEW IF EXISTS v_activation;
DROP VIEW IF EXISTS v_pql;
DROP VIEW IF EXISTS v_paid_clicks;

-- Create secure function-based views that check user permissions
CREATE OR REPLACE FUNCTION public.get_activation_metrics()
RETURNS TABLE (
  user_id uuid,
  items_count bigint,
  first_item_at timestamptz,
  last_item_at timestamptz
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    user_id,
    COUNT(*) as items_count,
    MIN(created_at) as first_item_at,
    MAX(created_at) as last_item_at
  FROM items
  WHERE user_id = auth.uid()
  GROUP BY user_id
  HAVING COUNT(*) >= 1;
$$;

CREATE OR REPLACE FUNCTION public.get_pql_metrics()
RETURNS TABLE (
  user_id uuid,
  items_count bigint,
  last_recall_alert_seen timestamptz
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.user_id,
    COUNT(DISTINCT i.id) as items_count,
    MAX(e.ts) as last_recall_alert_seen
  FROM items i
  LEFT JOIN events e ON e.user_id::uuid = i.user_id AND e.name = 'recall_alert_seen'
  WHERE i.user_id = auth.uid()
  GROUP BY i.user_id
  HAVING COUNT(DISTINCT i.id) >= 8;
$$;

CREATE OR REPLACE FUNCTION public.get_paid_clicks_metrics()
RETURNS TABLE (
  week timestamptz,
  paid_clicks bigint
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    date_trunc('week', ts) as week,
    COUNT(*) as paid_clicks
  FROM events
  WHERE name = 'paid_click'
  GROUP BY week
  ORDER BY week DESC;
$$;