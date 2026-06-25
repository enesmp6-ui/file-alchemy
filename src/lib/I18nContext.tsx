import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "@/i18n/en.json";
import tr from "@/i18n/tr.json";

export type Locale = "en" | "tr";

const DICTS: Record<Locale, Record<string, unknown>> = { en, tr };
const KEY = "iflexi:locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

function resolveInitial(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(KEY) as Locale | null;
  if (stored === "en" || stored === "tr") return stored;
  const lang = navigator.language?.toLowerCase() ?? "en";
  return lang.startsWith("tr") ? "tr" : "en";
}

function lookup(dict: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

function interpolate(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(resolveInitial());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };

  const t = useMemo(() => {
    return (path: string, vars?: Record<string, string | number>) => {
      const hit = lookup(DICTS[locale], path) ?? lookup(DICTS.en, path);
      return interpolate(hit ?? path, vars);
    };
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
