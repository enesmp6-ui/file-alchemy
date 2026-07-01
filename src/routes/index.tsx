import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useWeeklyLimit } from "@/lib/useWeeklyLimit";
import { Converter } from "@/components/Converter";
import { LimitModal } from "@/components/LimitModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useI18n } from "@/lib/I18nContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iFlexi — Nocteria Tarzı Modern Dönüştürücü" },
      {
        name: "description",
        content: "Dosyalarınızı tamamen tarayıcınızda, en hızlı ve modern şekilde dönüştürün.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const limit = useWeeklyLimit();
  const { t } = useI18n();
  const [modal, setModal] = useState<{ open: boolean; msg?: string }>({ open: false });

  return (
    <div className="min-h-screen bg-background text-foreground hero-gradient selection:bg-brand/30">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-32 sm:px-8 sm:pt-48">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-brand neon-glow"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            {t("hero.eyebrow")}
          </motion.div>
          
          <h1 className="mt-10 text-6xl font-extrabold leading-[1.1] tracking-tighter sm:text-8xl md:text-[7rem] lg:text-[8.5rem]">
            <span className="block">{t("hero.titleA")}</span>
            <span className="neon-text block mt-2">
              {t("hero.titleB")}
            </span>
          </h1>
          
          <p className="mx-auto mt-10 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground sm:text-xl">
            {t("hero.subtitle")}
          </p>
          
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            <a
              href="#converter"
              className="group relative overflow-hidden rounded-xl bg-brand px-10 py-5 text-sm font-bold text-background transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">{t("hero.primary")}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
            </a>
            <Link
              to="/pricing"
              className="rounded-xl border border-border bg-card/50 px-10 py-5 text-sm font-bold text-foreground transition-all hover:bg-card hover:border-brand/30 active:scale-95"
            >
              {t("hero.secondary")}
            </Link>
          </div>
        </motion.header>

        <motion.div 
          id="converter" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-48 scroll-mt-24"
        >
          <div className="nocteria-card p-6 sm:p-12 neon-glow">
            <Converter
              maxBytes={limit.maxBytes}
              canConsume={limit.canConsume}
              consumeOne={limit.consumeOne}
              onBlocked={(msg) => setModal({ open: true, msg })}
            />
          </div>
        </motion.div>

        <section className="mt-48 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {(t("hero.features", { returnObjects: true }) as { title: string; body: string }[]).map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="nocteria-card p-8"
            >
              <h3 className="text-xl font-bold tracking-tight text-foreground">{b.title}</h3>
              <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">{b.body}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          <Link to="/limits" className="group">
            <div className="nocteria-card h-full p-10 hover:border-brand/40">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand">
                {t("nav.usage")}
              </p>
              <h3 className="mt-6 text-4xl font-extrabold tracking-tight">
                {t("hero.usageCta.title")}
              </h3>
              <p className="mt-4 text-base font-medium text-muted-foreground">{t("hero.usageCta.body")}</p>
              <div className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                {t("hero.usageCta.link")}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
          <Link to="/pricing" className="group">
            <div className="nocteria-card h-full p-10 hover:border-brand/40">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand">
                {t("nav.pricing")}
              </p>
              <h3 className="mt-6 text-4xl font-extrabold tracking-tight">
                {t("hero.pricingCta.title")}
              </h3>
              <p className="mt-4 text-base font-medium text-muted-foreground">{t("hero.pricingCta.body")}</p>
              <div className="mt-10 inline-flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                {t("hero.pricingCta.link")}
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
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
