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
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-32 sm:px-8 sm:pt-40">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-7xl md:text-[6.5rem]">
            {t("hero.titleA")}
            <br />
            <span className="bg-gradient-to-b from-foreground to-foreground/40 bg-clip-text text-transparent">
              {t("hero.titleB")}
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#converter"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {t("hero.primary")}
            </a>
            <Link
              to="/pricing"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {t("hero.secondary")}
            </Link>
          </div>
        </motion.header>

        <div id="converter" className="mt-24 scroll-mt-24">
          <Converter
            maxBytes={limit.maxBytes}
            canConsume={limit.canConsume}
            consumeOne={limit.consumeOne}
            onBlocked={(msg) => setModal({ open: true, msg })}
          />
        </div>

        <section className="mt-28 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              title: "Zero cloud upload",
              body: "Conversion happens locally via the Canvas API. Your files never leave your device.",
            },
            {
              title: "Cinematic fine-tuning",
              body: "Dial in quality with millimetric precision and watch file size update in real time.",
            },
            {
              title: "Batch · one-click ZIP",
              body: "Compress dozens of files into one neat package — your folder structure stays yours.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold tracking-tight">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-28 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link
            to="/limits"
            className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/60 to-transparent p-10 transition hover:bg-muted/30"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("nav.usage")}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Your week, at a glance.
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">Live counter, breathing room.</p>
            <span className="mt-6 inline-block text-sm font-medium text-foreground/80 transition group-hover:text-foreground">
              Open panel →
            </span>
          </Link>
          <Link
            to="/pricing"
            className="group relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-muted/60 to-transparent p-10 transition hover:bg-muted/30"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {t("nav.pricing")}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Simple pricing. Clear value.
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">Guest · Free · Pro.</p>
            <span className="mt-6 inline-block text-sm font-medium text-foreground/80 transition group-hover:text-foreground">
              Compare plans →
            </span>
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
