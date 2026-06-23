import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — iFlexi" },
      {
        name: "description",
        content:
          "iFlexi, gizliliği merkeze koyan bir tarayıcı içi görüntü stüdyosudur. Hikâyemizi keşfet.",
      },
      { property: "og:title", content: "Hakkımızda — iFlexi" },
      {
        property: "og:description",
        content: "Gizliliği merkeze koyan tarayıcı içi görüntü stüdyosu.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-5 pt-32 pb-32 sm:px-8 sm:pt-40">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
            Hakkımızda
          </p>
          <h1 className="mt-6 text-5xl font-thin leading-[1.05] tracking-tight sm:text-7xl">
            Gizlilik,
            <br />
            <span className="text-white/50">varsayılan.</span>
          </h1>
        </motion.header>

        <article className="mt-16 space-y-8 text-lg leading-relaxed text-white/80">
          <p>
            iFlexi, dosyalarınla buluta yolculuk etmeyen, sadece senin
            cihazında çalışan bir görüntü stüdyosudur. Her dönüşüm Canvas API
            üzerinde, sıfır gecikmeyle, sıfır sızıntıyla gerçekleşir.
          </p>
          <p>
            Apple'ın yıllardır savunduğu o sade tasarım disiplinine inanıyoruz:
            az ama özenle. Bir kaydırıcı, bir buton, bir indirme. Aradan çıkmak
            için tasarlandık.
          </p>
          <p>
            Üç tier — Misafir, Ücretsiz Üye, Pro — adil kullanım için var.
            Pro denemesi 14 gün, kart bilgisi istemez, otomatik yenilenmez.
          </p>
        </article>

        <section className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { k: "0", v: "Sunucuya gönderim" },
            { k: "100%", v: "Tarayıcıda işlem" },
            { k: "14 gün", v: "Pro deneme" },
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center"
            >
              <p className="text-4xl font-thin tracking-tight">{s.k}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
                {s.v}
              </p>
            </div>
          ))}
        </section>

        <div className="mt-20 text-center">
          <Link
            to="/"
            className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Dönüştürmeye Başla
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
