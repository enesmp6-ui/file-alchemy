import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Tier = "guest" | "free" | "pro";

export const TIERS: Record<
  Tier,
  { label: string; weekly: number; maxMB: number }
> = {
  guest: { label: "Misafir", weekly: 5, maxMB: 10 },
  free: { label: "Ücretsiz Üye", weekly: 20, maxMB: 50 },
  pro: { label: "Pro Üye", weekly: 200, maxMB: 500 },
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type ConsumeMeta = {
  fileSizeBytes: number;
  sourceFormat?: string;
  targetFormat?: string;
};

type LimitResponse = {
  allowed: boolean;
  plan: Tier;
  used: number;
  limit: number;
  remaining: number;
  maxBytes: number;
  reason?: "file_too_large" | "weekly_limit_reached";
  periodStart?: string;
};

async function invokeLimit(
  fn: "check-and-consume-limit" | "guest-limit-check",
  body: Record<string, unknown> | null,
): Promise<LimitResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke<LimitResponse>(fn, {
      body: body ?? { probe: true },
    });
    if (error) {
      // supabase-js puts the body under error.context for non-2xx responses
      const ctx = (error as { context?: Response }).context;
      if (ctx) {
        try {
          const parsed = (await ctx.clone().json()) as LimitResponse;
          return parsed;
        } catch {
          /* fall through */
        }
      }
      console.error(`[limit] ${fn} failed`, error);
      return null;
    }
    return data ?? null;
  } catch (e) {
    console.error(`[limit] ${fn} threw`, e);
    return null;
  }
}

export function useWeeklyLimit() {
  const [tier, setTier] = useState<Tier>("guest");
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(TIERS.guest.weekly);
  const [maxBytes, setMaxBytes] = useState(TIERS.guest.maxMB * 1024 * 1024);
  const [periodStart, setPeriodStart] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const tierRef = useRef<Tier>("guest");

  const applyResponse = useCallback((res: LimitResponse | null) => {
    if (!res) return;
    setUsed(res.used);
    setLimit(res.limit);
    setMaxBytes(res.maxBytes);
    if (res.plan) {
      setTier(res.plan);
      tierRef.current = res.plan;
    }
    if (res.periodStart) setPeriodStart(new Date(res.periodStart).getTime());
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const fn = sessionData.session
      ? "check-and-consume-limit"
      : "guest-limit-check";
    const res = await invokeLimit(fn, { probe: true });
    applyResponse(res);
    setLoading(false);
  }, [applyResponse]);

  // Tick clock for countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Initial load + react to auth changes
  useEffect(() => {
    void refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, _s) => {
      setTimeout(() => void refresh(), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  const remaining = Math.max(0, limit - used);

  const canConsume = useCallback(
    (count = 1) => remaining >= count,
    [remaining],
  );

  /** Reserves a single file slot on the server before conversion. */
  const consumeOne = useCallback(
    async (meta: ConsumeMeta): Promise<LimitResponse> => {
      const { data: sessionData } = await supabase.auth.getSession();
      const fn = sessionData.session
        ? "check-and-consume-limit"
        : "guest-limit-check";
      const res = await invokeLimit(fn, meta);
      if (res) applyResponse(res);
      return (
        res ?? {
          allowed: false,
          plan: tierRef.current,
          used,
          limit,
          remaining: 0,
          maxBytes,
          reason: "weekly_limit_reached",
        }
      );
    },
    [applyResponse, used, limit, maxBytes],
  );

  // Countdown to next period_start + 7 days
  const resetIn = periodStart
    ? Math.max(0, periodStart + WEEK_MS - now)
    : null;
  const countdown = (() => {
    if (resetIn === null) return null;
    const days = Math.floor(resetIn / (24 * 60 * 60 * 1000));
    const hours = Math.floor((resetIn / (60 * 60 * 1000)) % 24);
    const minutes = Math.floor((resetIn / (60 * 1000)) % 60);
    return { days, hours, minutes };
  })();

  const config = {
    label: TIERS[tier].label,
    weekly: limit,
    maxMB: Math.round(maxBytes / (1024 * 1024)),
  };

  return {
    tier,
    config,
    used,
    remaining,
    limit,
    maxBytes,
    countdown,
    loading,
    canConsume,
    consumeOne,
    refresh,
  };
}
