# Security Policy

## Demo Notice

**IMPORTANT**: This project uses demo JWT authentication for development. Replace with production-ready auth before deployment.

## Reporting Security Issues

Email: **security@keepsafe.app**

We respond within 48 hours.

## Security Features

- Row-Level Security (RLS) on all Supabase tables
- Rate limiting on write endpoints (60 req/min)
- Input validation using Zod schemas
- Security headers (CSP, X-Frame-Options, Referrer-Policy, etc.)
- HTTPS-only in production
- PIPEDA-compliant privacy practices
- No sensitive data logged to console in production

## Implemented

- ✅ RLS policies on items, events, recalls tables
- ✅ Input validation (email, password, event names)
- ✅ Secure authentication via Supabase Auth
- ✅ Private storage buckets for receipts
- ✅ CORS restrictions on Edge Functions
- ✅ Rate limiting on track-event endpoint
- ✅ Security headers in index.html

## Responsible Disclosure

Please do not publicly disclose vulnerabilities until addressed. We will acknowledge your contribution.

## Production Checklist

- [ ] Replace demo JWT with production auth
- [ ] Restrict CORS to production domain only
- [ ] Enable additional rate limiting
- [ ] Review all RLS policies
- [ ] Test input validation on all forms
- [ ] Configure monitoring/logging
- [ ] Set up database backups
- [ ] Update security headers for production CSP

## Contact

security@keepsafe.app

---

**Last Updated**: January 2025
