-- CRITICAL SECURITY HARDENING MIGRATION
-- This migration implements comprehensive security fixes

-- 1. Create Role-Based Access Control System
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
DO $$ BEGIN
  CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Only admins can manage roles (will be enforced via edge functions)
DO $$ BEGIN
  CREATE POLICY "Service role can manage roles"
  ON public.user_roles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create Security Definer Function for Role Checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 3. Update Analytics Function to Require Admin Role
CREATE OR REPLACE FUNCTION public.get_paid_clicks_metrics()
RETURNS TABLE(week TIMESTAMPTZ, paid_clicks BIGINT)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Only admins can view aggregated metrics across all users
  SELECT 
    date_trunc('week', ts) as week,
    COUNT(*) as paid_clicks
  FROM events
  WHERE name = 'paid_click'
    AND public.has_role(auth.uid(), 'admin')
  GROUP BY week
  ORDER BY week DESC;
$$;

-- 4. Add receipt_file_path column to items table (keep old column for migration)
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS receipt_file_path TEXT;

-- Create index for faster file path lookups
CREATE INDEX IF NOT EXISTS idx_items_receipt_file_path 
ON public.items (receipt_file_path) 
WHERE receipt_file_path IS NOT NULL;

-- 5. Add audit logging for security events
CREATE TABLE IF NOT EXISTS public.security_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    resource TEXT,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DO $$ BEGIN
  CREATE POLICY "Admins can view audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Service role can insert audit logs
DO $$ BEGIN
  CREATE POLICY "Service role can insert audit logs"
  ON public.security_audit_log
  FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create index for audit log queries
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id 
ON public.security_audit_log (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_action 
ON public.security_audit_log (action, created_at DESC);

-- 6. Update table statistics for optimizer
ANALYZE public.user_roles;
ANALYZE public.security_audit_log;