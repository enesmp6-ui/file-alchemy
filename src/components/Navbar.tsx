import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu as MenuIcon, X as CloseIcon, User as UserIcon } from "lucide-react";
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

  const LINKS: { to: "/" | "/pricing" | "/limits" | "/about"; label: string }[] = [
    { to: "/", label: t("nav.converter") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/limits", label: t("nav.usage") },
    { to: "/about", label: t("nav.about") },
  ];

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ mode?: "signin" | "signup" }>).detail;
      setAuthMode(detail?.mode ?? "signin");
    };
    window.addEventListener("auth:open", onOpen);
    return () => window.removeEventListener("auth:open", onOpen);
  }, []);

  const otherLocale: Locale = locale === "en" ? "tr" : "en";

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/80 border-b border-white/5 backdrop-blur-2xl py-4" : "bg-transparent py-8"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-10">
          <Link to="/" className="flex items-center gap-3 group" aria-label="iFlexi">
            <div className="h-10 w-10 overflow-hidden rounded-xl bg-white text-black transition-transform group-hover:scale-105">
              <div className="grid h-full w-full place-items-center">
                <span className="text-xl font-black tracking-tighter">i</span>
              </div>
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              iFlexi<span className="opacity-40">.com</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white data-[status=active]:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => setLocale(otherLocale)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-white"
            >
              {locale.toUpperCase()}
            </button>
            
            <div className="h-4 w-px bg-white/10" />
            
            {user ? (
              <button
                onClick={() => navigate({ to: "/account" })}
                className="flex items-center gap-3 rounded-full bg-white/5 border border-white/10 px-2 py-1.5 pr-5 text-xs font-bold text-white transition hover:bg-white/10"
              >
                <div className="grid h-8 w-8 place-items-center rounded-full bg-white text-[10px] font-black text-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[8rem] truncate">{user.name}</span>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAuthMode("signin")}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-white"
                >
                  {t("nav.signIn")}
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black transition-all hover:scale-105 active:scale-95"
                >
                  {t("nav.signUp")}
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 border border-white/10 text-white"
            >
              {mobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute inset-x-0 top-full mt-4 mx-4 overflow-hidden rounded-3xl border border-white/10 bg-black/95 backdrop-blur-3xl md:hidden"
            >
              <div className="flex flex-col gap-2 p-8">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-2xl px-5 py-5 text-sm font-bold uppercase tracking-widest text-zinc-400 transition active:scale-[0.98] hover:bg-white/5 hover:text-white"
                  >
                    {l.label}
                    <ArrowRight size={14} className="opacity-20" />
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-8">
                  {user ? (
                    <Link
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-3 rounded-2xl bg-white px-5 py-5 text-sm font-bold uppercase tracking-widest text-black"
                    >
                      <UserIcon size={18} />
                      {t("nav.account")}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => { setAuthMode("signin"); setMobileOpen(false); }}
                        className="rounded-2xl border border-white/10 px-5 py-5 text-sm font-bold uppercase tracking-widest text-white"
                      >
                        {t("nav.signIn")}
                      </button>
                      <button
                        onClick={() => { setAuthMode("signup"); setMobileOpen(false); }}
                        className="rounded-2xl bg-white px-5 py-5 text-sm font-bold uppercase tracking-widest text-black"
                      >
                        {t("nav.signUp")}
                      </button>
                    </>
                  )}
                </div>
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

function ArrowRight({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
