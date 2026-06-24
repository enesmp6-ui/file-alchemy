import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pt-32 pb-32 sm:px-8 sm:pt-40">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Kullanım Sınırı
          </p>
          <h1 className="mt-6 text-5xl font-thin leading-[1.05] tracking-tight sm:text-6xl">
            Haftan, tek bakışta.
          </h1>
          <p className="mt-6 max-w-xl text-muted-foreground">
            Adil kullanım için her plan haftalık bir dönüşüm bütçesiyle gelir.
            Bütçen, ilk dönüşümünden tam 7 gün sonra otomatik yenilenir.
          </p>
        </motion.header>

        <section className="mt-16 glass-card p-6 sm:p-10">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-white/40">Durum</p>
              <h2 className="mt-1 truncate text-2xl font-semibold sm:text-3xl">
                {limit.config.label}
              </h2>
            </div>
            <div className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60">
              {limit.tier === "guest"
                ? "Giriş yaparak limitini büyüt"
                : limit.tier === "pro"
                  ? "Pro üyeliğin aktif"
                  : "Ücretsiz üye"}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">
                Bu hafta{" "}
                <span className="text-white">
                  {limit.used} / {limit.config.weekly}
                </span>{" "}
                dosya
              </span>
              <span className="text-xs text-muted-foreground">
                Maks. {limit.config.maxMB}MB / dosya
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-white to-white/40"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/5 pt-8 text-center">
            {(["days", "hours", "minutes"] as const).map((k) => {
              const labels = { days: "Gün", hours: "Saat", minutes: "Dakika" };
              const v = limit.countdown ? limit.countdown[k] : 0;
              return (
                <div key={k}>
                  <p className="text-4xl font-thin tabular-nums sm:text-5xl">
                    {String(v).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-white/40">
                    {labels[k]}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            {limit.countdown
              ? "limitin yenilenmesine kaldı."
              : "İlk dönüşümünle birlikte haftalık sayaç başlar."}
          </p>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {(Object.keys(TIERS) as Tier[]).map((t) => {
            const c = TIERS[t];
            const active = t === limit.tier;
            return (
              <div
                key={t}
                className={`rounded-2xl border p-6 ${
                  active
                    ? "border-white/30 bg-white/[0.04]"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <p className="text-xs uppercase tracking-widest text-white/40">
                  {c.label}
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {c.weekly}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    dosya / hafta
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Maks. {c.maxMB}MB / dosya
                </p>
              </div>
            );
          })}
        </section>

        <div className="mt-16 text-center">
          <Link
            to="/pricing"
            className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Limiti Yükselt
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
