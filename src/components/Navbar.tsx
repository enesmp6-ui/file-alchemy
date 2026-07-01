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

  const LINKS: { to: "/" | "/pricing" | "/limits" | "/security" | "/help" | "/about"; label: string }[] = [
    { to: "/", label: t("nav.converter") },
    { to: "/pricing", label: t("nav.pricing") },
    { to: "/limits", label: t("nav.usage") },
    { to: "/security", label: t("nav.security") },
    { to: "/help", label: t("nav.help") },
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
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="iFlexi">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
              <span className="text-[13px] font-bold tracking-tight">i</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              iFlexi<span className="text-muted-foreground">.com</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className="text-xs font-medium text-muted-foreground transition hover:text-foreground data-[status=active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1.5 md:flex">
            <button
              onClick={() => setLocale(otherLocale)}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("nav.language")}
            >
              {locale.toUpperCase()}
            </button>
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("nav.theme")}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <span className="mx-1 h-5 w-px bg-border" />
            {user ? (
              <button
                onClick={() => navigate({ to: "/account" })}
                className="flex items-center gap-2 rounded-full bg-muted px-1 py-1 pr-3 text-xs font-medium text-foreground transition hover:bg-accent"
                aria-label={t("nav.account")}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[8rem] truncate">{user.name}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAuthMode("signin")}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {t("nav.signIn")}
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background transition hover:opacity-90"
                >
                  {t("nav.signUp")}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted"
              aria-label={t("nav.theme")}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted"
              aria-label={t("nav.menu")}
            >
              {mobileOpen ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1 p-6">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl px-4 py-3.5 text-base font-semibold text-foreground/90 transition-all active:scale-[0.98] hover:bg-muted"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                  <button
                    onClick={() => setLocale(otherLocale)}
                    className="rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground"
                  >
                    {locale.toUpperCase()} → {otherLocale.toUpperCase()}
                  </button>
                </div>
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  {user ? (
                    <>
                      <Link
                        to="/account"
                        onClick={() => setMobileOpen(false)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-medium text-foreground"
                      >
                        <UserIcon size={14} />
                        {t("nav.account")}
                      </Link>
                      <button
                        onClick={() => {
                          void signOut();
                          setMobileOpen(false);
                        }}
                        className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground"
                      >
                        {t("nav.signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setAuthMode("signin");
                          setMobileOpen(false);
                        }}
                        className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-medium text-foreground"
                      >
                        {t("nav.signIn")}
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode("signup");
                          setMobileOpen(false);
                        }}
                        className="flex-1 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
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
