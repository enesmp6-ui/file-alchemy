import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PageShell, GlassCard } from "@/components/PageShell";
import { PLANS } from "@/lib/plans";
import { TIERS } from "@/lib/useWeeklyLimit";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/I18nContext";

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
    <PageShell
      eyebrow={t("nav.pricing")}
      title={<>{t("pricing.title")}<br /><span className="text-muted-foreground">{t("pricing.subtitle")}</span></>}
      subtitle={t("pricing.description")}
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
                  {t("pricing.recommended")}
                </span>
              )}
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                {t(`common.${p.tier}`)}
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">{p.price}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`pricing.plans.${p.tier}.priceSub`)}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{t(`pricing.plans.${p.tier}.tagline`)}</p>

              <ul className="mt-10 flex-1 space-y-4 text-sm">
                {(t(`pricing.plans.${p.tier}.perks`, { returnObjects: true }) as string[]).map((perk) => (
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
                {t(`pricing.plans.${p.tier}.cta`)}
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <section className="mt-32">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {t("pricing.faqTitle")}
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {(t("pricing.faq", { returnObjects: true }) as { q: string; a: string }[]).map((f) => (
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
