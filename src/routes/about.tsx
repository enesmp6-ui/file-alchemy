import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell, GlassCard } from "@/components/PageShell";

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
    <PageShell
      eyebrow="Hakkımızda"
      title={<>Gizlilik,<br /><span className="text-muted-foreground">varsayılan.</span></>}
      max="max-w-4xl"
    >
      <article className="space-y-10 text-xl leading-relaxed text-muted-foreground">
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

      <section className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { k: "0", v: "Sunucuya gönderim" },
          { k: "100%", v: "Tarayıcıda işlem" },
          { k: "14 gün", v: "Pro deneme" },
        ].map((s) => (
          <GlassCard key={s.v} className="text-center">
            <p className="text-5xl font-bold tracking-tight text-foreground">{s.k}</p>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {s.v}
            </p>
          </GlassCard>
        ))}
      </section>

      <div className="mt-24 text-center">
        <Link
          to="/"
          className="inline-flex rounded-full bg-foreground px-10 py-4 text-sm font-bold text-background transition-all duration-300 hover:opacity-90 hover:scale-105"
        >
          Dönüştürmeye Başla
        </Link>
      </div>
    </PageShell>
  );
}
