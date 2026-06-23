import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, GlassCard } from "@/components/PageShell";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Yardım Merkezi — iFlexi" },
      { name: "description", content: "iFlexi kullanım rehberleri, sorun giderme ve kısa yollar." },
      { property: "og:title", content: "Yardım Merkezi — iFlexi" },
      { property: "og:description", content: "Kullanım rehberleri ve sorun giderme." },
    ],
  }),
  component: HelpPage,
});

const TOPICS = [
  { t: "Başlangıç", d: "İlk dönüşümünüzü 30 saniyede tamamlayın." },
  { t: "Format kılavuzu", d: "PNG, JPG, WEBP arasında ne zaman hangisini seçmeli." },
  { t: "Kalite kaydırıcısı", d: "%80 — gözle görülmeyen kayıp, gözle görülen boyut tasarrufu." },
  { t: "Toplu ZIP indirme", d: "Onlarca dosyayı tek paket olarak indirme." },
  { t: "Limit yönetimi", d: "Haftalık bütçenizi takip etme ve genişletme." },
  { t: "Hesap & gizlilik", d: "Çıkış yapma, hesap silme ve veri kontrolü." },
];

function HelpPage() {
  return (
    <PageShell
      eyebrow="Yardım Merkezi"
      title={<>Her şey<br /><span className="text-white/50">elinizin altında.</span></>}
      subtitle="Arama yapmak yerine doğrudan kart seçin. Cevaplar kısa, görsel ve uygulanabilir."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((c) => (
          <GlassCard key={c.t} title={c.t}>
            <p>{c.d}</p>
            <Link to="/faq" className="mt-4 inline-block text-xs text-[#0071e3] transition hover:text-[#3a93f0]">
              Detaylı bak →
            </Link>
          </GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
