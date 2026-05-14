# KeepSafe Architecture

KeepSafe's canonical shipping app is the root React/Vite/Supabase PWA. The `apple-better-app/` subtree is archived/experimental and is not expanded by production feature work.

## Frontend modules

- `src/pages/`: route-level screens for landing, auth, dashboard, item details, settings, and recall directory pages.
- `src/components/`: dashboard cards, item forms/lists, barcode scanner fallback UI, export/import menus, and shared UI primitives.
- `src/hooks/`: Supabase-backed data hooks for inventory, categories, receipt URLs/OCR, UPC lookup, dashboard stats, and push subscriptions.
- `src/utils/`: import/export helpers, PDF binder generation, and web telemetry helpers.
- `src/integrations/supabase/`: typed Supabase client and generated schema contract.
- `public/sw.js`: PWA service worker for static shell caching, offline navigation fallback, and push notification handling.

## Supabase tables used

- `items`: user-owned inventory records, proof metadata, recall status, and receipt storage path references.
- `recalls`: normalized official recall notices with source metadata, stable source IDs/fingerprints, normalized tokens, and optional raw payloads.
- `item_recall_matches`: explainable evidence linking a user's item to a recall with score, reason, matched tokens, and source URL.
- `events`: authenticated product telemetry used for local analytics and activation reporting.
- `security_audit_log`: append-only security/audit events for privileged functions and abuse failures.
- `user_roles`: app roles used for admin-only recall ingestion/check operations.
- `upc_cache`: shared UPC lookup cache keyed by barcode to avoid repeated external lookups.
- `push_subscriptions`: user-owned web push endpoints.
- `rate_limits`: lightweight database-backed counters for external-service-backed edge functions.

## Storage buckets used

- `receipts`: private receipt/proof images. Object paths are scoped to the authenticated user's `auth.uid()` as the first path segment; select, insert, update, and delete policies enforce that ownership boundary.

## Edge functions used

- `health`: public operational health check.
- `lookup-upc`: authenticated UPC enhancement with cache-first lookup and rate limiting.
- `extract-receipt`: authenticated receipt OCR enhancement with rate limiting and manual-first failure behavior.
- `register-push`: authenticated subscribe/unsubscribe endpoint for user-owned push subscriptions.
- `send-push`: authenticated push delivery helper for a user's saved subscriptions.
- `track-event`: authenticated event tracking that fails soft from the client.
- `ingest-hc-rss`: admin-only Health Canada RSS ingestion that normalizes and upserts recall records.
- `check-recalls`: admin-only inventory recall matcher that paginates through items/recalls and writes explainable match evidence.
- `generate-sitemap`: public sitemap generator for recall SEO pages.

## Recall data flow

Official-source ingestion normalizes source records into the `recalls` contract: title, brand/model, `source_system`, `source_url`, `published_date`, stable `source_id`, `content_fingerprint`, normalized brand/model/name tokens, affected barcodes where available, and raw source payload. Ingestion uses upsert semantics by source identity/fingerprint so repeated runs update existing records instead of duplicating them.

Recall matching uses deterministic token evidence rather than broad substring checks. Item brand, model/name, and barcode signals are normalized; matches produce a score and transparent reason with matched brand tokens, matched model/name tokens, barcode evidence, source system, source URL, and published date. Results are persisted in `item_recall_matches` and summarized back onto `items.recall_match`/`items.recall_url` for existing UI compatibility.

## Proof/export flow

Users create items manually first; barcode lookup and receipt OCR are optional enhancements that never block core item creation. Receipts upload to the private `receipts/{auth.uid()}/...` path. Binder export reads the current inventory snapshot, calculates proof completeness warnings, value totals, warranty reminders, and recall appendix entries, then generates a local PDF without a hosted backend.

## Sensitive-action posture

Binder export and proof-history/settings screens are documented as candidates for Supabase MFA step-up. The current implementation keeps exports client-local and private; teams can add `supabase.auth.mfa.getAuthenticatorAssuranceLevel()` checks before these sensitive views/actions without introducing vendors or new dependencies.
