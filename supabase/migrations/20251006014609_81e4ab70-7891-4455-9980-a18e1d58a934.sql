-- Fix critical security issues identified in production audit

-- 1. Fix events table: Require authentication for tracking events
-- Replace existing permissive policy with authenticated policy
DROP POLICY IF EXISTS "Allow insert events" ON public.events;

CREATE POLICY "Authenticated users can insert events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow anonymous tracking for specific events (signup tracking before auth)
CREATE POLICY "Anonymous can track signup events"
ON public.events
FOR INSERT
TO anon
WITH CHECK (name = 'signup' AND user_id IS NULL);

-- 2. Fix security_audit_log: Prevent manipulation of audit logs
-- Add explicit restrictive policies to deny UPDATE and DELETE
CREATE POLICY "Deny update of audit logs"
ON public.security_audit_log
FOR UPDATE
TO service_role
USING (false);

CREATE POLICY "Deny delete of audit logs"
ON public.security_audit_log
FOR DELETE
TO service_role
USING (false);

-- 3. Add index on events table for better performance
CREATE INDEX IF NOT EXISTS idx_events_user_id_ts ON events (user_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_events_name_ts ON events (name, ts DESC);

-- 4. Add index on security_audit_log for better query performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action ON security_audit_log (action, created_at DESC);