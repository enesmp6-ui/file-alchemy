import { Link } from "@tanstack/react-router";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";
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
  const { theme, toggle } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const other: Locale = locale === "en" ? "tr" : "en";

  const COLUMNS: { title: string; links: { label: string; to: Known }[] }[] = [
    {
      title: t("footer.product"),
      links: [
        { label: t("nav.converter"), to: "/" },
        { label: t("nav.pricing"), to: "/pricing" },
        { label: t("nav.usage"), to: "/limits" },
        { label: t("nav.security"), to: "/security" },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { label: t("nav.about"), to: "/about" },
        { label: "Contact", to: "/contact" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("nav.help"), to: "/help" },
        { label: "FAQ", to: "/faq" },
        { label: "Status", to: "/status" },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
        { label: "Cookies", to: "/cookies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
            <span className="text-[13px] font-bold tracking-tight">i</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            iFlexi<span className="text-muted-foreground">.com</span>
          </span>
        </div>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t("footer.tagline")}
        </p>

        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border pt-10 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-foreground/80 transition hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} iFlexi.com. {t("footer.rights")}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocale(other)}
              className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground transition hover:bg-muted"
            >
              {locale.toUpperCase()} · {other.toUpperCase()}
            </button>
            <button
              onClick={toggle}
              className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("nav.theme")}
            >
              {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
