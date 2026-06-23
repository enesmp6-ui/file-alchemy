import { Link } from "@tanstack/react-router";

type Known =
  | "/"
  | "/pricing"
  | "/limits"
  | "/about"
  | "/security"
  | "/contact"
  | "/help"
  | "/faq"
  | "/status"
  | "/privacy"
  | "/terms"
  | "/cookies";

const COLUMNS: { title: string; links: { label: string; to: Known }[] }[] = [
  {
    title: "Ürün",
    links: [
      { label: "Dönüştürücü", to: "/" },
      { label: "Fiyatlandırma", to: "/pricing" },
      { label: "Kullanım Sınırı", to: "/limits" },
      { label: "Güvenlik", to: "/security" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { label: "Hakkımızda", to: "/about" },
      { label: "İletişim", to: "/contact" },
    ],
  },
  {
    title: "Kaynaklar",
    links: [
      { label: "Yardım Merkezi", to: "/help" },
      { label: "SSS", to: "/faq" },
      { label: "Sistem Durumu", to: "/status" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { label: "Gizlilik", to: "/privacy" },
      { label: "Kullanım Koşulları", to: "/terms" },
      { label: "Çerezler", to: "/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-white to-white/60 text-black">
            <span className="text-[13px] font-bold tracking-tight">i</span>
          </div>
          <span className="text-sm font-medium tracking-tight">
            iFlexi<span className="text-white/40">.com</span>
          </span>
        </div>
        <p className="mt-5 max-w-md text-sm text-white/50">
          Tüm dönüşümler senin cihazında. Görsellerin asla buluta gitmez,
          başka bir göz tarafından görülmez.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/5 pt-10 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-medium uppercase tracking-widest text-white/40">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/70 transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} iFlexi.com. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacy" className="text-[11px] text-white/40 transition hover:text-white">
              Gizlilik
            </Link>
            <Link to="/terms" className="text-[11px] text-white/40 transition hover:text-white">
              Koşullar
            </Link>
            <Link to="/cookies" className="text-[11px] text-white/40 transition hover:text-white">
              Çerezler
            </Link>
            <span>Türkiye</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
