import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  Link,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n, { applyDir } from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import { BrandSync } from "@/components/BrandSync";
import { pageHead, DEFAULT_OG_IMAGE } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-gray-500">404</h1>
        <p className="mt-4 text-muted-foreground">Page not found</p>
        <Link to="/" className="mt-6 inline-block rounded-xl liquid-green px-5 py-2.5 text-sm font-bold text-white">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-xl liquid-green px-5 py-2.5 text-sm font-bold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

const defaultSeo = pageHead({
  title: i18n.t("seo.home.title"),
  description: i18n.t("seo.home.description"),
  path: "/",
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0f172a" },
      { name: "format-detection", content: "telephone=yes" },
      ...defaultSeo.meta,
    ],
    links: [
      { rel: "icon", href: DEFAULT_OG_IMAGE, type: "image/png" },
      ...defaultSeo.links,
    ],
    scripts: defaultSeo.scripts,
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function I18nBootstrap() {
  const { i18n: i } = useTranslation();
  useEffect(() => { applyDir(i.language); }, [i.language]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // ensure init on client
  if (typeof window !== "undefined" && !i18n.isInitialized) {
    // no-op; module init handles it
  }
  return (
    <QueryClientProvider client={queryClient}>
      <BrandSync />
      <I18nBootstrap />
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
