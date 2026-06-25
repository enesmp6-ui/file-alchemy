import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/AuthContext";
import { ThemeProvider } from "../lib/ThemeContext";
import { I18nProvider } from "../lib/I18nContext";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-5 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_60%)]"
      />
      <div className="relative z-10 mx-auto max-w-lg text-center">
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-white to-white/60 text-black">
          <span className="text-base font-bold">i</span>
        </div>
        <h1 className="mt-10 text-[6rem] font-thin leading-none tracking-tight sm:text-[9rem]">
          404
        </h1>
        <h2 className="mt-4 text-2xl font-thin text-white/80 sm:text-3xl">
          Aradığın sayfa burada değil.
        </h2>
        <p className="mt-4 text-sm text-white/50">
          Yanlış bir bağlantıyı takip etmiş olabilirsin ya da sayfa taşınmış olabilir.
          iFlexi seni güvenli yere geri götürür.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Ana Sayfa
          </Link>
          <Link
            to="/help"
            className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:bg-white/5"
          >
            Yardım Merkezi
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "iFlexi — Tarayıcında dönüştür, hiçbir şey buluta gitmez." },
      { name: "description", content: "iFlexi premium dosya dönüştürücü. Tamamen tarayıcında çalışır, dosyaların asla cihazından çıkmaz." },
      { name: "author", content: "iFlexi" },
      { property: "og:title", content: "iFlexi — Premium tarayıcı içi dönüştürücü" },
      { property: "og:description", content: "Dosyaların cihazından çıkmadan dönüşür. Sıfır sunucu, sıfır sızıntı." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@iflexi" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
