
-- 1) profiles: referral fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.profiles
SET referral_code = substr(md5(id::text || random()::text || clock_timestamp()::text), 1, 8)
WHERE referral_code IS NULL;

ALTER TABLE public.profiles ALTER COLUMN referral_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_referral_code_key ON public.profiles(referral_code);

-- 2) usage_counters: bonus + uniqueness
ALTER TABLE public.usage_counters
  ADD COLUMN IF NOT EXISTS bonus_limit integer NOT NULL DEFAULT 0;

-- Deduplicate any accidental duplicates before adding unique constraint
WITH dups AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, period_start ORDER BY id) AS rn
  FROM public.usage_counters
)
DELETE FROM public.usage_counters WHERE id IN (SELECT id FROM dups WHERE rn > 1);

ALTER TABLE public.usage_counters
  DROP CONSTRAINT IF EXISTS usage_counters_user_period_key;
ALTER TABLE public.usage_counters
  ADD CONSTRAINT usage_counters_user_period_key UNIQUE (user_id, period_start);

-- 3) prevent users from editing referral fields client-side
CREATE OR REPLACE FUNCTION public.prevent_plan_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.plan_started_at IS DISTINCT FROM OLD.plan_started_at
     OR NEW.trial_ends_at IS DISTINCT FROM OLD.trial_ends_at
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
     OR NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'Restricted fields can only be modified by the server';
  END IF;
  RETURN NEW;
END;
$$;

-- 4) helper: award bonus to a referrer in current Istanbul week
CREATE OR REPLACE FUNCTION public.award_referral_bonus(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  week_start timestamptz;
BEGIN
  week_start := (date_trunc('week', (now() AT TIME ZONE 'Europe/Istanbul'))) AT TIME ZONE 'Europe/Istanbul';

  INSERT INTO public.usage_counters (user_id, period_start, files_used, bonus_limit)
  VALUES (_user_id, week_start, 0, 5)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET bonus_limit = public.usage_counters.bonus_limit + 5;
END;
$$;

-- 5) handle_new_user: generate referral code + record referrer + award bonus
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ref_code_input text;
  ref_user uuid;
  new_code text;
BEGIN
  new_code := substr(md5(NEW.id::text || random()::text || clock_timestamp()::text), 1, 8);

  ref_code_input := NEW.raw_user_meta_data->>'referral_code';
  IF ref_code_input IS NOT NULL AND length(ref_code_input) > 0 THEN
    SELECT id INTO ref_user FROM public.profiles WHERE referral_code = ref_code_input LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, display_name, plan, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'free',
    new_code,
    ref_user
  )
  ON CONFLICT (id) DO NOTHING;

  IF ref_user IS NOT NULL AND ref_user <> NEW.id THEN
    PERFORM public.award_referral_bonus(ref_user);
  END IF;

  RETURN NEW;
END;
$$;

-- 6) api_keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_hash text NOT NULL,
  key_prefix text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked boolean NOT NULL DEFAULT false
);

GRANT SELECT, INSERT, UPDATE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own api keys" ON public.api_keys;
CREATE POLICY "Users read own api keys" ON public.api_keys
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own api keys" ON public.api_keys;
CREATE POLICY "Users insert own api keys" ON public.api_keys
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own api keys" ON public.api_keys;
CREATE POLICY "Users update own api keys" ON public.api_keys
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_active ON public.api_keys(user_id) WHERE revoked = false;
