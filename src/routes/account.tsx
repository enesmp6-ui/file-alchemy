import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
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

type TabKey = "overview" | "history" | "billing" | "notifications" | "settings" | "security";

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

  const tabs: { id: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "overview", label: t("account.tabs.overview"), icon: LayoutDashboard },
    { id: "history", label: t("account.tabs.history"), icon: History },
    { id: "billing", label: t("account.tabs.billing"), icon: CreditCard },
    { id: "notifications", label: t("account.tabs.notifications"), icon: Bell },
    { id: "settings", label: t("account.tabs.settings"), icon: Settings },
    { id: "security", label: t("account.tabs.security"), icon: ShieldCheck },
  ];

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
              user.plan === "pro"
                ? "bg-foreground text-background"
                : "border border-border bg-muted text-foreground"
            }`}
          >
            {user.plan === "pro" ? t("common.pro") : t("common.free")}
          </span>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Sidebar / Tabs */}
          <aside>
            {/* Desktop sidebar */}
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

            {/* Mobile horizontal scroll tabs */}
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

          {/* Content */}
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
   Reusable primitives
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

/* ──────────────────────────────────────────────────────────────────────────
   Tabs
   ────────────────────────────────────────────────────────────────────────── */

function OverviewTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const limit = useWeeklyLimit();
  const cfg = TIERS[user!.plan];

  const pct = limit.limit > 0 ? Math.min(100, (limit.used / limit.limit) * 100) : 0;
  const days = limit.countdown?.days ?? 0;
  const hours = limit.countdown?.hours ?? 0;

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
          <span>{cfg.weekly} files / week · max {cfg.maxMB}MB per file</span>
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
          value={String(limit.used)}
          icon={TrendingUp}
        />
        <Stat
          label={t("account.overview.stats.thisMonth")}
          value={String(limit.used)}
          icon={LayoutDashboard}
        />
        <Stat
          label={t("account.overview.stats.avgSize")}
          value="—"
          icon={HardDrive}
        />
      </div>

      <UsageChart used={limit.used} limit={limit.limit} />
    </div>
  );
}

function UsageChart({ used, limit }: { used: number; limit: number }) {
  // Synthesized 7-day distribution from current week's used count
  const days = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    // distribute "used" pseudo-evenly with a soft curve
    const weights = [0.18, 0.14, 0.16, 0.12, 0.2, 0.1, 0.1];
    return labels.map((l, i) => ({
      label: l,
      value: Math.round(used * weights[i]),
    }));
  }, [used]);
  const max = Math.max(1, limit / 7);

  return (
    <Card title="7-day activity">
      <div className="grid grid-cols-7 items-end gap-2 pt-2 sm:gap-3">
        {days.map((d) => {
          const h = Math.max(4, Math.min(100, (d.value / max) * 100));
          return (
            <div key={d.label} className="flex flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full rounded-md bg-foreground/80"
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{d.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

type ConversionRow = {
  id: string;
  created_at: string;
  source_format: string | null;
  target_format: string | null;
  file_size_bytes: number | null;
};

function HistoryTab() {
  const { t } = useI18n();
  const [rows, setRows] = useState<ConversionRow[] | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("conversions_log")
      .select("id, created_at, source_format, target_format, file_size_bytes")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (!cancelled) setRows((data as ConversionRow[]) ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
