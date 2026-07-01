// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const PLAN_LIMITS = {
  free: { weekly: 50, maxBytes: 100 * 1024 * 1024 },
  pro: { weekly: 1000, maxBytes: 2 * 1024 * 1024 * 1024 },
} as const;

type Plan = keyof typeof PLAN_LIMITS;

/** Monday 00:00 in Europe/Istanbul (UTC+3, no DST) as a UTC ISO string. */
function weekStartIstanbul(now: Date = new Date()): string {
  const tr = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const day = tr.getUTCDay(); // 0=Sun…6=Sat
  const diffToMon = (day + 6) % 7;
  const trMidnight = Date.UTC(
    tr.getUTCFullYear(),
    tr.getUTCMonth(),
    tr.getUTCDate() - diffToMon,
    0,
    0,
    0,
  );
  return new Date(trMidnight - 3 * 60 * 60 * 1000).toISOString();
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ??
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

  // Identify the caller via their JWT
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "missing_auth" }, 401);
  }

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userRes, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userRes.user) return json({ error: "invalid_token" }, 401);
  const userId = userRes.user.id;

  // All mutations go through service-role so we can touch usage_counters / conversions_log
  // and read profiles.plan without leaking permissions to clients.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Load plan
  const { data: profile, error: profErr } = await admin
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  if (profErr) return json({ error: "profile_lookup_failed" }, 500);

  const plan = ((profile?.plan as Plan | undefined) ?? "free") as Plan;
  const limits = PLAN_LIMITS[plan];
  const periodStart = weekStartIstanbul();

  // Probe mode: GET → just return current state, no consumption
  let probe = req.method === "GET";
  let meta: { fileSizeBytes?: number; sourceFormat?: string; targetFormat?: string } = {};
  if (!probe) {
    try {
      meta = await req.json();
    } catch {
      meta = {};
    }
    if (meta && (meta as any).probe === true) probe = true;
  }

  // Ensure usage row exists
  const { data: existing, error: selErr } = await admin
    .from("usage_counters")
    .select("id, files_used, bonus_limit")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .maybeSingle();
  if (selErr) return json({ error: "usage_lookup_failed" }, 500);

  let usageId = existing?.id as string | undefined;
  let filesUsed = existing?.files_used ?? 0;
  let bonusLimit = existing?.bonus_limit ?? 0;

  if (!usageId) {
    const { data: ins, error: insErr } = await admin
      .from("usage_counters")
      .insert({ user_id: userId, period_start: periodStart, files_used: 0, bonus_limit: 0 })
      .select("id, files_used, bonus_limit")
      .single();
    if (insErr) return json({ error: "usage_insert_failed" }, 500);
    usageId = ins.id;
    filesUsed = ins.files_used;
    bonusLimit = ins.bonus_limit ?? 0;
  }

  const effectiveLimit = limits.weekly + bonusLimit;

  if (probe) {
    return json({
      allowed: filesUsed < effectiveLimit,
      plan,
      used: filesUsed,
      limit: effectiveLimit,
      baseLimit: limits.weekly,
      bonusLimit,
      remaining: Math.max(0, effectiveLimit - filesUsed),
      maxBytes: limits.maxBytes,
      periodStart,
    });
  }

  // File-size guard
  const size = Number(meta.fileSizeBytes ?? 0);
  if (size > limits.maxBytes) {
    return json(
      {
        allowed: false,
        reason: "file_too_large",
        plan,
        used: filesUsed,
        limit: effectiveLimit,
        baseLimit: limits.weekly,
        bonusLimit,
        remaining: Math.max(0, effectiveLimit - filesUsed),
        maxBytes: limits.maxBytes,
      },
      413,
    );
  }

  // Weekly limit guard
  if (filesUsed >= effectiveLimit) {
    return json(
      {
        allowed: false,
        reason: "weekly_limit_reached",
        plan,
        used: filesUsed,
        limit: effectiveLimit,
        baseLimit: limits.weekly,
        bonusLimit,
        remaining: 0,
        maxBytes: limits.maxBytes,
      },
      429,
    );
  }

  const nextUsed = filesUsed + 1;
  const { error: updErr } = await admin
    .from("usage_counters")
    .update({ files_used: nextUsed })
    .eq("id", usageId)
    .eq("files_used", filesUsed);
  if (updErr) return json({ error: "usage_update_failed" }, 500);

  await admin.from("conversions_log").insert({
    user_id: userId,
    file_size_bytes: size || null,
    source_format: meta.sourceFormat ?? null,
    target_format: meta.targetFormat ?? null,
  });

  return json({
    allowed: true,
    plan,
    used: nextUsed,
    limit: effectiveLimit,
    baseLimit: limits.weekly,
    bonusLimit,
    remaining: Math.max(0, effectiveLimit - nextUsed),
    maxBytes: limits.maxBytes,
    periodStart,
  });
});
