import { lazy, Suspense, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { useCommandPalette } from "@/components/CommandPalette";
import { CATEGORIES } from "@/data/registry";

const CommandPalette = lazy(() => import("@/components/CommandPalette"));

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

  return (
    <>
      <header className="site-header">
        <div className="container bar">
          <Link to="/" className="logo" aria-label="Tools Platform home">
            <span className="dot" aria-hidden />
            Tools Platform
          </Link>
          <nav className="header-nav" aria-label="Categories">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                to="/tools/$category"
                params={{ category: c.id }}
                activeProps={{ "data-active": "true" }}
              >
                {c.name}
              </Link>
            ))}
          </nav>
          <div className="header-right">
            <button
              className="search-trigger"
              onClick={() => setOpen(true)}
              aria-label="Search tools"
            >
              <span aria-hidden>🔍</span>
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>
            <ThemeToggle />
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
