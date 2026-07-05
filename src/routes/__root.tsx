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

import "@fontsource/familjen-grotesk/600.css";
import "@fontsource/familjen-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { themeInitScript } from "../lib/theme";
import { SiteChrome } from "../components/SiteChrome";

function NotFoundComponent() {
  return (
    <SiteChrome>
      <div className="container section" style={{ textAlign: "center", minHeight: "50vh" }}>
        <h1 style={{ fontSize: "5rem" }}>404</h1>
        <h2>Page not found</h2>
        <p style={{ color: "var(--muted)" }}>The page you're looking for doesn't exist or has moved.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>
          Go home
        </Link>
      </div>
    </SiteChrome>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="container section" style={{ textAlign: "center", minHeight: "50vh" }}>
      <h1 style={{ fontSize: "1.4rem" }}>This page didn't load</h1>
      <p style={{ color: "var(--muted)" }}>Something went wrong. Try refreshing or head back home.</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </button>
        <a className="btn" href="/">
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tools Platform — Fast, Private Browser Tools" },
      {
        name: "description",
        content:
          "Free browser tools for images, PDFs, text, and code. Nothing is uploaded — every tool runs entirely on your device.",
      },
      { name: "author", content: "Tools Platform" },
      { property: "og:site_name", content: "Tools Platform" },
      { property: "og:title", content: "Tools Platform — Fast, Private Browser Tools" },
      {
        property: "og:description",
        content: "Small jobs, done in your browser. No uploads, no accounts, no paywalls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
      <a href="#main" className="visually-hidden">
        Skip to content
      </a>
      <Outlet />
    </QueryClientProvider>
  );
}
