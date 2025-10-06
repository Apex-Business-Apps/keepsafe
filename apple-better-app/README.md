# KeepSafe - Home Inventory + Recall Guardian

Mass-consumer PWA for cataloging household items, storing receipts, tracking warranty expiries, and alerting on official product recalls.

## Mission
Catalog what you own, store receipts, track warranty expiries, and alert on official product recalls.

## Market
Canada-first → US/EU later. Pricing: $12.99 / $22.99 / $40.99 (display only).

## Stack
- Frontend: React + Vite PWA (installable), A11Y AA
- Backend: Node 20 + Express, pg (no ORM) 
- DB: Postgres 16 via Docker Compose
- Adminer: :8081

## Quick Start

```bash
# 1. Start PostgreSQL + Adminer
docker compose up -d

# 2. Start API server (Terminal 1)
cd api
cp .env.example .env
npm i
npm run db:setup
npm run dev
# Expected: "API listening on :8080"

# 3. Start web app (Terminal 2)
cd web
cp .env.example .env
npm i
npm run dev
# Expected: Vite URL at http://localhost:5173
```

Visit `http://localhost:5173` for the web app and `http://localhost:8081` for Adminer.

## Acceptance Checks

Run these to verify production readiness:

```bash
# 1. Health check
curl -s http://localhost:8080/health
# Expected: {"ok":true}

# 2. Security headers present
curl -I http://localhost:8080/health | grep -E 'X-Content-Type|Referrer-Policy|Permissions-Policy|Content-Security-Policy'

# 3. CORS allows keepsafe.icu
# (Requires testing from https://keepsafe.icu or via browser devtools)

# 4. CRUD works
# (Test via web UI at http://localhost:5173)

# 5. CPSC recall worker
cd api
node src/recall/ingest-cpsc.js
# Expected: Logs "CPSC: fetched <N>"

# 6. Health Canada recall worker
node src/recall/ingest-hc-rss.js
# Expected: Logs "HC: parsed <N>"

# 7. PDF Binder export
# Visit Settings → Click "Export Binder" → Downloads keepsafe-binder.pdf (non-empty)

# 8. PWA & Offline
# Visit http://localhost:5173/manifest.webmanifest
# Disconnect network → reload → Items page shows last cached 100 items
```

## Features

- 📦 **Progressive Item Management**: Two-field quick-add → progressive disclosure for details
- 📷 **Smart Scanning**: BarcodeDetector API → ZXing fallback
- ⚠️ **Official Recall Monitoring**: CPSC, Health Canada, EU Safety Gate
- 📄 **Insurance Binder PDF**: One-click household inventory export (pdf-lib)
- 🔐 **Email Demo Auth**: Simple JWT stub for MVP
- 📱 **PWA**: Offline support (last 100 items), installable

## UX Principles Implemented

### Progressive Disclosure
Default two-field quick-add (Name, Photo/Scan). "More details" reveals Brand/Model/Serial/Room/Category/Price/Receipt/Warranty fields.

### Inline Validation
Validate on type/blur; errors below fields; single-column forms; logical top-down order.

### Empty-State Coaching  
First-run shows "Let's add your first item" with benefits list and primary CTA.

### Scanner UX
BarcodeDetector preferred → ZXing fallback; permission rationale; torch toggle; "Type code instead" link.

### Visual System
Clarity/Deference/Depth; 8pt spacing; type hierarchy: Title (24/700), H2 (18/600), Body (14/400), Label (12/600).

### Micro-interactions
120-160ms transitions; optimistic updates; 5s Undo toasts.

### Accessibility
≥44×44px targets; visible focus rings; persistent labels; ≥4.5:1 contrast; keyboard flows.

## APIs

- `GET /health` → `{ ok: true }`
- `POST /auth/demo` → `{ token }` (stub)
- `GET /items` → items array (limit 100, newest first)
- `POST /items` → create item
- `PUT /items/:id` → update item  
- `DELETE /items/:id` → delete item

## Recall Sources

- **US**: CPSC Recalls API (JSON/XML) - nightly brand/model matching
- **CA**: Health Canada Consumer Product Recalls RSS - nightly title/brand parsing  
- **EU**: Safety Gate listings - scaffold parser (1 req/s, `EU_SAFETY=false` default)

## Security & CORS

### Security Headers (api/src/index.js)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`: Conservative policy allowing `self`, `data:`, `blob:`, keepsafe.icu
- **HSTS disabled** until HTTPS confirmed end-to-end

### CORS
- Allowed origins: `http://localhost:5173` (dev) + `https://keepsafe.icu` (prod)
- Configured via `ALLOWED_ORIGINS` env variable (comma-separated)
- `Vary: Origin` header set for proper caching

## PWA & Performance

- Manifest + service worker
- **Offline cache**: Last 100 items via LRU cache in API_CACHE_NAME
- Install prompt hint (dismissible)
- Core Web Vitals logging: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1
- Skeleton screens; route prefetch on idle

## Service Worker Strategy

### App Shell
- Cache on install: `/`, `/index.html`, `/manifest.webmanifest`
- Cache-first strategy for static assets

### API Caching
- **Network-first** for `/items` endpoint
- On success: cache response + maintain LRU (keep only last 1 entry)
- On offline: serve from cache → "last 100 items" available offline
- Non-GET requests: skip service worker

## Testing

Run basic integration tests:

```bash
cd api
npm test
# Expected: All checks pass (health, CRUD, validation)
```

## Production Deployment

1. Set environment variables in `.env` files
2. Update `ALLOWED_ORIGINS` to include production domain
3. Enable HTTPS + set HSTS header
4. Configure recall workers as cron jobs (daily)
5. Monitor Core Web Vitals via RUM

## Sources Implemented

- [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) (NN/g)
- [Inline Validation](https://baymard.com/blog/inline-form-validation) (Baymard)
- [PWA Checklist](https://web.dev/pwa-checklist/) (web.dev)
- [Core Web Vitals](https://web.dev/vitals/) (Google)
- [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) (MDN)
- [CPSC Recalls API](https://www.cpsc.gov/Regulations-Laws--Standards/Voluntary-Standards/Recalls)
- [Health Canada Recalls](https://www.canada.ca/en/health-canada/services/consumer-product-safety/advisories-warnings-recalls.html)
- [EU Safety Gate](https://ec.europa.eu/safety-gate-alerts/)

## License

MIT
