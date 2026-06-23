import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "SSS — iFlexi" },
      { name: "description", content: "iFlexi hakkında sıkça sorulan sorular: gizlilik, limitler, formatlar ve fatura." },
      { property: "og:title", content: "SSS — iFlexi" },
      { property: "og:description", content: "Sıkça sorulan sorular." },
    ],
  }),
  component: FaqPage,
});

const FAQS = [
  { q: "Dosyalarım sunucuya yüklenir mi?", a: "Hayır. Tüm dönüşüm tarayıcınızda Canvas API üzerinden çalışır. Hiçbir bayt cihazınızdan çıkmaz." },
  { q: "Haftalık limit ne zaman yenilenir?", a: "İlk dönüşümünüzden tam 7 gün sonra otomatik olarak sıfırlanır. Sayaç haftalık kullanım sayfanızda canlı görünür." },
  { q: "Hangi formatlar destekleniyor?", a: "PNG, JPG ve WEBP arasında çift yönlü dönüşüm yapabilirsiniz. Yakında HEIC ve AVIF eklenecek." },
  { q: "Toplu dönüştürme limiti var mı?", a: "Aynı anda yükleyebileceğiniz dosya sayısı, kalan haftalık limitiniz kadardır. Tek seferde 200 dosyaya kadar işleyebilirsiniz." },
  { q: "Pro denemesi otomatik ücretlendirir mi?", a: "Hayır. 14 günlük deneme süresince kart bilgisi istemiyoruz ve otomatik yenileme yok." },
  { q: "Verilerimi nasıl silerim?", a: "Tarayıcı önbelleğinizi temizlemeniz yeterli. Sunucumuzda dosyanıza ait hiçbir kayıt bulunmaz." },
  { q: "Mobil cihazda çalışır mı?", a: "Evet. iFlexi tamamen tarayıcı tabanlıdır ve modern mobil tarayıcılarda sorunsuz çalışır." },
  { q: "Kurumsal lisans var mı?", a: "Evet. press@iflexi.com adresinden bizimle iletişime geçebilirsiniz." },
];

function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <PageShell
      eyebrow="SSS"
      title={<>Cevaplar,<br /><span className="text-white/50">net ve kısa.</span></>}
      max="max-w-3xl"
    >
      <div className="overflow-hidden rounded-2xl border border-white/10">
        {FAQS.map((f, i) => (
          <div key={f.q} className="border-b border-white/5 last:border-b-0 bg-white/[0.02]">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.03]"
            >
              <span className="text-sm font-medium text-white">{f.q}</span>
              <span className={`text-xl text-white/40 transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm leading-relaxed text-white/60">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
