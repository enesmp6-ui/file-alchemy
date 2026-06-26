import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  History,
  CreditCard,
  Bell,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  TrendingUp,
  HardDrive,
  Inbox,
  Copy,
  Gift,
  KeyRound,
  Terminal,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/lib/AuthContext";
import { useWeeklyLimit, TIERS } from "@/lib/useWeeklyLimit";
import { useTheme } from "@/lib/ThemeContext";
import { useI18n, type Locale } from "@/lib/I18nContext";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "iFlexi — Account" },
      { name: "description", content: "Manage your iFlexi plan, usage and preferences." },
    ],
  }),
  component: AccountPage,
});

type TabKey =
  | "overview"
  | "history"
  | "billing"
  | "notifications"
  | "settings"
  | "security"
  | "developer";

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    if (!loading && !user) {
      void navigate({ to: "/" });
    }
  }, [loading, user, navigate]);

  const isPro = user?.plan === "pro";

  const tabs: { id: TabKey; label: string; icon: typeof LayoutDashboard }[] = useMemo(() => {
    const base: { id: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
      { id: "overview", label: t("account.tabs.overview"), icon: LayoutDashboard },
      { id: "history", label: t("account.tabs.history"), icon: History },
      { id: "billing", label: t("account.tabs.billing"), icon: CreditCard },
      { id: "notifications", label: t("account.tabs.notifications"), icon: Bell },
      { id: "settings", label: t("account.tabs.settings"), icon: Settings },
      { id: "security", label: t("account.tabs.security"), icon: ShieldCheck },
      { id: "developer", label: t("account.tabs.developer"), icon: Terminal },
    ];
    return base;
  }, [t]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 pt-32 sm:px-8">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t("account.title")}
            </p>
            <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight sm:text-4xl">
              {user.name}
            </h1>
            <p className="mt-1.5 truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
              isPro
                ? "bg-foreground text-background"
                : "border border-border bg-muted text-foreground"
            }`}
          >
            {isPro ? t("common.pro") : t("common.free")}
          </span>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside>
            <nav className="hidden lg:block">
              <ul className="space-y-1">
                {tabs.map(({ id, label, icon: Icon }) => {
                  const active = tab === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => setTab(id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                          active
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        }`}
                      >
                        <Icon size={15} strokeWidth={1.8} />
                        <span>{label}</span>
                      </button>
                    </li>
                  );
                })}
                <li className="pt-2">
                  <button
                    onClick={() => void signOut()}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
                  >
                    <LogOut size={15} strokeWidth={1.8} />
                    <span>{t("nav.signOut")}</span>
                  </button>
                </li>
              </ul>
            </nav>

            <div className="-mx-5 overflow-x-auto px-5 lg:hidden">
              <div className="flex gap-1.5 pb-2">
                {tabs.map(({ id, label, icon: Icon }) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setTab(id)}
                      className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                        active
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background text-muted-foreground"
                      }`}
                    >
                      <Icon size={13} strokeWidth={1.8} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                {tab === "overview" && <OverviewTab />}
                {tab === "history" && <HistoryTab />}
                {tab === "billing" && <BillingTab />}
                {tab === "notifications" && <NotificationsTab />}
                {tab === "settings" && <SettingsTab />}
                {tab === "security" && <SecurityTab />}
                {tab === "developer" && <DeveloperTab />}
              </motion.div>
            </AnimatePresence>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Primitives
   ────────────────────────────────────────────────────────────────────────── */

function Card({
  title,
  desc,
  children,
  action,
}: {
  title?: string;
  desc?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="text-base font-semibold tracking-tight">{title}</h3>}
            {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <Icon size={14} className="text-muted-foreground" strokeWidth={1.8} />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof Inbox; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon size={20} strokeWidth={1.6} />
      </div>
      <p className="mt-4 max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

async function copyToClipboard(text: string, msg: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(msg);
  } catch {
    toast.error("Copy failed");
  }
}

/* ──────────────────────────────────────────────────────────────────────────
   Conversion log hook
   ────────────────────────────────────────────────────────────────────────── */

type ConversionRow = {
  id: string;
  created_at: string;
  source_format: string | null;
  target_format: string | null;
  file_size_bytes: number | null;
};

function useConversionsLog() {
  const [rows, setRows] = useState<ConversionRow[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("conversions_log")
      .select("id, created_at, source_format, target_format, file_size_bytes")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        if (!cancelled) setRows((data as ConversionRow[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return rows;
}

/* ──────────────────────────────────────────────────────────────────────────
   Overview
   ────────────────────────────────────────────────────────────────────────── */

function OverviewTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const limit = useWeeklyLimit();
  const cfg = TIERS[user!.plan];
  const rows = useConversionsLog();

  const pct = limit.limit > 0 ? Math.min(100, (limit.used / limit.limit) * 100) : 0;
  const days = limit.countdown?.days ?? 0;
  const hours = limit.countdown?.hours ?? 0;

  const stats = useMemo(() => {
    if (!rows) return { total: 0, month: 0, avgMB: "—" };
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    let monthCount = 0;
    let sizeSum = 0;
    let sizeN = 0;
    for (const r of rows) {
      if (new Date(r.created_at).getTime() >= monthStart) monthCount++;
      if (r.file_size_bytes) {
        sizeSum += r.file_size_bytes;
        sizeN++;
      }
    }
    const avg = sizeN > 0 ? `${(sizeSum / sizeN / 1024 / 1024).toFixed(1)} MB` : "—";
    return { total: rows.length, month: monthCount, avgMB: avg };
  }, [rows]);

  return (
    <div className="space-y-6">
      <Card
        title={t("account.overview.weeklyUsage")}
        desc={t("account.overview.usedOf", { used: limit.used, limit: limit.limit })}
        action={
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {t("account.overview.resetIn", { days, hours })}
          </span>
        }
      >
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-foreground"
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {cfg.weekly} files / week · max {cfg.maxMB}MB per file
            {limit.bonusLimit > 0 && (
              <span className="ml-2 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                +{limit.bonusLimit} bonus
              </span>
            )}
          </span>
          {user!.plan !== "pro" && (
            <button
              onClick={() => (window.location.href = "/pricing")}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background transition hover:opacity-90"
            >
              <Sparkles size={12} />
              {t("account.overview.upgrade")}
            </button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat
          label={t("account.overview.stats.totalConversions")}
          value={String(stats.total)}
          icon={TrendingUp}
        />
        <Stat
          label={t("account.overview.stats.thisMonth")}
          value={String(stats.month)}
          icon={LayoutDashboard}
        />
        <Stat
          label={t("account.overview.stats.avgSize")}
          value={stats.avgMB}
          icon={HardDrive}
        />
      </div>

      <UsageChart rows={rows} />
      <TopFormatsCard rows={rows} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Usage chart (recharts, weekly/monthly)
   ────────────────────────────────────────────────────────────────────────── */

function UsageChart({ rows }: { rows: ConversionRow[] | null }) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [mode, setMode] = useState<"weekly" | "monthly">("weekly");

  const data = useMemo(() => {
    if (!rows) return [];
    const now = new Date();
    const buckets: { label: string; count: number; key: number }[] = [];

    if (mode === "weekly") {
      // last 4 weeks, Monday-start
      const monday = new Date(now);
      const day = monday.getDay();
      const diff = (day + 6) % 7;
      monday.setHours(0, 0, 0, 0);
      monday.setDate(monday.getDate() - diff);
      for (let i = 3; i >= 0; i--) {
        const start = new Date(monday);
        start.setDate(monday.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        buckets.push({
          label: `${start.getDate()}/${start.getMonth() + 1}`,
          count: 0,
          key: start.getTime(),
        });
        // tag the end via parallel array below
      }
      const ends = buckets.map((b, i) => {
        const e = new Date(b.key);
        e.setDate(e.getDate() + 7);
        return e.getTime();
      });
      for (const r of rows) {
        const ts = new Date(r.created_at).getTime();
        for (let i = 0; i < buckets.length; i++) {
          if (ts >= buckets[i].key && ts < ends[i]) {
            buckets[i].count++;
            break;
          }
        }
      }
    } else {
      // last 4 months
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
          label: d.toLocaleString(undefined, { month: "short" }),
          count: 0,
          key: d.getTime(),
        });
      }
      const ends = buckets.map((b) => {
        const d = new Date(b.key);
        d.setMonth(d.getMonth() + 1);
        return d.getTime();
      });
      for (const r of rows) {
        const ts = new Date(r.created_at).getTime();
        for (let i = 0; i < buckets.length; i++) {
          if (ts >= buckets[i].key && ts < ends[i]) {
            buckets[i].count++;
            break;
          }
        }
      }
    }
    return buckets;
  }, [rows, mode]);

  const isDark = theme === "dark";
  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const barColor = isDark ? "#ffffff" : "#0a0a0a";
  const tooltipBg = isDark ? "#0a0a0a" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";

  const hasData = data.some((d) => d.count > 0);

  return (
    <Card
      title={t("account.chart.title")}
      desc={mode === "weekly" ? t("account.chart.lastWeeks") : t("account.chart.lastMonths")}
      action={
        <div className="inline-flex rounded-full border border-border bg-muted p-0.5 text-[11px] font-medium">
          {(["weekly", "monthly"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1 transition ${
                mode === m ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
            >
              {t(`account.chart.${m}`)}
            </button>
          ))}
        </div>
      }
    >
      {rows === null ? (
        <div className="h-56 animate-pulse rounded-xl bg-muted" />
      ) : !hasData ? (
        <EmptyState icon={TrendingUp} message={t("account.chart.empty")} />
      ) : (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="label"
                stroke={axisColor}
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                stroke={axisColor}
                tickLine={false}
                axisLine={false}
                fontSize={11}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: gridColor }}
                contentStyle={{
                  background: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: axisColor }}
                formatter={(v: number) => [v, t("account.chart.conversions")]}
              />
              <Bar dataKey="count" fill={barColor} radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Top formats
   ────────────────────────────────────────────────────────────────────────── */

function TopFormatsCard({ rows }: { rows: ConversionRow[] | null }) {
  const { t } = useI18n();
  const top = useMemo(() => {
    if (!rows) return [];
    const map = new Map<string, number>();
    for (const r of rows) {
      const s = (r.source_format ?? "—").toUpperCase();
      const tg = (r.target_format ?? "—").toUpperCase();
      const k = `${s} → ${tg}`;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, count]) => ({ label, count }));
  }, [rows]);

  return (
    <Card title={t("account.formats.title")} desc={t("account.formats.subtitle")}>
      {rows === null ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : top.length === 0 ? (
        <EmptyState icon={Inbox} message={t("account.formats.empty")} />
      ) : (
        <ul className="space-y-2">
          {top.map((row, i) => {
            const max = top[0].count;
            const pct = Math.max(6, (row.count / max) * 100);
            return (
              <li
                key={row.label}
                className="relative overflow-hidden rounded-xl border border-border bg-muted/30 px-4 py-3"
              >
                <div
                  className="absolute inset-y-0 left-0 bg-foreground/[0.06]"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                      {i + 1}
                    </span>
                    {row.label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {t("account.formats.times", { count: row.count })}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   History
   ────────────────────────────────────────────────────────────────────────── */

function HistoryTab() {
  const { t } = useI18n();
  const rows = useConversionsLog();
  const [page, setPage] = useState(0);
  const pageSize = 10;

  if (rows === null) {
    return (
      <Card title={t("account.history.title")}>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card title={t("account.history.title")}>
        <EmptyState icon={Inbox} message={t("account.history.empty")} />
      </Card>
    );
  }

  const pageRows = rows.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(rows.length / pageSize);

  return (
    <Card title={t("account.history.title")}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="py-2 pr-4">{t("account.history.cols.date")}</th>
              <th className="py-2 pr-4">{t("account.history.cols.source")}</th>
              <th className="py-2 pr-4">{t("account.history.cols.target")}</th>
              <th className="py-2">{t("account.history.cols.size")}</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="py-3 pr-4 text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4 font-medium uppercase">{r.source_format ?? "—"}</td>
                <td className="py-3 pr-4 font-medium uppercase">{r.target_format ?? "—"}</td>
                <td className="py-3 text-muted-foreground">
                  {r.file_size_bytes
                    ? `${(r.file_size_bytes / 1024 / 1024).toFixed(1)} MB`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {page + 1} / {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-full border border-border px-3 py-1.5 font-medium disabled:opacity-40"
            >
              {t("common.previous")}
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-full border border-border px-3 py-1.5 font-medium disabled:opacity-40"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Billing
   ────────────────────────────────────────────────────────────────────────── */

function BillingTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isPro = user!.plan === "pro";
  return (
    <div className="space-y-6">
      <Card title={t("account.billing.currentPlan")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight">
              {isPro ? "iFlexi Pro" : "iFlexi Free"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPro
                ? "200 files / week · up to 500 MB per file"
                : "20 files / week · up to 50 MB per file"}
            </p>
          </div>
          {isPro ? (
            <button
              onClick={() => toast("Subscription management is on the way.")}
              className="rounded-full border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              {t("account.billing.cancel")}
            </button>
          ) : (
            <a
              href="/pricing"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {t("account.overview.upgrade")}
            </a>
          )}
        </div>
      </Card>
      <Card title={t("account.billing.invoices")}>
        <EmptyState icon={CreditCard} message={t("account.billing.noInvoices")} />
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const { t } = useI18n();
  return (
    <Card title={t("account.notifications.title")}>
      <EmptyState icon={Bell} message={t("account.notifications.empty")} />
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Settings (+ referral)
   ────────────────────────────────────────────────────────────────────────── */

function SettingsTab() {
  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const { user, updateUser, signOut } = useAuth();
  const [name, setName] = useState(user!.name);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card title={t("account.settings.profile")}>
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              {t("account.settings.name")}
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-foreground/40 focus:ring-2 focus:ring-foreground/10"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">
              {t("account.settings.email")}
            </span>
            <input
              value={user!.email}
              readOnly
              className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-border bg-muted px-3.5 py-2.5 text-sm text-muted-foreground"
            />
            <span className="mt-1 block text-[11px] text-muted-foreground">
              {t("account.settings.emailLocked")}
            </span>
          </label>
          <button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              const res = await updateUser({ name });
              setSaving(false);
              if (res.error) toast.error(res.error);
              else toast.success("✓");
            }}
            className="rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </Card>

      <ReferralCard />

      <Card title={t("account.settings.language")}>
        <div className="flex gap-2">
          {(["en", "tr"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                locale === l
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {l === "en" ? "English" : "Türkçe"}
            </button>
          ))}
        </div>
      </Card>

      <Card title={t("account.settings.theme")}>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              theme === "light"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <Sun size={15} /> {t("account.settings.themeLight")}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              theme === "dark"
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            <Moon size={15} /> {t("account.settings.themeDark")}
          </button>
        </div>
      </Card>

      <Card title={t("account.settings.dangerZone")}>
        <p className="text-sm text-muted-foreground">{t("account.settings.deleteConfirm")}</p>
        <button
          onClick={() => setDeleteOpen(true)}
          className="mt-4 rounded-full border border-destructive/40 px-5 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
        >
          {t("account.settings.deleteAccount")}
        </button>
      </Card>

      <AnimatePresence>
        {deleteOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-md"
              onClick={() => setDeleteOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <h3 className="text-base font-semibold tracking-tight">
                {t("account.settings.deleteAccount")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("account.settings.deleteConfirm")}
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteOpen(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground"
                >
                  {t("common.cancel")}
                </button>
                <button
                  onClick={async () => {
                    setDeleteOpen(false);
                    await signOut();
                    toast.success("Signed out.");
                  }}
                  className="rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground"
                >
                  {t("account.settings.deleteCta")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReferralCard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const limit = useWeeklyLimit();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", user.id)
      .then(({ count }) => {
        if (!cancelled) setCount(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const code = user?.referralCode ?? "";
  const link =
    typeof window !== "undefined" && code
      ? `${window.location.origin}/?ref=${code}`
      : "";

  return (
    <Card title={t("account.referral.title")} desc={t("account.referral.subtitle")}>
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-foreground text-background">
          <Gift size={16} />
        </div>
        <p className="text-sm">
          {count === null ? (
            <span className="text-muted-foreground">{t("common.loading")}</span>
          ) : count === 0 ? (
            <span className="text-muted-foreground">{t("account.referral.noneYet")}</span>
          ) : (
            <span className="font-medium">
              {t("account.referral.stats", { count, bonus: limit.bonusLimit })}
            </span>
          )}
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">
          {t("account.referral.yourLink")}
        </span>
        <div className="mt-1.5 flex gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 truncate rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none"
          />
          <button
            onClick={() => copyToClipboard(link, t("common.copied"))}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background transition hover:opacity-90"
          >
            <Copy size={12} /> {t("account.referral.copyLink")}
          </button>
        </div>
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-medium text-muted-foreground">
          {t("account.referral.yourCode")}
        </span>
        <div className="mt-1.5 flex gap-2">
          <input
            readOnly
            value={code}
            className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-sm tracking-widest text-foreground outline-none"
          />
          <button
            onClick={() => copyToClipboard(code, t("common.copied"))}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
          >
            <Copy size={12} /> {t("account.referral.copyCode")}
          </button>
        </div>
      </label>
    </Card>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Security
   ────────────────────────────────────────────────────────────────────────── */

function SecurityTab() {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <Card title={t("account.security.sessions")}>
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
          <div>
            <p className="text-sm font-medium">{t("account.security.thisDevice")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {typeof navigator !== "undefined" ? navigator.userAgent.split(")")[0].split("(")[1] : ""}
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            ●  Active
          </span>
        </div>
      </Card>

      <Card title={t("account.security.changePassword")}>
        <button
          onClick={async () => {
            const { data } = await supabase.auth.getSession();
            const email = data.session?.user.email;
            if (!email) return;
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/`,
            });
            if (error) toast.error(error.message);
            else toast.success("Check your email for a reset link.");
          }}
          className="rounded-full border border-border bg-muted px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-accent"
        >
          {t("account.security.changePassword")}
        </button>
      </Card>

      <Card title={t("account.security.twoFactor")} desc={t("account.security.twoFactorDesc")}>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("common.soon")}
        </span>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Developer (API keys)
   ────────────────────────────────────────────────────────────────────────── */

