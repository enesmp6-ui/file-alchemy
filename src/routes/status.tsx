import { createFileRoute } from "@tanstack/react-router";
import { PageShell, GlassCard } from "@/components/PageShell";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Sistem Durumu — iFlexi" },
      { name: "description", content: "iFlexi servislerinin canlı durumu ve uptime metrikleri." },
      { property: "og:title", content: "Sistem Durumu — iFlexi" },
      { property: "og:description", content: "Canlı sistem durumu." },
    ],
  }),
  component: StatusPage,
});

const SERVICES = [
  { n: "Dönüştürücü Motoru", s: "operational", up: 100 },
  { n: "Kimlik & Hesap", s: "operational", up: 99.99 },
  { n: "Web Uygulaması", s: "operational", up: 99.98 },
  { n: "Pazarlama & Sayfalar", s: "operational", up: 100 },
  { n: "Bildirim Servisi", s: "operational", up: 99.95 },
];

function StatusPage() {
  return (
    <PageShell
      eyebrow="Sistem Durumu"
      title={<>Tüm sistemler<br /><span className="text-emerald-400/80">çalışıyor.</span></>}
      subtitle="Son 90 günlük uptime metrikleri ve aktif olay yok."
    >
      <GlassCard>
        <ul className="divide-y divide-white/5">
          {SERVICES.map((sv) => (
            <li key={sv.n} className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="relative grid h-2.5 w-2.5 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/40" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm text-white">{sv.n}</span>
              </div>
              <span className="text-xs tabular-nums text-white/50">{sv.up}% · 90g</span>
            </li>
          ))}
        </ul>
      </GlassCard>
      <p className="mt-6 text-center text-xs text-white/40">
        Son güncelleme: {new Date().toLocaleString("tr-TR")}
      </p>
    </PageShell>
  );
}
