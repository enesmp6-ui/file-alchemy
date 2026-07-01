import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/I18nContext";

type Mode = "signin" | "signup";

export function AuthModal({
  open,
  mode,
  onClose,
  onSwitch,
}: {
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onSwitch: (m: Mode) => void;
}) {
  const { signInWithPassword, signUpWithPassword, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setName("");
    setPassword("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res =
      mode === "signin"
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password, name || undefined);
    setLoading(false);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (mode === "signup") {
      toast.success(t("auth.signupSuccess"));
    } else {
      toast.success(t("auth.signinSuccess"));
    }
    reset();
    onClose();
  };

  const onGoogle = async () => {
    setLoading(true);
    const res = await signInWithGoogle();
    setLoading(false);
    if (res.error) toast.error(res.error);
    else onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-background/90 backdrop-blur-2xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md nocteria-card p-10 neon-glow"
          >
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tighter uppercase">
                {mode === "signin" ? t("auth.signinTitle") : t("auth.signupTitle")}
              </h2>
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                {mode === "signin" ? t("auth.signinSubtitle") : t("auth.signupSubtitle")}
              </p>
            </div>

            <button
              type="button"
              onClick={onGoogle}
              disabled={loading}
              className="mt-10 flex w-full items-center justify-center gap-4 rounded-xl border border-border/40 bg-card/50 px-6 py-4 text-xs font-black uppercase tracking-widest text-foreground transition hover:border-brand/40 hover:bg-card disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.62 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.2 12 6.2c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.7 3.66 14.55 2.7 12 2.7 6.86 2.7 2.7 6.86 2.7 12s4.16 9.3 9.3 9.3c5.37 0 8.92-3.77 8.92-9.07 0-.6-.06-1.05-.15-1.13z"
                />
              </svg>
              {t("auth.google")}
            </button>

            <div className="my-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">
              <div className="h-px flex-1 bg-border/40" />
              {t("auth.or")}
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <AuthInput
                  label={t("auth.name")}
                  value={name}
                  onChange={setName}
                  placeholder={t("auth.namePlaceholder")}
                />
              )}
              <AuthInput
                label={t("auth.email")}
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="hello@nocteria.com"
                required
              />
              <AuthInput
                label={t("auth.password")}
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-brand px-6 py-4 text-xs font-black uppercase tracking-widest text-background transition-all hover:scale-[1.02] active:scale-95 neon-glow disabled:opacity-60"
              >
                {loading
                  ? t("auth.loading")
                  : mode === "signin"
                    ? t("auth.signinCta")
                    : t("auth.signupCta")}
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {mode === "signin" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
              <button
                onClick={() => onSwitch(mode === "signin" ? "signup" : "signin")}
                className="text-brand hover:neon-text transition-all"
              >
                {mode === "signin" ? t("auth.signupLink") : t("auth.signinLink")}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AuthInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 ml-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-xl border border-border/40 bg-card/30 px-5 py-3.5 text-sm text-foreground outline-none transition-all focus:border-brand/40 focus:bg-card/50 placeholder:text-muted-foreground/30"
      />
    </label>
  );
}
