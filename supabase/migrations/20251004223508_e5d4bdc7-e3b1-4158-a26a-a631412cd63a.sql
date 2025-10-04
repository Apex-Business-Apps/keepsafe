-- Performance optimizations for production

-- Add missing indexes on items table for better query performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items (user_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_recall_match ON public.items (recall_match) WHERE recall_match = true;
CREATE INDEX IF NOT EXISTS idx_items_brand ON public.items (brand) WHERE brand IS NOT NULL;

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_items_user_created ON public.items (user_id, created_at DESC);

-- Optimize events table queries
CREATE INDEX IF NOT EXISTS idx_events_user_ts ON public.events (user_id, ts DESC);

-- Add table statistics update for query planner optimization
ANALYZE public.items;
ANALYZE public.events;
ANALYZE public.recalls;