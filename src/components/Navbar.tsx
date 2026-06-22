import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { AuthModal } from "./AuthModal";
import { AccountPanel } from "./AccountPanel";

const LINKS = [
  { href: "#converter", label: "Dönüştürücü" },
  { href: "#pricing", label: "Fiyatlandırma" },
  { href: "#limits", label: "Kullanım Sınırı" },
];

export function Navbar() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup" | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#" className="flex shrink-0 items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-md bg-white text-black">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 4a5 5 0 00-3.8 1.7A5 5 0 008 9c0 4.5 4 9 4 9s4-4.5 4-9a5 5 0 001-5z" opacity=".6" />
                <circle cx="12" cy="9" r="3" />
              </svg>
            </div>
            <span className="text-sm font-medium tracking-tight">
              Convert<span className="text-white/40">.Apple</span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs text-white/60 transition hover:text-white"
              >
                {l.label}
              </a>
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
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5"
                  >
                    {l.label}
                  </a>
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
