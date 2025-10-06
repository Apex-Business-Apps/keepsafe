# KeepSafe Deployment Guide

## Quick Deploy to Production

### 1. Environment Verification

```bash
# Verify all environment variables are set
echo "Checking Supabase connection..."
curl -X GET "https://aljdaazlgjcfwirqfjuc.supabase.co/rest/v1/items?select=id&limit=1" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsamRhYXpsZ2pjZndpcnFmanVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzQyNTgsImV4cCI6MjA3NDkxMDI1OH0.3unSDygHU4GybMIgGYuPOuJ4UzTNVf2TbsltIQ0hXhA"
```

### 2. Database Migrations

All migrations are already applied. Verify with:

```sql
SELECT * FROM supabase_migrations.schema_migrations 
ORDER BY version DESC 
LIMIT 5;
```

### 3. Edge Functions

Already deployed and configured:
- ✅ `health` - Health check endpoint
- ✅ `check-recalls` - CPSC recall matching (admin only)
- ✅ `ingest-hc-rss` - Health Canada RSS ingestion (admin only)

### 4. Storage Buckets

- ✅ `receipts` bucket configured
  - Private access
  - RLS policies enabled
  - Dynamic signed URLs

### 5. Build & Deploy

```bash
# Build for production
npm run build

# The build output will be in dist/
# Deploy via Lovable's publish button or:
# - Vercel
# - Netlify  
# - Cloudflare Pages
```

### 6. Post-Deploy Verification

#### Test Authentication
1. Visit your deployed URL
2. Click "Sign In"
3. Create a test account
4. Verify email confirmation (if enabled)
5. Sign in successfully

#### Test Core Functionality
1. Add a test item with:
   - Name, brand, category
   - Purchase date
   - Receipt photo upload
2. Verify item appears in list
3. Export PDF
4. Delete item
5. Sign out

#### Test PWA
1. On mobile, tap "Add to Home Screen"
2. Open installed app
3. Verify offline functionality:
   - Disconnect network
   - View existing items
   - App should still work (read-only)

### 7. Admin Setup

Create your first admin user:

```sql
-- Replace YOUR_USER_ID with actual user ID from auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin');
```

Verify admin access:
```sql
SELECT * FROM public.user_roles WHERE role = 'admin';
```

### 8. Recall System Setup (Admin Only)

#### Manual Recall Check (CPSC)
```bash
# Call the check-recalls edge function
curl -X POST "https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/check-recalls" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Health Canada RSS Ingestion
```bash
# Call the ingest-hc-rss edge function
curl -X POST "https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/ingest-hc-rss" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Optional: Schedule with pg_cron

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily recall check at 2 AM UTC
SELECT cron.schedule(
  'daily-recall-check',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/check-recalls',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
  $$
);

-- Schedule Health Canada RSS daily at 3 AM UTC
SELECT cron.schedule(
  'daily-hc-rss-ingest',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://aljdaazlgjcfwirqfjuc.supabase.co/functions/v1/ingest-hc-rss',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

### 9. Monitoring Setup

#### View Edge Function Logs
```bash
# In Supabase dashboard
https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc/functions/health/logs
https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc/functions/check-recalls/logs
https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc/functions/ingest-hc-rss/logs
```

#### Monitor Security Audit Log
```sql
-- View recent admin actions
SELECT 
  created_at,
  action,
  resource,
  user_id,
  success
FROM security_audit_log
WHERE action IN ('check_recalls', 'ingest_hc_rss')
ORDER BY created_at DESC
LIMIT 50;
```

#### Monitor User Activity
```sql
-- View recent events
SELECT 
  name,
  COUNT(*) as count,
  MIN(ts) as first_event,
  MAX(ts) as last_event
FROM events
WHERE ts > NOW() - INTERVAL '7 days'
GROUP BY name
ORDER BY count DESC;
```

### 10. Performance Monitoring

#### Database Query Performance
```sql
-- Slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### Storage Usage
```sql
-- Check receipts bucket size
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint / 1024 / 1024 as size_mb
FROM storage.objects
WHERE bucket_id = 'receipts'
GROUP BY bucket_id;
```

### 11. URL Configuration

Update Supabase Auth URLs:
1. Go to Authentication > URL Configuration
2. Set **Site URL**: `https://your-production-domain.com`
3. Add **Redirect URLs**:
   - `https://your-production-domain.com/dashboard`
   - `http://localhost:3000` (for local dev)

### 12. Email Templates (Optional)

Customize authentication emails:
1. Go to Authentication > Email Templates
2. Customize:
   - Confirm signup
   - Magic Link
   - Password reset

### 13. DNS & Domain Setup

If using custom domain:
1. Add CNAME record pointing to your deployment
2. Update Auth URLs in Supabase
3. Verify SSL certificate
4. Test authentication flow

### 14. Analytics (Optional)

Track key metrics:
```sql
-- Activation metrics (users with 1+ items)
SELECT * FROM get_activation_metrics();

-- PQL metrics (users with 8+ items)
SELECT * FROM get_pql_metrics();

-- Paid click tracking
SELECT * FROM get_paid_clicks_metrics();
```

### 15. Backup Strategy

Supabase includes:
- ✅ Daily automated backups
- ✅ Point-in-time recovery (PITR)
- ✅ 7-day retention (free tier)

For additional safety:
```sql
-- Manual backup
pg_dump -h db.aljdaazlgjcfwirqfjuc.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f keepsafe_backup_$(date +%Y%m%d).dump
```

### 16. Security Hardening

#### Rate Limiting
Already configured in edge functions and event tracking.

#### CORS
Already configured with allowed origins.

#### Review RLS Policies
```sql
-- Verify all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false;
-- Should return empty!
```

### 17. Support & Maintenance

#### Weekly Tasks
- [ ] Review security_audit_log for anomalies
- [ ] Check edge function error rates
- [ ] Monitor database size growth
- [ ] Review user feedback

#### Monthly Tasks
- [ ] Update dependencies
- [ ] Review and optimize indexes
- [ ] Analyze query performance
- [ ] Check for Supabase updates

#### Quarterly Tasks
- [ ] Security audit
- [ ] Performance review
- [ ] User data cleanup (if applicable)
- [ ] Backup restoration test

### 18. Troubleshooting

#### Users can't sign in
1. Check Auth > URL Configuration
2. Verify redirect URLs include your domain
3. Check email confirmation settings
4. Review browser console for errors

#### Recalls not updating
1. Verify admin role in `user_roles` table
2. Check edge function logs
3. Test CPSC API availability
4. Review security_audit_log

#### File uploads failing
1. Check storage RLS policies
2. Verify bucket permissions
3. Review file size limits (10MB max)
4. Check allowed file types

#### PWA not installing
1. Verify HTTPS (required)
2. Check manifest.webmanifest is accessible
3. Verify service worker registration
4. Test on different browsers/devices

## Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc
- **Database**: https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc/editor
- **Edge Functions**: https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc/functions
- **Storage**: https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc/storage/buckets
- **Auth**: https://supabase.com/dashboard/project/aljdaazlgjcfwirqfjuc/auth/users

## Emergency Contacts

- **Supabase Support**: https://supabase.com/support
- **Supabase Discord**: https://discord.supabase.com

---

**Deployment Status**: ✅ PRODUCTION READY

Your application is secure, optimized, and ready for real users. Good luck! 🚀
