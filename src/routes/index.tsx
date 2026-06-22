import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { useWeeklyLimit } from "@/lib/useWeeklyLimit";
import { Converter } from "@/components/Converter";
import { LimitModal } from "@/components/LimitModal";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Convert.Apple — Tarayıcında Dönüştür, Sıkıştır, Güvende Kal" },
      {
        name: "description",
        content:
          "PNG, JPG ve WEBP arasında dönüşüm. Her şey senin cihazında olur — dosyaların asla buluta yüklenmez.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const limit = useWeeklyLimit();
  const [modal, setModal] = useState<{ open: boolean; msg?: string }>({ open: false });
  const percent = Math.min(100, (limit.used / limit.config.weekly) * 100);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 pt-32 pb-32 sm:px-8 sm:pt-40">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Tarayıcı tabanlı görüntü stüdyosu
          </p>
          <h1 className="mt-6 text-5xl font-thin leading-[1.02] tracking-tight sm:text-7xl md:text-[7rem]">
            Saniyeler içinde
            <br />
            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              dönüştür.
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sürükle, bırak, indir. PNG, JPG ve WEBP arasında geçiş yap;
            kaliteyi sen seç, boyutu biz küçültelim. Tek bir baytın bile
            cihazından çıkmadığını bilmenin huzuruyla.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#converter"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Dönüştürmeye Başla
            </a>
            <Link
              to="/pricing"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
            >
              Planları Gör
            </Link>
          </div>
        </motion.header>

        {/* Mini dashboard summary */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 glass-card p-6 sm:p-8"
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-white/40">
                {limit.config.label}
              </p>
              <p className="mt-1 truncate text-xl font-semibold sm:text-2xl">
                Bu hafta {limit.used} / {limit.config.weekly} dönüşüm
              </p>
            </div>
            <Link
              to="/limits"
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs text-white/80 transition hover:bg-white/5"
            >
              Detay
            </Link>
          </div>
          <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-white to-white/40"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
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

        {/* Quality strip */}
        <section className="mt-28 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              title: "Buluta sıfır gönderim.",
              body: "Dönüşüm Canvas API ile cihazında olur. Görsellerin senin yanından ayrılmaz.",
            },
            {
              title: "Sinematik ince ayar.",
              body: "Kalite kaydırıcısıyla her formatı milimetrik kontrol et; gerçek zamanlı boyut karşılaştırması.",
            },
            {
              title: "Topla, tek tık ZIP.",
              body: "Onlarca dosyayı sıkıştır, tek bir paket olarak indir. Klasör düzenin sende kalır.",
            },
          ].map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <h3 className="text-lg font-semibold tracking-tight">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </section>

        {/* CTA → pricing page */}
        <section className="mt-28 text-center">
          <h2 className="text-4xl font-thin tracking-tight sm:text-6xl">
            Hız sende.
            <br />
            <span className="text-white/50">Plan bizde.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-muted-foreground">
            İhtiyacın büyüdükçe planın da büyür. Üç adım, sıfır sürpriz.
          </p>
          <Link
            to="/pricing"
            className="mt-10 inline-flex rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Planları Karşılaştır
          </Link>
        </section>
      </main>

      <Footer />

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
