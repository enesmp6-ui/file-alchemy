import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PLANS } from "@/lib/plans";
import { TIERS } from "@/lib/useWeeklyLimit";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Fiyatlandırma — iFlexi" },
      {
        name: "description",
        content:
          "Üç sade plan, gizli ücret yok. Misafir, ücretsiz üye veya Pro — kendi temponda büyü.",
      },
      { property: "og:title", content: "Fiyatlandırma — iFlexi" },
      {
        property: "og:description",
        content: "Üç sade plan, gizli ücret yok. Kendi temponda büyü.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user, signIn, updateUser } = useAuth();

  const onChoose = (tier: "guest" | "free" | "pro") => {
    if (tier === "guest") return;
    if (!user) {
      signIn("you@iflexi.com", "Yeni Üye", { plan: tier });
    } else {
      updateUser({
        plan: tier,
        trialEndsAt:
          tier === "pro" ? Date.now() + 14 * 24 * 60 * 60 * 1000 : null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-32 sm:px-8 sm:pt-40">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Planlar
          </p>
          <h1 className="mt-6 text-5xl font-thin leading-[1.05] tracking-tight sm:text-7xl">
            Sade fiyat.
            <br />
            <span className="text-white/50">Net değer.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-muted-foreground">
            Gizli ücret yok, taahhüt yok. Her plan tarayıcında çalışan
            aynı güvenli motoru kullanır.
          </p>
        </motion.header>

        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col rounded-2xl p-8 ${
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
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                {p.priceSub && (
                  <span className="text-xs text-muted-foreground">{p.priceSub}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>

              <ul className="mt-8 flex-1 space-y-3 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-white/80">
                    <Check />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onChoose(p.tier)}
                className={`mt-10 rounded-full px-6 py-3 text-sm font-medium transition ${
                  p.featured
                    ? "bg-white text-black hover:bg-white/90"
                    : "border border-white/20 text-white hover:bg-white/5"
                }`}
              >
                {p.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <section className="mt-28">
          <h2 className="text-3xl font-thin tracking-tight sm:text-4xl">
            Sıkça merak edilenler.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 sm:grid-cols-2">
            {[
              {
                q: "Dosyalarım sunucunuza yükleniyor mu?",
                a: "Hayır. Tüm dönüşüm tarayıcında, Canvas API ile gerçekleşir. Hiçbir bayt cihazından ayrılmaz.",
              },
              {
                q: "Pro denemesi otomatik ücretlendiriyor mu?",
                a: "Hayır. 14 günlük deneme süresince istediğin an iptal edebilirsin, kart bilgisi gerekmez.",
              },
              {
                q: "Plan değiştirebilir miyim?",
                a: "Evet. Hesap panelinden tek tıkla yükseltebilir veya düşürebilirsin.",
              },
              {
                q: "Haftalık limit ne zaman yenilenir?",
                a: "İlk dönüşümünden tam 7 gün sonra otomatik olarak sıfırlanır.",
              },
            ].map((f) => (
              <div key={f.q} className="bg-black p-6">
                <h3 className="text-sm font-medium text-white">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Check() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-white/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
