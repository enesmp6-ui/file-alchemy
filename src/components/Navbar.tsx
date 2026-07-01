import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sun, Moon, Menu as MenuIcon, X as CloseIcon, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { useI18n, type Locale } from "@/lib/I18nContext";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
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

  const LINKS: { to: "/" | "/pricing" | "/limits" | "/security" | "/help" | "/about"; label: string }[] = [
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
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-background/80 border-b border-border/40 backdrop-blur-xl py-3" : "bg-transparent py-6"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 sm:px-10">
          <Link to="/" className="group flex items-center gap-3" aria-label="iFlexi">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-foreground text-background transition-transform group-hover:scale-105">
              <div className="absolute inset-0 bg-brand animate-pulse opacity-20" />
              <div className="grid h-full w-full place-items-center">
                <span className="text-lg font-black tracking-tighter">i</span>
              </div>
            </div>
            <span className="text-lg font-extrabold tracking-tighter">
              iFlexi<span className="text-brand">.com</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand data-[status=active]:text-brand data-[status=active]:neon-text"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={() => setLocale(otherLocale)}
              className="rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            >
              {locale.toUpperCase()}
            </button>
            
            <div className="h-4 w-px bg-border/40 mx-2" />
            
            {user ? (
              <button
                onClick={() => navigate({ to: "/account" })}
                className="flex items-center gap-3 rounded-xl bg-card/50 border border-border/40 px-2 py-1.5 pr-4 text-xs font-bold text-foreground transition hover:border-brand/40 hover:bg-card"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-[10px] font-black text-background">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[8rem] truncate">{user.name}</span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAuthMode("signin")}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
                >
                  {t("nav.signIn")}
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="rounded-xl bg-brand px-6 py-2.5 text-xs font-black uppercase tracking-widest text-background transition-all hover:scale-105 active:scale-95 neon-glow"
                >
                  {t("nav.signUp")}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl bg-card/50 border border-border/40 text-foreground transition hover:border-brand/40"
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
              className="absolute inset-x-0 top-full mt-2 mx-4 overflow-hidden rounded-2xl border border-border/40 bg-background/95 backdrop-blur-2xl md:hidden"
            >
              <div className="flex flex-col gap-2 p-6">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-widest text-foreground/80 transition active:scale-[0.98] hover:bg-white/5 hover:text-brand"
                  >
                    {l.label}
                    <span className="text-[10px] opacity-20">→</span>
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-3 border-t border-border/40 pt-6">
                  {user ? (
                    <Link
                      to="/account"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-3 rounded-xl bg-brand px-4 py-4 text-sm font-black uppercase tracking-widest text-background"
                    >
                      <UserIcon size={18} />
                      {t("nav.account")}
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => { setAuthMode("signin"); setMobileOpen(false); }}
                        className="rounded-xl border border-border/40 px-4 py-4 text-sm font-bold uppercase tracking-widest text-foreground"
                      >
                        {t("nav.signIn")}
                      </button>
                      <button
                        onClick={() => { setAuthMode("signup"); setMobileOpen(false); }}
                        className="rounded-xl bg-brand px-4 py-4 text-sm font-black uppercase tracking-widest text-background neon-glow"
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
