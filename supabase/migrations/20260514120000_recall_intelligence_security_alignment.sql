-- Recall intelligence, schema drift, and security policy alignment.

-- Keep existing recalls table compatible while adding normalized source/evidence fields.
ALTER TABLE public.recalls
  ADD COLUMN IF NOT EXISTS source_id text,
  ADD COLUMN IF NOT EXISTS content_fingerprint text,
  ADD COLUMN IF NOT EXISTS source_system text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS normalized_brand_tokens text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS normalized_model_tokens text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS normalized_name_tokens text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS affected_barcodes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hazard text,
  ADD COLUMN IF NOT EXISTS remedy text,
  ADD COLUMN IF NOT EXISTS raw_payload jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

UPDATE public.recalls
SET source_system = COALESCE(source_system, source),
    source_url = COALESCE(source_url, url),
    source_id = COALESCE(source_id, source || ':' || url),
    content_fingerprint = COALESCE(content_fingerprint, md5(COALESCE(source, '') || '|' || COALESCE(url, '') || '|' || COALESCE(title, ''))),
    normalized_brand_tokens = CASE WHEN normalized_brand_tokens IS NULL OR normalized_brand_tokens = '{}' THEN regexp_split_to_array(lower(regexp_replace(COALESCE(brand, ''), '[^a-zA-Z0-9]+', ' ', 'g')), '\s+') ELSE normalized_brand_tokens END,
    normalized_model_tokens = CASE WHEN normalized_model_tokens IS NULL OR normalized_model_tokens = '{}' THEN regexp_split_to_array(lower(regexp_replace(COALESCE(model, ''), '[^a-zA-Z0-9]+', ' ', 'g')), '\s+') ELSE normalized_model_tokens END,
    normalized_name_tokens = CASE WHEN normalized_name_tokens IS NULL OR normalized_name_tokens = '{}' THEN regexp_split_to_array(lower(regexp_replace(COALESCE(title, ''), '[^a-zA-Z0-9]+', ' ', 'g')), '\s+') ELSE normalized_name_tokens END
WHERE source_system IS NULL
   OR source_url IS NULL
   OR source_id IS NULL
   OR content_fingerprint IS NULL
   OR normalized_brand_tokens IS NULL
   OR normalized_model_tokens IS NULL
   OR normalized_name_tokens IS NULL;

ALTER TABLE public.recalls
  ALTER COLUMN source_system SET DEFAULT 'unknown';

CREATE UNIQUE INDEX IF NOT EXISTS idx_recalls_source_identity
  ON public.recalls (source_system, source_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recalls_content_fingerprint
  ON public.recalls (content_fingerprint)
  WHERE content_fingerprint IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recalls_source_system_published
  ON public.recalls (source_system, published_date DESC);
CREATE INDEX IF NOT EXISTS idx_recalls_brand_lower
  ON public.recalls (lower(brand));
CREATE INDEX IF NOT EXISTS idx_recalls_title_trgm_fallback
  ON public.recalls (lower(title));

CREATE OR REPLACE TRIGGER update_recalls_updated_at
  BEFORE UPDATE ON public.recalls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.item_recall_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  recall_id bigint NOT NULL REFERENCES public.recalls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score integer NOT NULL CHECK (match_score BETWEEN 0 AND 100),
  match_reason text NOT NULL,
  matched_brand_tokens text[] DEFAULT '{}',
  matched_model_tokens text[] DEFAULT '{}',
  matched_barcode text,
  source_system text,
  source_url text,
  published_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (item_id, recall_id)
);

ALTER TABLE public.item_recall_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recall matches" ON public.item_recall_matches;
CREATE POLICY "Users can view own recall matches"
  ON public.item_recall_matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage recall matches" ON public.item_recall_matches;
CREATE POLICY "Service role can manage recall matches"
  ON public.item_recall_matches
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE INDEX IF NOT EXISTS idx_item_recall_matches_user_score
  ON public.item_recall_matches (user_id, match_score DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_item_recall_matches_item
  ON public.item_recall_matches (item_id);
CREATE INDEX IF NOT EXISTS idx_item_recall_matches_recall
  ON public.item_recall_matches (recall_id);
CREATE OR REPLACE TRIGGER update_item_recall_matches_updated_at
  BEFORE UPDATE ON public.item_recall_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.upc_cache (
  barcode text PRIMARY KEY,
  product_data jsonb NOT NULL,
  cached_at timestamptz DEFAULT now(),
  source text,
  lookup_count integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.upc_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can read upc cache" ON public.upc_cache;
CREATE POLICY "Authenticated users can read upc cache"
  ON public.upc_cache FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Service role can manage upc cache" ON public.upc_cache;
CREATE POLICY "Service role can manage upc cache"
  ON public.upc_cache FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
CREATE INDEX IF NOT EXISTS idx_upc_cache_cached_at ON public.upc_cache (cached_at DESC);
CREATE OR REPLACE TRIGGER update_upc_cache_updated_at
  BEFORE UPDATE ON public.upc_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role can manage push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Service role can manage push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON public.push_subscriptions (user_id, updated_at DESC);
CREATE OR REPLACE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text PRIMARY KEY,
  count integer NOT NULL DEFAULT 0,
  reset_at timestamptz NOT NULL,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON public.rate_limits (reset_at);
CREATE OR REPLACE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON public.rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Receipts storage ownership: recreate policies idempotently with auth.uid() path-prefix checks.
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Users can view own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;

CREATE POLICY "Users can view own receipts"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own receipts"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own receipts"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1])
  WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own receipts"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Keep audit logs append-only for non-service callers.
DROP POLICY IF EXISTS "Deny update of audit logs" ON public.security_audit_log;
CREATE POLICY "Deny update of audit logs"
  ON public.security_audit_log FOR UPDATE USING (false);
DROP POLICY IF EXISTS "Deny delete of audit logs" ON public.security_audit_log;
CREATE POLICY "Deny delete of audit logs"
  ON public.security_audit_log FOR DELETE USING (false);
