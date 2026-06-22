import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { TIERS, useWeeklyLimit, type Tier } from "@/lib/useWeeklyLimit";
import { Converter } from "@/components/Converter";
import { LimitModal } from "@/components/LimitModal";
import { Navbar } from "@/components/Navbar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dönüştür. Sıkıştır. Güvende Kal." },
      {
        name: "description",
        content:
          "Tarayıcında çalışan premium dosya dönüştürücü. PNG, JPG ve WEBP arasında dönüştür — hiçbir dosya sunucuya gitmez.",
      },
    ],
  }),
  component: Index,
});

const PLANS: { tier: Tier; price: string; tagline: string; perks: string[]; cta: string; featured?: boolean }[] = [
  {
    tier: "guest",
    price: "Ücretsiz",
    tagline: "Hızlıca dene",
    perks: ["Haftalık 5 dosya", "Maks. 10MB dosya", "Tarayıcıda dönüşüm"],
    cta: "Misafir Olarak Devam Et",
  },
  {
    tier: "free",
    price: "Üyelik",
    tagline: "Daha fazlası, ücretsiz",
    perks: ["Haftalık 20 dosya", "Maks. 50MB dosya", "Geçmiş ve tercihler"],
    cta: "Ücretsiz Üye Ol",
  },
  {
    tier: "pro",
    price: "Pro",
    tagline: "Sınırları kaldır",
    perks: ["Haftalık 200 dosya", "Maks. 500MB dosya", "Öncelikli işlem"],
    cta: "Pro'yu Dene",
    featured: true,
  },
];

function Index() {
  const limit = useWeeklyLimit();
  const [modal, setModal] = useState<{ open: boolean; msg?: string }>({ open: false });

  const percent = Math.min(100, (limit.used / limit.config.weekly) * 100);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 pt-32 pb-32 sm:px-8 sm:pt-40">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Premium Dosya Dönüştürücü
          </p>
          <h1 className="mt-6 text-5xl font-thin leading-[1.05] tracking-tight sm:text-7xl md:text-8xl">
            Dönüştür.
            <br />
            <span className="text-white/60">Sıkıştır.</span>
            <br />
            Güvende Kal.
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base text-muted-foreground sm:text-lg">
            Görsellerin tamamen tarayıcında dönüşür. Hiçbir veri sunucuya gitmez.
          </p>
        </motion.header>

        {/* Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          id="limits"
          className="mt-20 glass-card p-6 sm:p-10 scroll-mt-24"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-white/40">Durum</p>
              <h2 className="mt-1 truncate text-2xl font-semibold sm:text-3xl">
                {limit.config.label}
              </h2>
            </div>
            <div className="flex shrink-0 gap-1 rounded-full border border-white/10 p-1">
              {(Object.keys(TIERS) as Tier[]).map((t) => (
                <button
                  key={t}
                  onClick={() => limit.setTier(t)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    limit.tier === t
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {TIERS[t].label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-muted-foreground">
                Bu hafta{" "}
                <span className="text-white">
                  {limit.used} / {limit.config.weekly}
                </span>{" "}
                limit kullanıldı
              </span>
              <span className="text-xs text-muted-foreground">
                Maks. {limit.config.maxMB}MB / dosya
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(180,180,180,0.6) 100%)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/5 pt-6 text-center">
            {(["days", "hours", "minutes"] as const).map((k) => {
              const labels = { days: "Gün", hours: "Saat", minutes: "Dakika" };
              const v = limit.countdown ? limit.countdown[k] : 0;
              return (
                <div key={k}>
                  <p className="text-3xl font-thin tabular-nums sm:text-4xl">
                    {String(v).padStart(2, "0")}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-white/40">
                    {labels[k]}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {limit.countdown
              ? "Limitlerinin yenilenmesine"
              : "İlk dönüşümünle birlikte haftalık sayaç başlar."}
          </p>
        </motion.section>

        {/* Converter */}
        <div id="converter" className="mt-12 scroll-mt-24">
          <Converter
            maxBytes={limit.maxBytes}
            canConsume={limit.canConsume}
            consume={limit.consume}
            onBlocked={(msg) => setModal({ open: true, msg })}
          />
        </div>

        {/* Plans */}
        <section id="pricing" className="mt-28 scroll-mt-24">
          <div className="text-center">
            <h2 className="text-4xl font-thin tracking-tight sm:text-5xl">
              Kendi temponda büyü.
            </h2>
            <p className="mt-4 text-muted-foreground">
              İhtiyacın değiştiğinde planını değiştir.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <div
                key={p.tier}
                className={`relative flex flex-col rounded-2xl p-8 transition ${
                  p.featured
                    ? "glass-card pro-glow"
                    : "border border-white/10 bg-white/[0.02]"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-black">
                    Önerilen
                  </span>
                )}
                <p className="text-xs uppercase tracking-widest text-white/40">
                  {TIERS[p.tier].label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{p.price}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <ul className="mt-8 space-y-3 text-sm">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-white/80">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/60" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => limit.setTier(p.tier)}
                  className={`mt-10 rounded-full px-6 py-3 text-sm font-medium transition ${
                    p.featured
                      ? "bg-white text-black hover:bg-white/90"
                      : "border border-white/20 text-white hover:bg-white/5"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-32 text-center text-xs text-white/30">
          Tüm dönüşümler tarayıcında. Veriler senin cihazından çıkmaz.
        </footer>
      </div>

      <LimitModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        onUpgrade={() => {
          limit.setTier("pro");
          setModal({ open: false });
        }}
        message={modal.msg}
      />
    </div>
  );
}
