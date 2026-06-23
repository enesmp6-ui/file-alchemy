import { createFileRoute } from "@tanstack/react-router";
import { PageShell, GlassCard } from "@/components/PageShell";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Çerez Politikası — iFlexi" },
      { name: "description", content: "iFlexi sadece zorunlu çerezleri kullanır. İzleme ve reklam çerezi yoktur." },
      { property: "og:title", content: "Çerez Politikası — iFlexi" },
      { property: "og:description", content: "Çerez politikamız." },
    ],
  }),
  component: CookiesPage,
});

const COOKIES = [
  { n: "session", t: "Zorunlu", d: "Oturumunuzu açık tutar.", e: "Oturum süresi" },
  { n: "wlimit:v1", t: "İşlevsel", d: "Haftalık dönüşüm bütçenizi takip eder.", e: "7 gün" },
  { n: "wlimit:tier", t: "İşlevsel", d: "Aktif planınızı hatırlar.", e: "Kalıcı" },
  { n: "lang", t: "Tercih", d: "Dil tercihinizi saklar.", e: "1 yıl" },
];

function CookiesPage() {
  return (
    <PageShell
      eyebrow="Çerezler"
      title={<>Sadece<br /><span className="text-white/50">gerekli olanlar.</span></>}
      subtitle="iFlexi reklam veya izleme çerezi kullanmaz. Aşağıdaki çerezler tamamen işlevseldir."
    >
      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-white/40">
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4">Ad</th>
                <th className="py-3 pr-4">Tür</th>
                <th className="py-3 pr-4">Amaç</th>
                <th className="py-3">Süre</th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              {COOKIES.map((c) => (
                <tr key={c.n} className="border-b border-white/5 last:border-b-0">
                  <td className="py-3 pr-4 font-mono text-xs text-white">{c.n}</td>
                  <td className="py-3 pr-4">{c.t}</td>
                  <td className="py-3 pr-4">{c.d}</td>
                  <td className="py-3 text-white/50">{c.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </PageShell>
  );
}
