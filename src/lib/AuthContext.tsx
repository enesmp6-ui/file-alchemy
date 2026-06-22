import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type User = {
  name: string;
  email: string;
  plan: "free" | "pro";
  trialEndsAt?: number | null;
};

type AuthContextValue = {
  user: User | null;
  signIn: (email: string, name?: string, opts?: { plan?: "free" | "pro" }) => void;
  signOut: () => void;
  updateUser: (u: Partial<User>) => void;
};

const KEY = "auth:user";
const TIER_KEY = "wlimit:tier";

const AuthContext = createContext<AuthContextValue | null>(null);

function setTierExternal(tier: "guest" | "free" | "pro") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIER_KEY, tier);
  window.dispatchEvent(new Event("tier-changed"));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const u = JSON.parse(raw) as User;
        setUser(u);
        setTierExternal(u.plan);
      }
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (typeof window === "undefined") return;
    if (u) window.localStorage.setItem(KEY, JSON.stringify(u));
    else window.localStorage.removeItem(KEY);
  };

  const signIn = useCallback<AuthContextValue["signIn"]>((email, name, opts) => {
    const plan = opts?.plan ?? "free";
    const u: User = {
      email,
      name: name || email.split("@")[0],
      plan,
      trialEndsAt: plan === "pro" ? Date.now() + 14 * 24 * 60 * 60 * 1000 : null,
    };
    persist(u);
    setTierExternal(plan);
  }, []);

  const signOut = useCallback(() => {
    persist(null);
    setTierExternal("guest");
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined")
        window.localStorage.setItem(KEY, JSON.stringify(next));
      if (patch.plan) setTierExternal(patch.plan);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signOut, updateUser }),
    [user, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
