import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TIERS, useWeeklyLimit, type Tier } from "@/lib/useWeeklyLimit";
import { useI18n } from "@/lib/I18nContext";

export const Route = createFileRoute("/limits")({
  head: () => ({
    meta: [
      { title: "Kullanım Sınırı — iFlexi" },
      {
        name: "description",
        content: "Haftalık dönüşüm limitin, dosya boyutu sınırın ve yenilenme zamanın tek bir panelde.",
      },
    ],
  }),
  component: LimitsPage,
});

function LimitsPage() {
  const limit = useWeeklyLimit();
  const { t } = useI18n();
  const percent = Math.min(100, (limit.used / limit.config.weekly) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground hero-gradient">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-32 sm:px-8 sm:pt-48">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-brand neon-glow">
            {t("nav.usage")}
          </div>
          <h1 className="mt-10 text-5xl font-black tracking-tighter uppercase sm:text-7xl md:text-8xl">
            {t("limits.title")}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium text-muted-foreground">
            {t("limits.description")}
          </p>
        </motion.header>

        <div className="mt-24">
          <div className="nocteria-card p-10 sm:p-16 neon-glow">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">{t("limits.status")}</p>
                <h2 className="mt-4 text-4xl font-black tracking-tighter uppercase sm:text-5xl text-foreground">
                  {t(`common.${limit.tier}`)}
                </h2>
              </div>
              <div className="inline-flex shrink-0 rounded-xl bg-brand/10 border border-brand/20 px-6 py-3 text-xs font-black uppercase tracking-widest text-brand">
                {limit.tier === "guest"
                  ? t("limits.guestCta")
                  : limit.tier === "pro"
                    ? t("limits.proActive")
                    : t("limits.freeActive")}
              </div>
            </div>

            <div className="mt-16">
              <div className="flex items-baseline justify-between text-[10px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">
                  {t("limits.thisWeek", { used: limit.used, total: limit.config.weekly })}
                </span>
                <span className="text-brand">
                  {t("limits.maxPerFile", { mb: limit.config.maxMB })}
                </span>
              </div>
              <div className="mt-6 h-4 w-full overflow-hidden rounded-full bg-card/50 border border-border/40 p-1">
                <motion.div
                  className="h-full rounded-full bg-brand neon-glow"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>

            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-border/40 pt-16 text-center">
              {(["days", "hours", "minutes"] as const).map((k) => {
                const v = limit.countdown ? limit.countdown[k] : 0;
                return (
                  <div key={k}>
                    <p className="text-5xl font-black tracking-tighter tabular-nums sm:text-7xl text-foreground">
                      {String(v).padStart(2, "0")}
                    </p>
                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                      {k.toUpperCase()}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-12 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {limit.countdown
                ? t("limits.countdownSuffix")
                : t("limits.countdownStart")}
            </p>
          </div>
        </div>

        <section className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {(Object.keys(TIERS) as Tier[]).map((tierKey) => {
            const config = TIERS[tierKey];
            const active = tierKey === limit.tier;
            return (
              <div
                key={tierKey}
                className={`nocteria-card p-10 transition-all duration-500 ${
                  active
                    ? "border-brand/40 bg-brand/5 neon-glow"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">
                  {t(`common.${tierKey as Tier}`)}
                </p>
                <p className="mt-6 text-3xl font-black tracking-tighter uppercase text-foreground">
                  {config.weekly}{" "}
                  <span className="text-xs font-bold text-muted-foreground">
                    {t("limits.perWeek")}
                  </span>
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {t("limits.maxPerFile", { mb: config.maxMB })}
                </p>
              </div>
            );
          })}
        </section>

        <div className="mt-24 text-center">
          <Link
            to="/pricing"
            className="inline-flex rounded-xl bg-brand px-12 py-5 text-sm font-black uppercase tracking-widest text-background transition-all hover:scale-105 active:scale-95 neon-glow"
          >
            {t("limits.upgrade")}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
