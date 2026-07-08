import { lazy, Suspense, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { useCommandPalette } from "@/components/CommandPalette";
import { CATEGORIES } from "@/data/registry";

const CommandPalette = lazy(() => import("@/components/CommandPalette"));

const NAV: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Tools", href: "/#popular" },
  { label: "Categories", href: "/#categories" },
  { label: "How It Works", href: "/#why" },
  { label: "About", href: "/privacy" },
  { label: "Roadmap", href: "/#categories" },
];

function BrandMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <path
        d="M3 19L9.2 8.5a1 1 0 0 1 1.72 0L14 14l1.6-2.6a1 1 0 0 1 1.7 0L21 19H3Z"
        fill="currentColor"
      />
      <circle cx="17.5" cy="6" r="2" fill="currentColor" />
    </svg>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="icon-btn"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle theme"
    >
      <span aria-hidden>{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      <header className="site-header">
        <div className="container bar">
          <Link to="/" className="brand" aria-label="Tools Platform home">
            <span className="brand-mark">
              <BrandMark />
            </span>
            <span className="brand-text">
              <span className="brand-title">Tools Platform</span>
              <span className="brand-sub">One Platform. Many Tools.</span>
            </span>
          </Link>

          <nav className="header-nav" aria-label="Primary">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                data-active={item.href === "/" && pathname === "/" ? "true" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-right">
            <button className="header-search" onClick={() => setOpen(true)} aria-label="Search tools">
              <span aria-hidden>🔍</span>
              <span className="lbl">Search tools…</span>
              <kbd className="k">⌘K</kbd>
            </button>
            <ThemeToggle />
            <button className="btn btn-primary btn-sm get-started-btn" onClick={() => setOpen(true)}>
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-col" style={{ maxWidth: 260 }}>
            <h4>Tools Platform</h4>
            <p style={{ margin: 0 }}>
              Small jobs, done in your browser. No uploads, no accounts, no paywalls.
            </p>
          </div>
          {CATEGORIES.map((c) => (
            <div className="footer-col" key={c.id}>
              <h4>{c.name}</h4>
              <Link to="/tools/$category" params={{ category: c.id }}>
                All {c.name.toLowerCase()} tools
              </Link>
            </div>
          ))}
          <div className="footer-col">
            <h4>Site</h4>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </footer>

      {open && (
        <Suspense fallback={null}>
          <CommandPalette open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
