-- Add RLS policies to protect recalls table from unauthorized writes
-- Only service role (for edge functions and scripts) and admin users can insert/update/delete recalls

-- Allow service role to insert recalls (for automated ingestion scripts and edge functions)
CREATE POLICY "Service role can insert recalls"
ON public.recalls
FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Allow service role to update recalls
CREATE POLICY "Service role can update recalls"
ON public.recalls
FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Allow service role to delete recalls
CREATE POLICY "Service role can delete recalls"
ON public.recalls
FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Allow admin users to insert recalls (for manual management)
CREATE POLICY "Admins can insert recalls"
ON public.recalls
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admin users to update recalls
CREATE POLICY "Admins can update recalls"
ON public.recalls
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admin users to delete recalls
CREATE POLICY "Admins can delete recalls"
ON public.recalls
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));