import { Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/I18nContext";

export function Footer() {
  const { locale, setLocale, t } = useI18n();
  const other: Locale = locale === "en" ? "tr" : "en";
  const year = new Date().getFullYear();

  const sections = [
    {
      title: t("footer.product"),
      links: [
        { to: "/", label: t("nav.converter") },
        { to: "/pricing", label: t("nav.pricing") },
        { to: "/limits", label: t("nav.usage") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { to: "/about", label: t("nav.about") },
        { to: "/contact", label: "Contact" },
        { to: "/status", label: "Status" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { to: "/help", label: t("nav.help") },
        { to: "/faq", label: "FAQ" },
        { to: "/security", label: t("nav.security") },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { to: "/privacy", label: "Privacy" },
        { to: "/terms", label: "Terms" },
        { to: "/cookies", label: "Cookies" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-black">
      <div className="mx-auto max-w-[1024px] px-6 py-16">
        <p className="max-w-md text-[12px] leading-relaxed text-[#86868b]">
          {t("footer.tagline")}
        </p>

        <div className="mt-12 grid grid-cols-2 gap-10 sm:grid-cols-4">
          {sections.map((s) => (
            <div key={s.title}>
              <h4 className="text-[12px] font-normal text-[#f5f5f7]">{s.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link
                      to={l.to as any}
                      className="text-[12px] font-light text-[#86868b] hover:text-[#f5f5f7] transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] font-light text-[#6e6e73]">
            Copyright © {year} iFlexi. {t("footer.rights")}
          </p>
          <button
            onClick={() => setLocale(other)}
            className="text-[12px] font-light text-[#86868b] hover:text-[#f5f5f7] transition-colors self-start sm:self-auto"
          >
            {locale === "en" ? "United States (English)" : "Türkiye (Türkçe)"} · {other.toUpperCase()}
          </button>
        </div>
      </div>
    </footer>
  );
}
