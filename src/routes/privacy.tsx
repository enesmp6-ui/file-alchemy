import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Gizlilik Politikası — iFlexi" },
      { name: "description", content: "iFlexi gizlilik politikası: hangi verileri topluyoruz, hangilerini toplamıyoruz." },
      { property: "og:title", content: "Gizlilik Politikası — iFlexi" },
      { property: "og:description", content: "iFlexi gizlilik politikası." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Gizlilik"
      title={<>Toplamadığımız<br /><span className="text-white/50">veriler önemlidir.</span></>}
      max="max-w-3xl"
    >
      <article className="space-y-8 text-base leading-relaxed text-white/70">
        <Section title="Dosyalarınız">
          Yüklediğiniz görseller cihazınızdan asla çıkmaz. Sunucularımıza tek bir bayt aktarılmaz.
        </Section>
        <Section title="Hesap bilgileri">
          E-posta ve isim gibi temel bilgiler, hesabınızı yönetmek için saklanır. Üçüncü taraflarla paylaşılmaz.
        </Section>
        <Section title="Çerezler">
          Yalnızca oturum yönetimi ve dil tercihi için zorunlu çerezler kullanırız. Reklam veya izleme çerezi yoktur.
        </Section>
        <Section title="Analitik">
          Tüm sayfa görüntülemeleri anonim, IP'siz ve sunucu tarafında özet olarak işlenir. Birey takibi yapmıyoruz.
        </Section>
        <Section title="Haklarınız">
          KVKK ve GDPR kapsamındaki tüm haklarınızı support@iflexi.com adresine yazarak kullanabilirsiniz.
        </Section>
        <p className="text-sm text-white/40">Son güncelleme: 23 Haziran 2026</p>
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
