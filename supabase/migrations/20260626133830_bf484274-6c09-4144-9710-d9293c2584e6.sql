
REVOKE ALL ON public.guest_usage FROM anon, authenticated;
DROP POLICY IF EXISTS "Block all client access" ON public.guest_usage;
CREATE POLICY "Block all client access" ON public.guest_usage
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
