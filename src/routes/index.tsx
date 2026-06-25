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
  const [modal, setModal] = useState<{ open: boolean; msg?: string }>({ open: false });

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
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            %100 tarayıcıda · sıfır yükleme
          </p>
          <h1 className="mt-7 text-5xl font-thin leading-[1.02] tracking-tight sm:text-7xl md:text-[7.5rem]">
            Dosyaların
            <br />
            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              cihazından çıkmaz.
            </span>
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
            Your files never leave your device. iFlexi, dönüşümü tamamen tarayıcında
            yapar; sıraya girmek, yüklemek, beklemek yok. Sürükle, bırak, indir.
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

        {/* Converter */}
        <div id="converter" className="mt-24 scroll-mt-24">
          <Converter
            maxBytes={limit.maxBytes}
            canConsume={limit.canConsume}
            consumeOne={limit.consumeOne}
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
              <p className="mt-2 text-sm text-white/60">{b.body}</p>
            </div>
          ))}
        </section>

        {/* Section links — Apple style */}
        <section className="mt-28 grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link
            to="/limits"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-10"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Kullanım Sınırı</p>
            <h3 className="mt-3 text-3xl font-thin tracking-tight sm:text-4xl">
              Haftan, tek bakışta.
            </h3>
            <p className="mt-3 text-sm text-white/60">Canlı sayaç, ferah panel.</p>
            <span className="mt-6 inline-block text-sm text-white/80 transition group-hover:text-white">
              Paneli aç →
            </span>
          </Link>
          <Link
            to="/pricing"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-10"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Planlar</p>
            <h3 className="mt-3 text-3xl font-thin tracking-tight sm:text-4xl">
              Sade fiyat. Net değer.
            </h3>
            <p className="mt-3 text-sm text-white/60">Misafir, Ücretsiz, Pro.</p>
            <span className="mt-6 inline-block text-sm text-white/80 transition group-hover:text-white">
              Planları karşılaştır →
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
