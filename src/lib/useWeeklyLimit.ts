import { useCallback, useEffect, useState } from "react";

export type Tier = "guest" | "free" | "pro";

export const TIERS: Record<Tier, { label: string; weekly: number; maxMB: number }> = {
  guest: { label: "Misafir", weekly: 5, maxMB: 10 },
  free: { label: "Ücretsiz Üye", weekly: 20, maxMB: 50 },
  pro: { label: "Pro Üye", weekly: 200, maxMB: 500 },
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = "wlimit:v1";
const TIER_KEY = "wlimit:tier";

type Stored = { startedAt: number; used: number };

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Stored;
  } catch {
    return null;
  }
}

function writeStored(s: Stored | null) {
  if (typeof window === "undefined") return;
  if (!s) window.localStorage.removeItem(STORAGE_KEY);
  else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function useWeeklyLimit() {
  const [tier, setTierState] = useState<Tier>("guest");
  const [used, setUsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => {
      const t = (window.localStorage.getItem(TIER_KEY) as Tier) || "guest";
      setTierState(t);
    };
    load();
    const s = readStored();
    if (s) {
      if (Date.now() - s.startedAt >= WEEK_MS) {
        writeStored(null);
      } else {
        setUsed(s.used);
        setStartedAt(s.startedAt);
      }
    }
    const handler = () => load();
    window.addEventListener("tier-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("tier-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  // auto reset
  useEffect(() => {
    if (startedAt && now - startedAt >= WEEK_MS) {
      setUsed(0);
      setStartedAt(null);
      writeStored(null);
    }
  }, [now, startedAt]);

  const config = TIERS[tier];
  const remaining = Math.max(0, config.weekly - used);

  const setTier = useCallback((t: Tier) => {
    setTierState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TIER_KEY, t);
      window.dispatchEvent(new Event("tier-changed"));
    }
  }, []);

  const canConsume = useCallback(
    (count = 1) => remaining >= count,
    [remaining],
  );

  const consume = useCallback(
    (count = 1) => {
      setUsed((prev) => {
        const next = prev + count;
        const start = startedAt ?? Date.now();
        if (!startedAt) setStartedAt(start);
        writeStored({ startedAt: start, used: next });
        return next;
      });
    },
    [startedAt],
  );

  const resetIn = startedAt ? Math.max(0, startedAt + WEEK_MS - now) : null;
  const countdown = (() => {
    if (resetIn === null) return null;
    const days = Math.floor(resetIn / (24 * 60 * 60 * 1000));
    const hours = Math.floor((resetIn / (60 * 60 * 1000)) % 24);
    const minutes = Math.floor((resetIn / (60 * 1000)) % 60);
    return { days, hours, minutes };
  })();

  return {
    tier,
    setTier,
    config,
    used,
    remaining,
    canConsume,
    consume,
    countdown,
    maxBytes: config.maxMB * 1024 * 1024,
  };
}
