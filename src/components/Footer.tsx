import { Link } from "@tanstack/react-router";

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: "Ürün",
    links: [
      { label: "Dönüştürücü", to: "/" },
      { label: "Fiyatlandırma", to: "/pricing" },
      { label: "Kullanım Sınırı", to: "/limits" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { label: "Hakkımızda", to: "/about" },
      { label: "Güvenlik", to: "/security" },
      { label: "İletişim", to: "/contact" },
    ],
  },
  {
    title: "Kaynaklar",
    links: [
      { label: "Yardım Merkezi", to: "/help" },
      { label: "SSS", to: "/faq" },
      { label: "Durum", to: "/status" },
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
        <p className="max-w-md text-sm text-white/50">
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
                    <FooterLink to={l.to}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 text-[11px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Convert.Apple. Tüm hakları saklıdır.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <FooterLink to="/privacy" small>
              Gizlilik Politikası
            </FooterLink>
            <FooterLink to="/terms" small>
              Kullanım Koşulları
            </FooterLink>
            <FooterLink to="/cookies" small>
              Çerezler
            </FooterLink>
            <span>Türkiye</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  to,
  children,
  small,
}: {
  to: string;
  children: React.ReactNode;
  small?: boolean;
}) {
  const cls = small
    ? "text-[11px] text-white/40 transition hover:text-white"
    : "text-sm text-white/70 transition hover:text-white";
  // Routes that exist as files — link via TanStack
  const known = ["/", "/pricing", "/limits", "/about"];
  if (known.includes(to)) {
    return (
      <Link to={to as "/" | "/pricing" | "/limits" | "/about"} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={to} className={cls}>
      {children}
    </a>
  );
}