type ApiKeyRow = {
  id: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomKey(): string {
  const raw = new Uint8Array(32);
  crypto.getRandomValues(raw);
  let bin = "";
  for (const b of raw) bin += String.fromCharCode(b);
  const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `iflx_${b64}`;
}

function DeveloperTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const isPro = user!.plan === "pro";
  const [active, setActive] = useState<ApiKeyRow | null | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("api_keys")
      .select("id, key_prefix, created_at, last_used_at, revoked")
      .eq("user_id", user.id)
      .eq("revoked", false)
      .order("created_at", { ascending: false })
      .limit(1);
    setActive(((data as ApiKeyRow[]) ?? [])[0] ?? null);
  }, [user?.id]);

  useEffect(() => {
    if (isPro) void refresh();
  }, [isPro, refresh]);

  if (!isPro) {
    return (
      <Card title={t("account.developer.title")}>
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <KeyRound size={20} strokeWidth={1.6} />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{t("account.developer.proOnly")}</p>
          <a
            href="/pricing"
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background"
          >
            <Sparkles size={12} /> {t("account.developer.upgradeCta")}
          </a>
        </div>
      </Card>
    );
  }

  const createKey = async () => {
    if (!user?.id) return;
    setCreating(true);
    try {
      const raw = randomKey();
      const hash = await sha256Hex(raw);
      const prefix = raw.slice(0, 12);
      // revoke any active keys
      await supabase
        .from("api_keys")
        .update({ revoked: true })
        .eq("user_id", user.id)
        .eq("revoked", false);
      const { error } = await supabase.from("api_keys").insert({
        user_id: user.id,
        key_hash: hash,
        key_prefix: prefix,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      setNewKey(raw);
      toast.success(t("account.developer.keyCreated"));
      void refresh();
    } finally {
      setCreating(false);
    }
  };

  const revoke = async () => {
    if (!active) return;
    if (!confirm(t("account.developer.confirmRevoke"))) return;
    const { error } = await supabase
      .from("api_keys")
      .update({ revoked: true })
      .eq("id", active.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("account.developer.keyRevoked"));
    setActive(null);
  };

  return (
    <div className="space-y-6">
      <Card title={t("account.developer.title")} desc={t("account.developer.intro")}>
        <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t("account.developer.soonNote")}
        </p>

        {active === undefined ? (
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        ) : active === null ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <span className="text-sm text-muted-foreground">{t("account.developer.noKey")}</span>
            <button
              onClick={createKey}
              disabled={creating}
              className="rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
            >
              {creating ? t("common.loading") : t("account.developer.createKey")}
            </button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("account.developer.activeKey")}
                </p>
                <p className="mt-1 truncate font-mono text-sm">
                  {active.key_prefix}••••••••••••
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t("account.developer.createdAt", {
                    date: new Date(active.created_at).toLocaleDateString(),
                  })}{" "}
                  ·{" "}
                  {active.last_used_at
                    ? t("account.developer.lastUsed", {
                        date: new Date(active.last_used_at).toLocaleDateString(),
                      })
                    : t("account.developer.neverUsed")}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={createKey}
                  disabled={creating}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                >
                  {t("account.developer.rotate")}
                </button>
                <button
                  onClick={revoke}
                  className="rounded-full border border-destructive/40 px-3 py-1.5 text-[11px] font-semibold text-destructive transition hover:bg-destructive/10"
                >
                  {t("account.developer.revokeKey")}
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {newKey && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-md"
              onClick={() => setNewKey(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <h3 className="text-base font-semibold tracking-tight">
                {t("account.developer.newKeyTitle")}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("account.developer.newKeyDesc")}
              </p>
              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3">
                <code className="block break-all font-mono text-xs">{newKey}</code>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => copyToClipboard(newKey, t("common.copied"))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
                >
                  <Copy size={12} /> {t("common.copy")}
                </button>
                <button
                  onClick={() => setNewKey(null)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground"
                >
                  {t("common.cancel")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
