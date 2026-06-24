
CREATE TABLE public.guest_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  period_start timestamptz NOT NULL,
  files_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ip_hash, period_start)
);
GRANT ALL ON public.guest_usage TO service_role;
ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;
-- intentionally no policies for anon/authenticated — only service role (edge functions) may touch this table.

CREATE INDEX guest_usage_period_idx ON public.guest_usage (period_start);
