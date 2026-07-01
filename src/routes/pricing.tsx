import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageShell, GlassCard } from "@/components/PageShell";
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
  const { user } = useAuth();

  const onChoose = (tier: "guest" | "free" | "pro") => {
    if (tier === "guest") return;
    if (!user) {
      window.dispatchEvent(
        new CustomEvent("auth:open", { detail: { mode: "signup" } }),
      );
      return;
    }
    if (tier === "pro") {
      toast(
        "Pro yükseltmesi yakında ödeme sağlayıcımız ile entegre olacak.",
      );
    } else {
      toast.success("Zaten ücretsiz üyesin.");
    }
  };

  return (
    <PageShell
      eyebrow="Planlar"
      title={<>Sade fiyat.<br /><span className="text-muted-foreground">Net değer.</span></>}
      subtitle="Gizli ücret yok, taahhüt yok. Her plan tarayıcında çalışan aynı güvenli motoru kullanır."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <motion.div
            key={p.tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <GlassCard className={`h-full flex flex-col ${p.featured ? "pro-glow border-foreground/10" : ""}`}>
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-background">
                  Önerilen
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {TIERS[p.tier].label}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">{p.price}</span>
                {p.priceSub && (
                  <span className="text-xs text-muted-foreground">{p.priceSub}</span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.tagline}</p>

              <ul className="mt-10 flex-1 space-y-4 text-sm">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-foreground/80">
                    <Check />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onChoose(p.tier)}
                className={`mt-10 w-full rounded-full py-3.5 text-sm font-semibold transition-all duration-300 ${
                  p.featured
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {p.cta}
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <section className="mt-32">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Sıkça merak edilenler.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
            <GlassCard key={f.q} title={f.q}>
              <p className="mt-2 text-base text-muted-foreground">{f.a}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function Check() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
