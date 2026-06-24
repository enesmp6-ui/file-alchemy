// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const GUEST = { weekly: 5, maxBytes: 10 * 1024 * 1024 };

function weekStartIstanbul(now: Date = new Date()): string {
  const tr = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const day = tr.getUTCDay();
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

async function hashIp(ip: string, salt: string): Promise<string> {
  const buf = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    "0.0.0.0";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ip = getIp(req);
  const ipHash = await hashIp(ip, SERVICE_ROLE.slice(0, 24));
  const periodStart = weekStartIstanbul();

  let probe = req.method === "GET";
  let meta: { fileSizeBytes?: number } = {};
  if (!probe) {
    try {
      meta = await req.json();
    } catch {
      meta = {};
    }
    if ((meta as any)?.probe === true) probe = true;
  }

  // Find/create guest row
  const { data: existing } = await admin
    .from("guest_usage")
    .select("id, files_used")
    .eq("ip_hash", ipHash)
    .eq("period_start", periodStart)
    .maybeSingle();

  let rowId = existing?.id as string | undefined;
  let filesUsed = existing?.files_used ?? 0;

  if (!rowId) {
    const { data: ins, error: insErr } = await admin
      .from("guest_usage")
      .insert({ ip_hash: ipHash, period_start: periodStart, files_used: 0 })
      .select("id, files_used")
      .single();
    if (insErr) return json({ error: "usage_insert_failed" }, 500);
    rowId = ins.id;
    filesUsed = ins.files_used;
  }

  if (probe) {
    return json({
      allowed: filesUsed < GUEST.weekly,
      plan: "guest",
      used: filesUsed,
      limit: GUEST.weekly,
      remaining: Math.max(0, GUEST.weekly - filesUsed),
      maxBytes: GUEST.maxBytes,
      periodStart,
    });
  }

  const size = Number(meta.fileSizeBytes ?? 0);
  if (size > GUEST.maxBytes) {
    return json(
      {
        allowed: false,
        reason: "file_too_large",
        plan: "guest",
        used: filesUsed,
        limit: GUEST.weekly,
        remaining: Math.max(0, GUEST.weekly - filesUsed),
        maxBytes: GUEST.maxBytes,
      },
      413,
    );
  }

  if (filesUsed >= GUEST.weekly) {
    return json(
      {
        allowed: false,
        reason: "weekly_limit_reached",
        plan: "guest",
        used: filesUsed,
        limit: GUEST.weekly,
        remaining: 0,
        maxBytes: GUEST.maxBytes,
      },
      429,
    );
  }

  const nextUsed = filesUsed + 1;
  const { error: updErr } = await admin
    .from("guest_usage")
    .update({ files_used: nextUsed })
    .eq("id", rowId)
    .eq("files_used", filesUsed);
  if (updErr) return json({ error: "usage_update_failed" }, 500);

  return json({
    allowed: true,
    plan: "guest",
    used: nextUsed,
    limit: GUEST.weekly,
    remaining: Math.max(0, GUEST.weekly - nextUsed),
    maxBytes: GUEST.maxBytes,
    periodStart,
  });
});
