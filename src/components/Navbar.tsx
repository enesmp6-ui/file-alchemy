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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const LINKS = [
    { to: "/pricing", label: "Fiyatlandırma" },
    { to: "/limits", label: "Kullanım" },
    { to: "/about", label: "Hakkımızda" },
    { to: "/", label: "Destek" },
  ];

  const otherLocale: Locale = locale === "en" ? "tr" : "en";

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"}`}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 sm:px-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-black text-lg">i</span>
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">iFlexi</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                to={l.to as any}
                className="text-[13px] font-bold text-zinc-400 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <button 
              onClick={() => setLocale(otherLocale)}
              className="text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
              {locale.toUpperCase()}
            </button>
            {user ? (
              <button
                onClick={() => navigate({ to: "/account" })}
                className="nocteria-btn-primary !py-2.5 !px-6 !text-xs"
              >
                Panel
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setAuthMode("signin")}
                  className="text-[13px] font-bold text-zinc-400 hover:text-white transition-colors"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="nocteria-btn-primary !py-2.5 !px-6 !text-xs"
                >
                  Kayıt Ol
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 top-full bg-black border-b border-white/5 p-6 lg:hidden"
            >
              <div className="flex flex-col gap-6">
                {LINKS.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to as any}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-bold text-zinc-400"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="h-px bg-white/5" />
                <button onClick={() => { setAuthMode("signin"); setMobileOpen(false); }} className="text-left text-lg font-bold">Giriş Yap</button>
                <button onClick={() => { setAuthMode("signup"); setMobileOpen(false); }} className="nocteria-btn-primary w-full">Kayıt Ol</button>
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
