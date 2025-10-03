-- A) Metrics: events table
CREATE TABLE IF NOT EXISTS public.events (
  id bigserial PRIMARY KEY,
  user_id text,
  name text NOT NULL,
  props jsonb DEFAULT '{}',
  ts timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_events_name ON public.events(name);
CREATE INDEX IF NOT EXISTS idx_events_ts ON public.events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);

-- Enable RLS (public endpoint will use service role)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: allow service role and authenticated users to insert
CREATE POLICY "Allow insert events" ON public.events
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy: allow authenticated users to view their own events
CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text OR user_id IS NULL);

-- View: v_activation (users with >=1 item)
CREATE OR REPLACE VIEW public.v_activation AS
SELECT 
  user_id,
  COUNT(*) as items_count,
  MIN(created_at) as first_item_at,
  MAX(created_at) as last_item_at
FROM public.items
GROUP BY user_id
HAVING COUNT(*) >= 1;

-- View: v_pql (Product Qualified Leads: users with >=8 items & recall_alert_seen)
CREATE OR REPLACE VIEW public.v_pql AS
SELECT DISTINCT
  i.user_id,
  COUNT(i.id) as items_count,
  MAX(e.ts) as last_recall_alert_seen
FROM public.items i
LEFT JOIN public.events e ON e.user_id = i.user_id::text AND e.name = 'recall_alert_seen'
GROUP BY i.user_id
HAVING COUNT(i.id) >= 8 AND MAX(e.ts) IS NOT NULL;

-- View: v_paid_clicks (count by week)
CREATE OR REPLACE VIEW public.v_paid_clicks AS
SELECT 
  date_trunc('week', ts) as week,
  COUNT(*) as paid_clicks
FROM public.events
WHERE name = 'paid_click'
GROUP BY date_trunc('week', ts)
ORDER BY week DESC;

-- Create recalls table for sitemap generation
CREATE TABLE IF NOT EXISTS public.recalls (
  id bigserial PRIMARY KEY,
  brand text NOT NULL,
  model text NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  source text NOT NULL, -- 'cpsc' | 'hc' | 'eu'
  published_date date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(brand, model, source)
);

-- Index for recalls lookups
CREATE INDEX IF NOT EXISTS idx_recalls_brand_model ON public.recalls(brand, model);
CREATE INDEX IF NOT EXISTS idx_recalls_published ON public.recalls(published_date DESC);

-- Enable RLS on recalls
ALTER TABLE public.recalls ENABLE ROW LEVEL SECURITY;

-- Policy: allow everyone to read recalls
CREATE POLICY "Public read access to recalls" ON public.recalls
  FOR SELECT
  TO authenticated, anon
  USING (true);