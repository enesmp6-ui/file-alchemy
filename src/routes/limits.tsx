import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, GlassCard } from "@/components/PageShell";
import { TIERS, useWeeklyLimit, type Tier } from "@/lib/useWeeklyLimit";

export const Route = createFileRoute("/limits")({
  head: () => ({
    meta: [
      { title: "Kullanım Sınırı — iFlexi" },
      {
        name: "description",
        content:
          "Haftalık dönüşüm limitin, dosya boyutu sınırın ve yenilenme zamanın tek bir panelde.",
      },
      { property: "og:title", content: "Kullanım Sınırı — iFlexi" },
      {
        property: "og:description",
        content: "Haftalık dönüşüm limitin ve yenilenme zamanın tek bir panelde.",
      },
    ],
  }),
  component: LimitsPage,
});

function LimitsPage() {
  const limit = useWeeklyLimit();
  const percent = Math.min(100, (limit.used / limit.config.weekly) * 100);

  return (
    <PageShell
      eyebrow="Kullanım Sınırı"
      title="Haftan, tek bakışta."
      subtitle="Adil kullanım için her plan haftalık bir dönüşüm bütçesiyle gelir. Bütçen, ilk dönüşümünden tam 7 gün sonra otomatik yenilenir."
    >
      <GlassCard className="relative overflow-hidden">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Durum</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
              {limit.config.label}
            </h2>
          </div>
          <div className="inline-flex shrink-0 rounded-full bg-muted px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            {limit.tier === "guest"
              ? "Giriş yaparak limitini büyüt"
              : limit.tier === "pro"
                ? "Pro üyeliğin aktif"
                : "Ücretsiz üye"}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              Bu hafta{" "}
              <span className="text-foreground font-bold">
                {limit.used} / {limit.config.weekly}
              </span>{" "}
              dosya
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              Maks. {limit.config.maxMB}MB / dosya
            </span>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-10 text-center">
          {(["days", "hours", "minutes"] as const).map((k) => {
            const labels = { days: "Gün", hours: "Saat", minutes: "Dakika" };
            const v = limit.countdown ? limit.countdown[k] : 0;
            return (
              <div key={k}>
                <p className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl text-foreground">
                  {String(v).padStart(2, "0")}
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {labels[k]}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
          {limit.countdown
            ? "limitin yenilenmesine kaldı."
            : "İlk dönüşümünle birlikte haftalık sayaç başlar."}
        </p>
      </GlassCard>

      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {(Object.keys(TIERS) as Tier[]).map((t) => {
          const c = TIERS[t];
          const active = t === limit.tier;
          return (
            <GlassCard
              key={t}
              className={`transition-all duration-300 ${
                active
                  ? "border-foreground/20 ring-1 ring-foreground/10"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {c.label}
              </p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {c.weekly}{" "}
                <span className="text-sm font-medium text-muted-foreground">
                  dosya / hafta
                </span>
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Maks. {c.maxMB}MB / dosya
              </p>
            </GlassCard>
          );
        })}
      </section>

      <div className="mt-20 text-center">
        <Link
          to="/pricing"
          className="inline-flex rounded-full bg-foreground px-10 py-4 text-sm font-bold text-background transition-all duration-300 hover:opacity-90 hover:scale-105"
        >
          Limiti Yükselt
        </Link>
      </div>
    </PageShell>
  );
}
