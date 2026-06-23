import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, GlassCard } from "@/components/PageShell";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "İletişim — iFlexi" },
      { name: "description", content: "iFlexi ekibine ulaşın — destek, basın, iş birlikleri ve güvenlik bildirimleri." },
      { property: "og:title", content: "İletişim — iFlexi" },
      { property: "og:description", content: "İFlexi ekibine ulaşın." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <PageShell
      eyebrow="İletişim"
      title={<>Bir mesaj<br /><span className="text-white/50">uzaktayız.</span></>}
      subtitle="Sorularınız, geri bildirimleriniz veya iş birlikleri için bize yazın. 24 saat içinde dönüş yapıyoruz."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <GlassCard>
          {sent ? (
            <div className="py-10 text-center">
              <p className="text-2xl font-thin">Mesajınız alındı.</p>
              <p className="mt-3 text-sm text-white/60">En kısa sürede dönüş yapacağız.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-4"
            >
              <Field label="İsim" />
              <Field label="E-posta" type="email" />
              <Field label="Mesaj" textarea />
              <button className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
                Gönder
              </button>
            </form>
          )}
        </GlassCard>
        <div className="space-y-4">
          {[
            { t: "Destek", d: "support@iflexi.com", s: "Hesap, fatura ve teknik sorular" },
            { t: "Güvenlik", d: "security@iflexi.com", s: "Sorumlu açıklama programı" },
            { t: "Basın", d: "press@iflexi.com", s: "Marka kiti ve röportajlar" },
          ].map((c) => (
            <GlassCard key={c.t} title={c.t}>
              <p className="text-base text-white">{c.d}</p>
              <p className="mt-1 text-xs text-white/40">{c.s}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function Field({ label, type = "text", textarea = false }: { label: string; type?: string; textarea?: boolean }) {
  const cls =
    "mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#0071e3] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]";
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-white/40">{label}</span>
      {textarea ? <textarea rows={4} className={cls} /> : <input type={type} className={cls} />}
    </label>
  );
}
