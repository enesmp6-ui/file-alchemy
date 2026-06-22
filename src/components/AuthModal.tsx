import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

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
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    signIn(email, name || undefined);
    setEmail("");
    setName("");
    setPassword("");
    onClose();
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
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 w-full max-w-sm glass-card p-8"
          >
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Hesabına Giriş Yap" : "Hesap Oluştur"}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {mode === "signin"
                ? "Devam etmek için bilgilerini gir."
                : "Saniyeler içinde haftalık 20 limitine ulaş."}
            </p>

            <button
              type="button"
              onClick={() => {
                signIn("you@gmail.com", "Google Kullanıcı");
                onClose();
              }}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <path fill="#fff" d="M21.35 11.1H12v2.9h5.35c-.23 1.4-1.62 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.95S8.78 6.2 12 6.2c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.7 3.66 14.55 2.7 12 2.7 6.86 2.7 2.7 6.86 2.7 12s4.16 9.3 9.3 9.3c5.37 0 8.92-3.77 8.92-9.07 0-.6-.06-1.05-.15-1.13z"/>
              </svg>
              Google ile Devam Et
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-white/30">
              <div className="h-px flex-1 bg-white/10" />
              veya
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "signup" && (
                <AuthInput
                  label="İsim"
                  value={name}
                  onChange={setName}
                  placeholder="Adın"
                />
              )}
              <AuthInput
                label="E-posta"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="ornek@apple.com"
                required
              />
              <AuthInput
                label="Şifre"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-[#0071e3] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0077ed]"
              >
                {mode === "signin" ? "Giriş Yap" : "E-posta ile Kayıt Ol"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {mode === "signin" ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
              <button
                onClick={() => onSwitch(mode === "signin" ? "signup" : "signin")}
                className="text-white underline-offset-2 hover:underline"
              >
                {mode === "signin" ? "Kayıt ol" : "Giriş yap"}
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
      <span className="block text-[11px] uppercase tracking-widest text-white/40">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="peer mt-1.5 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#0071e3] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.25)]"
      />
    </label>
  );
}
