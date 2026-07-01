import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PLANS } from "@/lib/plans";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/I18nContext";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Fiyatlandırma — iFlexi" },
      {
        name: "description",
        content: "Üç sade plan, gizli ücret yok. Misafir, ücretsiz üye veya Pro — kendi temponda büyü.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { user } = useAuth();
  const { t } = useI18n();

  const onChoose = (tier: "guest" | "free" | "pro") => {
    if (tier === "guest") return;
    if (!user) {
      window.dispatchEvent(
        new CustomEvent("auth:open", { detail: { mode: "signup" } }),
      );
      return;
    }
    if (tier === "pro") {
      toast(t("pricing.soon"));
    } else {
      toast.success(t("pricing.alreadyFree"));
    }
  };

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
            {t("nav.pricing")}
          </div>
          <h1 className="mt-10 text-5xl font-black tracking-tighter uppercase sm:text-7xl md:text-8xl">
            {t("pricing.title")}
            <span className="neon-text block mt-2">{t("pricing.subtitle")}</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium text-muted-foreground">
            {t("pricing.description")}
          </p>
        </motion.header>

        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="relative"
            >
              <div className={`nocteria-card h-full p-10 flex flex-col ${p.featured ? "border-brand/40 neon-glow bg-brand/5" : ""}`}>
                {p.featured && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand px-6 py-1.5 text-[10px] font-black uppercase tracking-widest text-background">
                    {t("pricing.recommended")}
                  </span>
                )}
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand">
                  {t(`common.${p.tier}`)}
                </p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-black tracking-tighter text-foreground">{p.price}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t(`pricing.plans.${p.tier}.priceSub`)}
                  </span>
                </div>
                <p className="mt-4 text-sm font-medium text-muted-foreground">{t(`pricing.plans.${p.tier}.tagline`)}</p>

                <ul className="mt-12 flex-1 space-y-5">
                  {(t(`pricing.plans.${p.tier}.perks`, { returnObjects: true }) as string[]).map((perk) => (
                    <li key={perk} className="flex items-start gap-4 text-sm font-medium text-foreground/80">
                      <div className="mt-0.5 rounded-full bg-brand/10 p-1 text-brand">
                        <Check size={12} />
                      </div>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onChoose(p.tier)}
                  className={`mt-12 w-full rounded-xl py-4 text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 ${
                    p.featured
                      ? "bg-brand text-background neon-glow"
                      : "bg-card border border-border/40 text-foreground hover:border-brand/40"
                  }`}
                >
                  {t(`pricing.plans.${p.tier}.cta`)}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="mt-48">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tighter uppercase sm:text-5xl">
              {t("pricing.faqTitle")}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {(t("pricing.faq", { returnObjects: true }) as { q: string; a: string }[]).map((f) => (
              <div key={f.q} className="nocteria-card p-10">
                <h4 className="text-xl font-bold tracking-tight text-foreground">{f.q}</h4>
                <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
