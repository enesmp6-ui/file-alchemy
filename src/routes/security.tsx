import { createFileRoute } from "@tanstack/react-router";
import { PageShell, GlassCard } from "@/components/PageShell";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Güvenlik — iFlexi" },
      { name: "description", content: "iFlexi'nin sıfır-güven mimarisi: dosyalarınız asla cihazınızı terk etmez." },
      { property: "og:title", content: "Güvenlik — iFlexi" },
      { property: "og:description", content: "Sıfır-güven mimarisi, sıfır sunucu yüklemesi." },
    ],
  }),
  component: SecurityPage,
});

const PILLARS = [
  { t: "Sıfır sunucu yüklemesi", d: "Tüm dönüşüm Canvas API ile tarayıcınızda. Bir bayt bile dışarı çıkmaz." },
  { t: "Bellekte çalışır, diske yazılmaz", d: "Dosyalarınız işleme bitince RAM'den temizlenir; geçici klasör yok." },
  { t: "Üçüncü taraf yok", d: "Reklam ağı, analytics piksel veya CDN üzerinden bağımlılık taşımıyoruz." },
  { t: "Açık kaynak motor", d: "Dönüşüm hattı uçtan uca denetlenebilir; sürpriz gönderim yok." },
  { t: "TLS ve HSTS", d: "Site iletişimi 1.3 üzerinden şifrelenir; HSTS preload listesindeyiz." },
  { t: "Sorumlu açıklama", d: "Güvenlik araştırmacıları security@iflexi.com adresinden bize ulaşabilir." },
];

function SecurityPage() {
  return (
    <PageShell
      eyebrow="Güvenlik"
      title={<>Veriniz<br /><span className="text-white/50">cihazınızda kalır.</span></>}
      subtitle="iFlexi, dosyalarınızın güvenliği için 'asla yüklenmesin' ilkesini benimser. Yüklenmeyen bir dosya, sızdırılamaz."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((p) => (
          <GlassCard key={p.t} title={p.t}>{p.d}</GlassCard>
        ))}
      </div>
    </PageShell>
  );
}
