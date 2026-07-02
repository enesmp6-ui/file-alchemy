import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu as MenuIcon, X as CloseIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useI18n, type Locale } from "@/lib/I18nContext";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const { user } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const LINKS = [
    { to: "/", label: t("nav.converter") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/limits", label: t("nav.usage") },
    { to: "/about", label: t("nav.about") },
    { to: "/help", label: t("nav.help") },
  ];

  const otherLocale: Locale = locale === "en" ? "tr" : "en";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/70 backdrop-blur-2xl border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-12 max-w-[1024px] items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-1.5 text-[17px] font-normal tracking-tight">
            <span className="text-[#f5f5f7]">iFlexi</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to + l.label}
                to={l.to as any}
                className="text-[12px] font-normal text-[#f5f5f7]/80 transition-colors hover:text-[#f5f5f7]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 md:flex">
            <button
              onClick={() => setLocale(otherLocale)}
              className="text-[11px] font-normal uppercase tracking-widest text-[#86868b] hover:text-[#f5f5f7] transition-colors"
              aria-label={t("nav.language")}
            >
              {locale === "en" ? "TR" : "EN"}
            </button>
            {user ? (
              <button
                onClick={() => navigate({ to: "/account" })}
                className="text-[12px] font-normal text-[#f5f5f7]/80 hover:text-[#f5f5f7] transition-colors"
              >
                {t("nav.account")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAuthMode("signin")}
                  className="text-[12px] font-normal text-[#f5f5f7]/80 hover:text-[#f5f5f7] transition-colors"
                >
                  {t("nav.signIn")}
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[12px] font-normal text-white hover:bg-[#0077ed] transition-colors"
                >
                  {t("nav.signUp")}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden text-[#f5f5f7] p-1"
            aria-label={t("nav.menu")}
          >
            {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 top-full bg-black/95 backdrop-blur-2xl border-b border-white/[0.06] md:hidden"
            >
              <div className="flex flex-col px-6 py-6 gap-1">
                {LINKS.map((l) => (
                  <Link
                    key={l.to + l.label}
                    to={l.to as any}
                    onClick={() => setMobileOpen(false)}
                    className="py-3 text-[22px] font-light tracking-tight text-[#f5f5f7]"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="my-4 h-px bg-white/[0.06]" />
                {user ? (
                  <button
                    onClick={() => { setMobileOpen(false); navigate({ to: "/account" }); }}
                    className="py-3 text-left text-[18px] font-light text-[#f5f5f7]"
                  >
                    {t("nav.account")}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setAuthMode("signin"); setMobileOpen(false); }}
                      className="py-3 text-left text-[18px] font-light text-[#f5f5f7]"
                    >
                      {t("nav.signIn")}
                    </button>
                    <button
                      onClick={() => { setAuthMode("signup"); setMobileOpen(false); }}
                      className="mt-2 rounded-full bg-[#0071e3] py-3 text-[15px] font-normal text-white"
                    >
                      {t("nav.signUp")}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setLocale(otherLocale)}
                  className="mt-4 py-2 text-left text-[12px] uppercase tracking-widest text-[#86868b]"
                >
                  {locale === "en" ? "Türkçe" : "English"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal
        open={authMode !== null}
        mode={authMode ?? "signin"}
        onClose={() => setAuthMode(null)}
        onSwitch={(m) => setAuthMode(m)}
      />
    </>
  );
}
