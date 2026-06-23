import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Kullanım Koşulları — iFlexi" },
      { name: "description", content: "iFlexi kullanım koşulları, hesap yükümlülükleri ve adil kullanım kuralları." },
      { property: "og:title", content: "Kullanım Koşulları — iFlexi" },
      { property: "og:description", content: "Kullanım koşulları." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <PageShell
      eyebrow="Yasal"
      title={<>Sade<br /><span className="text-white/50">koşullar.</span></>}
      max="max-w-3xl"
    >
      <article className="space-y-8 text-base leading-relaxed text-white/70">
        <Section title="1. Hizmet">
          iFlexi, tarayıcı tabanlı bir görüntü dönüştürme servisidir. Hizmeti olduğu gibi sunarız ve süreklilik için tüm makul çabayı gösteririz.
        </Section>
        <Section title="2. Hesabınız">
          Hesap bilgilerinizin güvenliğinden siz sorumlusunuz. Şüpheli bir aktivite halinde derhal bizi bilgilendirin.
        </Section>
        <Section title="3. Adil kullanım">
          Haftalık plan limitleri, herkes için akıcı bir deneyim sağlamak için belirlenmiştir. Otomatik araç ya da sızma denemeleri yasaktır.
        </Section>
        <Section title="4. Fikri mülkiyet">
          Yüklediğiniz görsellerin haklarının size ait olduğunu beyan edersiniz. iFlexi içeriğiniz üzerinde hak iddia etmez.
        </Section>
        <Section title="5. Sorumluluk">
          Servis, "olduğu gibi" sunulur. Veri kaybı veya dolaylı zararlardan iFlexi sorumlu tutulamaz.
        </Section>
        <Section title="6. Değişiklikler">
          Bu koşullar zaman zaman güncellenebilir. Önemli değişikliklerde e-posta ile bilgilendirme yapılır.
        </Section>
      </article>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}
