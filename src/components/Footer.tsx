import { Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/I18nContext";

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

export function Footer() {
  const { locale, setLocale, t } = useI18n();
  const other: Locale = locale === "en" ? "tr" : "en";

  const COLUMNS: { title: string; links: { label: string; to: Known }[] }[] = [
    {
      title: t("footer.product"),
      links: [
        { label: t("nav.converter"), to: "/" },
        { label: t("nav.pricing"), to: "/pricing" },
        { label: t("nav.usage"), to: "/limits" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("nav.about"), to: "/about" },
        { label: "İletişim", to: "/contact" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("nav.help"), to: "/help" },
        { label: "Sistem Durumu", to: "/status" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: "Gizlilik", to: "/privacy" },
        { label: "Şartlar", to: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-10 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background transition-transform group-hover:scale-105">
                <span className="text-xl font-black tracking-tighter">i</span>
              </div>
              <span className="text-xl font-black tracking-tighter">
                iFlexi<span className="text-brand">.com</span>
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm font-medium leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <button
                onClick={() => setLocale(other)}
                className="rounded-lg bg-card/50 border border-border/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-foreground transition hover:border-brand/40"
              >
                {locale.toUpperCase()} / {other.toUpperCase()}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                  {col.title}
                </h4>
                <ul className="mt-6 space-y-4">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="text-sm font-medium text-foreground/60 transition hover:text-brand hover:translate-x-1 inline-block"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-6 border-t border-border/40 pt-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} iFlexi.com. {t("footer.rights")}</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Discord</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Instagram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
