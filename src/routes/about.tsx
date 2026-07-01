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
        content: "iFlexi, gizliliği merkeze koyan bir tarayıcı içi görüntü stüdyosudur. Hikâyemizi keşfet.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground hero-gradient">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 pt-32 pb-32 sm:px-8 sm:pt-48">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-brand neon-glow">
            Hakkımızda
          </div>
          <h1 className="mt-10 text-5xl font-black tracking-tighter uppercase sm:text-7xl md:text-8xl">
            Gizlilik,
            <span className="neon-text block mt-2">varsayılan.</span>
          </h1>
        </motion.header>

        <article className="mt-24 space-y-12 text-xl font-medium leading-relaxed text-muted-foreground text-center">
          <p>
            iFlexi, dosyalarınla buluta yolculuk etmeyen, sadece senin
            cihazında çalışan bir görüntü stüdyosudur. Her dönüşüm Canvas API
            üzerinde, sıfır gecikmeyle, sıfır sızıntıyla gerçekleşir.
          </p>
          <p>
            Modern tasarım disiplinine inanıyoruz: az ama özenle. 
            Karmaşık menüler yok, sadece hız ve kalite var.
          </p>
          <p>
            Adil kullanım için üç farklı seviye sunuyoruz. Misafir olarak deneyebilir, 
            ücretsiz üye olarak limitlerini artırabilir veya Pro ile sınırlara meydan okuyabilirsin.
          </p>
        </article>

        <section className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { k: "0", v: "Sunucuya gönderim" },
            { k: "100%", v: "Tarayıcıda işlem" },
            { k: "∞", v: "Gizlilik Garantisi" },
          ].map((s, i) => (
            <motion.div 
              key={s.v} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="nocteria-card p-10 text-center"
            >
              <p className="text-5xl font-black tracking-tighter text-foreground">{s.k}</p>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-brand">
                {s.v}
              </p>
            </motion.div>
          ))}
        </section>

        <div className="mt-32 text-center">
          <Link
            to="/"
            className="inline-flex rounded-xl bg-brand px-12 py-5 text-sm font-black uppercase tracking-widest text-background transition-all hover:scale-105 active:scale-95 neon-glow"
          >
            Dönüştürmeye Başla
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
