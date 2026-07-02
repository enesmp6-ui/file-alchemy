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
      { title: "iFlexi — Convert files privately in your browser." },
      {
        name: "description",
        content:
          "iFlexi converts images and documents entirely in your browser. No uploads, no queues, no waiting.",
      },
      { property: "og:title", content: "iFlexi — Convert files privately." },
      { property: "og:description", content: "Convert in your browser. Nothing leaves your device." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
};

function Index() {
  const limit = useWeeklyLimit();
  const { t } = useI18n();
  const [modal, setModal] = useState<{ open: boolean; msg?: string }>({ open: false });

  const features = (t("hero.features") as Array<{ title: string; body: string }>) ?? [];

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7]">
      <Navbar />

      <main className="relative">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 hero-spotlight pointer-events-none" />
          <div className="mx-auto max-w-[980px] px-6 pt-32 pb-24 sm:pt-44 sm:pb-32 text-center">
            <motion.p {...fadeUp} className="eyebrow">
              {t("hero.eyebrow")}
            </motion.p>
            <motion.h1
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
              className="display-hero mt-4"
            >
              {t("hero.titleA")}
              <br />
              <span className="text-[#86868b]">{t("hero.titleB")}</span>
            </motion.h1>
            <motion.p
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.1 }}
              className="body-lead mx-auto mt-6 max-w-2xl"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.15 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <a href="#converter" className="btn-apple">
                {t("hero.primary")}
              </a>
              <Link to="/pricing" className="link-apple">
                {t("hero.secondary")} ›
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Converter card */}
        <section id="converter" className="mx-auto max-w-[1024px] px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="surface-card overflow-hidden"
          >
            <div className="p-6 sm:p-10">
              <Converter
                maxBytes={limit.maxBytes}
                canConsume={limit.canConsume}
                consumeOne={limit.consumeOne}
                onBlocked={(msg) => setModal({ open: true, msg })}
              />
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-[1024px] px-6 py-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="display-md text-center"
          >
            {t("pricing.subtitle") ? t("hero.features") && "" : ""}
            {t("limits.title")}
          </motion.h2>

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.7, delay: i * 0.08 }}
                className="surface-card p-8"
              >
                <h3 className="text-[20px] font-normal tracking-tight text-[#f5f5f7]">
                  {f.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-[#86868b]">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Dual CTA */}
        <section className="mx-auto max-w-[1024px] px-6 py-24 grid gap-4 md:grid-cols-2">
          <Link to="/limits" className="surface-card p-10 group transition-colors hover:border-white/15">
            <p className="eyebrow">{t("nav.usage")}</p>
            <h3 className="display-md mt-3">{t("hero.usageCta.title")}</h3>
            <p className="mt-3 text-[14px] text-[#86868b]">{t("hero.usageCta.body")}</p>
            <span className="link-apple mt-6 inline-flex">{t("hero.usageCta.link")}</span>
          </Link>
          <Link to="/pricing" className="surface-card p-10 group transition-colors hover:border-white/15">
            <p className="eyebrow">{t("nav.pricing")}</p>
            <h3 className="display-md mt-3">{t("hero.pricingCta.title")}</h3>
            <p className="mt-3 text-[14px] text-[#86868b]">{t("hero.pricingCta.body")}</p>
            <span className="link-apple mt-6 inline-flex">{t("hero.pricingCta.link")}</span>
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
