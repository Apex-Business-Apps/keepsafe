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
docker compose up -d
cd api && cp .env.example .env && npm i && npm run db:setup && npm run dev
# new tab
cd web && cp .env.example .env && npm i && npm run dev
```

Visit `http://localhost:3000` for the web app and `http://localhost:8081` for Adminer.

## Features

- 📦 **Progressive Item Management**: Two-field quick-add → progressive disclosure for details
- 📷 **Smart Scanning**: BarcodeDetector API → ZXing fallback
- ⚠️ **Official Recall Monitoring**: CPSC, Health Canada, EU Safety Gate
- 📄 **Insurance Binder PDF**: One-click household inventory export
- 🔐 **Email Demo Auth**: Simple JWT stub for MVP
- 📱 **PWA**: Offline support, installable

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

## PWA & Performance

- Manifest + service worker
- Offline cache (last 100 items)
- Install prompt hint
- Core Web Vitals logging: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1
- Skeleton screens; route prefetch on idle

## Security & Privacy (MVP)

- PII-lite approach
- Local export/delete flows
- CORS → localhost only by default
- Zod validation on all inputs
- Naive JWT demo stub
- Basic rate limiting

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