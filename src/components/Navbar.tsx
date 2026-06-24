import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import { AuthModal } from "./AuthModal";
import { AccountPanel } from "./AccountPanel";

const LINKS: { to: "/" | "/pricing" | "/limits" | "/about" | "/security" | "/help"; label: string }[] = [
  { to: "/", label: "Dönüştürücü" },
  { to: "/pricing", label: "Fiyatlandırma" },
  { to: "/limits", label: "Kullanım" },
  { to: "/security", label: "Güvenlik" },
  { to: "/help", label: "Yardım" },
  { to: "/about", label: "Hakkımızda" },
];

export function Navbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ mode?: "signin" | "signup" }>).detail;
      setAuthMode(detail?.mode ?? "signin");
    };
    window.addEventListener("auth:open", onOpen);
    return () => window.removeEventListener("auth:open", onOpen);
  }, []);


  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-white to-white/60 text-black">
              <span className="text-[13px] font-bold tracking-tight">i</span>
            </div>
            <span className="text-sm font-medium tracking-tight">
              iFlexi<span className="text-white/40">.com</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: true }}
                className="text-xs text-white/60 transition hover:text-white data-[status=active]:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <button
                onClick={() => setAccountOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-white/30 to-white/10 text-sm font-semibold text-white transition hover:from-white/40"
                aria-label="Hesabım"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setAuthMode("signin")}
                  className="text-xs text-white/70 transition hover:text-white"
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setAuthMode("signup")}
                  className="rounded-full bg-[#0071e3] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#0077ed]"
                >
                  Kayıt Ol
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-md p-2 text-white/70 md:hidden"
            aria-label="Menü"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-white/10 bg-black/90 backdrop-blur-md md:hidden"
            >
              <div className="space-y-1 px-5 py-4">
                {LINKS.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
                  {user ? (
                    <button
                      onClick={() => {
                        setAccountOpen(true);
                        setMobileOpen(false);
                      }}
                      className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/80"
                    >
                      Hesabım
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setAuthMode("signin");
                          setMobileOpen(false);
                        }}
                        className="flex-1 rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/80"
                      >
                        Giriş Yap
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode("signup");
                          setMobileOpen(false);
                        }}
                        className="flex-1 rounded-full bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white"
                      >
                        Kayıt Ol
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
      <AccountPanel open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
