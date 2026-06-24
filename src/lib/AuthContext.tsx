import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export type User = {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  trialEndsAt?: number | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithPassword: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (u: Partial<Pick<User, "name">>) => Promise<{ error?: string }>;
  refresh: () => Promise<void>;
};

const TIER_KEY = "wlimit:tier";

const AuthContext = createContext<AuthContextValue | null>(null);

function setTierExternal(tier: "guest" | "free" | "pro") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TIER_KEY, tier);
  window.dispatchEvent(new Event("tier-changed"));
}

type ProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
  plan: "free" | "pro";
  trial_ends_at: string | null;
};

async function loadProfile(session: Session): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, plan, trial_ends_at")
    .eq("id", session.user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    console.error("[auth] profile load failed", error);
  }

  const meta = session.user.user_metadata as Record<string, unknown> | undefined;
  const fallbackName =
    (meta?.display_name as string | undefined) ??
    (meta?.full_name as string | undefined) ??
    (meta?.name as string | undefined) ??
    session.user.email?.split("@")[0] ??
    "Kullanıcı";

  if (!data) {
    return {
      id: session.user.id,
      email: session.user.email ?? "",
      name: fallbackName,
      plan: "free",
      trialEndsAt: null,
    };
  }

  return {
    id: data.id,
    email: data.email,
    name: data.display_name || fallbackName,
    plan: data.plan,
    trialEndsAt: data.trial_ends_at ? new Date(data.trial_ends_at).getTime() : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (session: Session | null) => {
    if (!session) {
      setUser(null);
      setTierExternal("guest");
      return;
    }
    const u = await loadProfile(session);
    setUser(u);
    setTierExternal(u?.plan ?? "free");
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer async work to avoid deadlocks in the listener.
      setTimeout(() => {
        if (mounted) void applySession(session);
      }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      void applySession(data.session).finally(() => mounted && setLoading(false));
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [applySession]);

  const signInWithPassword: AuthContextValue["signInWithPassword"] = useCallback(
    async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const signUpWithPassword: AuthContextValue["signUpWithPassword"] = useCallback(
    async (email, password, name) => {
      const redirect =
        typeof window !== "undefined" ? `${window.location.origin}/` : undefined;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirect,
          data: name ? { display_name: name } : undefined,
        },
      });
      if (error) return { error: error.message };
      return {};
    },
    [],
  );

  const signInWithGoogle: AuthContextValue["signInWithGoogle"] = useCallback(async () => {
    const redirect =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: redirect,
    });
    if (result.error) return { error: (result.error as Error).message };
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTierExternal("guest");
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await applySession(data.session);
  }, [applySession]);

  const updateUser: AuthContextValue["updateUser"] = useCallback(
    async (patch) => {
      if (!user) return { error: "Oturum yok" };
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: patch.name ?? user.name })
        .eq("id", user.id);
      if (error) return { error: error.message };
      setUser({ ...user, ...patch });
      return {};
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      updateUser,
      refresh,
    }),
    [
      user,
      loading,
      signInWithPassword,
      signUpWithPassword,
      signInWithGoogle,
      signOut,
      updateUser,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
