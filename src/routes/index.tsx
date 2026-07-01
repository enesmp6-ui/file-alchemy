import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useWeeklyLimit } from "@/lib/useWeeklyLimit";
import { Converter } from "@/components/Converter";
import { LimitModal } from "@/components/LimitModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/PageShell";
import { useI18n } from "@/lib/I18nContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iFlexi — Tarayıcında dönüştür. Hiçbir dosya buluta gitmez." },
      {
        name: "description",
        content:
          "iFlexi, PNG/JPG/WEBP dönüşümünü tamamen tarayıcında, sıfır sunucu yüklemesiyle yapar. Sürükle, bırak, tek tıkla ZIP olarak indir.",
      },
      { property: "og:title", content: "iFlexi — Dosyaların asla cihazını terk etmez." },
      { property: "og:description", content: "Tarayıcı içi, sunucusuz, premium dönüştürücü." },
    ],
  }),
  component: Index,
});

function Index() {
  const limit = useWeeklyLimit();
  const { t } = useI18n();
  const [modal, setModal] = useState<{ open: boolean; msg?: string }>({ open: false });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-32 sm:px-8 sm:pt-40">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-8 text-5xl font-medium leading-[1.05] tracking-tight sm:text-7xl md:text-[6rem] lg:text-[7rem]">
            <span className="rgb-text">{t("hero.titleA")}</span>
            <br />
            <span className="apple-text-gradient">
              {t("hero.titleB")}
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#converter"
              className="rounded-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-all duration-300 hover:opacity-90 hover:scale-105"
            >
              {t("hero.primary")}
            </a>
            <Link
              to="/pricing"
              className="rounded-full border border-border bg-background px-8 py-4 text-sm font-medium text-foreground transition-all duration-300 hover:bg-muted hover:scale-105"
            >
              {t("hero.secondary")}
            </Link>
          </div>
        </motion.header>

        <div id="converter" className="mt-32 scroll-mt-24">
          <Converter
            maxBytes={limit.maxBytes}
            canConsume={limit.canConsume}
            consumeOne={limit.consumeOne}
            onBlocked={(msg) => setModal({ open: true, msg })}
          />
        </div>

        <section className="mt-32 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {(t("hero.features", { returnObjects: true }) as { title: string; body: string }[]).map((b) => (
            <GlassCard
              key={b.title}
              title={b.title}
              className="hover:scale-[1.02]"
            >
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{b.body}</p>
            </GlassCard>
          ))}
        </section>

        <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link
            to="/limits"
            className="group relative"
          >
            <GlassCard className="h-full bg-gradient-to-b from-muted/30 to-transparent hover:scale-[1.02]">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                {t("nav.usage")}
              </p>
              <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {t("hero.usageCta.title")}
              </h3>
              <p className="mt-3 text-base font-medium text-muted-foreground">{t("hero.usageCta.body")}</p>
              <span className="mt-8 inline-block text-sm font-bold text-foreground/60 transition group-hover:text-foreground">
                {t("hero.usageCta.link")}
              </span>
            </GlassCard>
          </Link>
          <Link
            to="/pricing"
            className="group relative"
          >
            <GlassCard className="h-full bg-gradient-to-b from-muted/30 to-transparent hover:scale-[1.02]">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60">
                {t("nav.pricing")}
              </p>
              <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {t("hero.pricingCta.title")}
              </h3>
              <p className="mt-3 text-base font-medium text-muted-foreground">{t("hero.pricingCta.body")}</p>
              <span className="mt-8 inline-block text-sm font-bold text-foreground/60 transition group-hover:text-foreground">
                {t("hero.pricingCta.link")}
              </span>
            </GlassCard>
          </Link>
        </section>
      </main>

      <Footer />

      <LimitModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        onUpgrade={() => {
          setModal({ open: false });
          window.location.href = "/pricing";
        }}
        message={modal.msg}
      />
    </div>
  );
}
