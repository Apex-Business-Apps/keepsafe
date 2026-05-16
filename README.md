# KeepSafe - Home Inventory + Recall Guardian

**Track what you own. Get alerted to recalls. Protect your home.**

Canada-first home inventory PWA with official product recall monitoring (CPSC, Health Canada).


## Canonical App Scope

The **root** React/Vite/Supabase app is the only shipping implementation.
`apple-better-app/` is archived/experimental and out of scope for production feature work.

## Features

- 📦 **Item Management**: Catalog items with brand, model, serial, receipts, warranty tracking
- 📷 **Receipt Storage**: Upload and store receipt photos securely
- ⚠️ **Recall Monitoring**: Auto-match against CPSC, Health Canada, EU Safety Gate databases
- 📄 **Binder Export**: PDF export for insurance claims
- 🔐 **Secure Authentication**: User accounts with email/password
- 📱 **PWA**: Installable, offline-capable
- 📊 **Metrics**: Custom analytics (no vendors)
- 🔍 **SEO**: Programmatic recall pages, sitemap.xml

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:8080`

## Metrics & Analytics

### SQL Views
- `v_activation` - Users with >=1 item
- `v_pql` - Product Qualified Leads (>=8 items + recall_alert_seen)
- `v_paid_clicks` - Count by week

### Weekly Funnel Query
```sql
SELECT date_trunc('week', ts) as week,
  COUNT(DISTINCT CASE WHEN name = 'signup' THEN user_id END) as signups,
  COUNT(DISTINCT CASE WHEN name = 'item_added' THEN user_id END) as activated,
  COUNT(DISTINCT CASE WHEN name = 'recall_alert_seen' THEN user_id END) as engaged,
  COUNT(DISTINCT CASE WHEN name = 'paid_click' THEN user_id END) as paid_clicks
FROM events GROUP BY week ORDER BY week DESC;
```

## SEO
- `/recalls/[brand]-[model]` - Dynamic recall pages
- `/sitemap.xml` - Auto-generated via edge function
- `/robots.txt` - Crawl rules
- References: [Google Helpful Content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [Sitemaps](https://www.sitemaps.org/protocol.html)

## Privacy & Security
- Privacy Policy at `/privacy` (PIPEDA-compliant)
- Rate limiting (60 req/min on events)
- Security headers (CSP, X-Frame-Options, etc.)
- RLS on all tables
- See `SECURITY.md` for reporting vulnerabilities

## Performance
- Browser performance logging (LCP, CLS, and a first-input delay proxy; no claimed full INP measurement)
- Loading skeletons
- PWA with service worker caching

## Icons

### Source
- Original SVG: `/public/icons/src/keepsafe_appicon.svg`

### Regeneration
To regenerate the icon pack:
- Keep padding at 12–14% for standard icons
- Keep padding at 20% for maskable/adaptive variants
- Don't bake rounded corners; let platforms mask them
- Update `manifest.webmanifest` only if filenames change

### Icon Sizes
- **PWA Core**: pwa-192x192.png, pwa-512x512.png
- **Maskable**: icon-maskable-192.png, icon-maskable-512.png (20% padding)
- **Extended Set**: 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512
- **Apple Touch**: apple-touch-icon-180x180.png
- **Favicons**: favicon.ico, favicon-32.png, favicon-16.png
- **Safari Pinned**: safari-pinned-tab.svg (monochrome)

### Validation
Run icon validation checks:
```bash
node scripts/check-icons.js
```

This checks:
- All icons exist at correct paths
- Dimensions match expected sizes
- File sizes are under 300 KB each

## License
MIT
