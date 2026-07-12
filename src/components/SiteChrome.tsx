import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { useCommandPalette } from "@/components/CommandPalette";
import { CATEGORIES, getToolsByCategory, categoryCount } from "@/data/registry";

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

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line
        x1="16.6"
        y1="16.6"
        x2="21"
        y2="21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Tool names the search trigger "types" to hint at what the palette can find.
const SEARCH_HINTS = [
  "compress pdf",
  "qr code",
  "resize image",
  "word counter",
  "json format",
  "text compare",
];

// Typewriter loop: types a word, holds, deletes it, moves to the next.
// Inactive until `active` (so SSR and reduced-motion users get static text).
function useTypewriter(words: string[], active: boolean): string {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    let word = 0;
    let char = 0;
    let deleting = false;
    let timer: number;
    const tick = () => {
      const current = words[word];
      if (!deleting) {
        char++;
        setText(current.slice(0, char));
        if (char === current.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1700);
          return;
        }
        timer = window.setTimeout(tick, 85);
      } else {
        char--;
        setText(current.slice(0, char));
        if (char === 0) {
          deleting = false;
          word = (word + 1) % words.length;
        }
        timer = window.setTimeout(tick, deleting ? 35 : 350);
      }
    };
    timer = window.setTimeout(tick, 900);
    return () => window.clearTimeout(timer);
  }, [words, active]);
  return text;
}

// Pill-shaped theme switch: outlined track with a sliding knob holding a
// half-filled sun icon. Knob sits left in light mode, right in dark mode.
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      className="theme-switch"
      role="switch"
      aria-checked={dark}
      data-on={dark || undefined}
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title="Toggle dark mode"
    >
      <span className="knob" aria-hidden>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" focusable="false">
          <circle cx="12" cy="12" r="4.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7.4a4.6 4.6 0 0 1 0 9.2Z" fill="currentColor" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="12" y1="1.6" x2="12" y2="3.9" />
            <line x1="12" y1="20.1" x2="12" y2="22.4" />
            <line x1="1.6" y1="12" x2="3.9" y2="12" />
            <line x1="20.1" y1="12" x2="22.4" y2="12" />
            <line x1="4.7" y1="4.7" x2="6.3" y2="6.3" />
            <line x1="17.7" y1="17.7" x2="19.3" y2="19.3" />
            <line x1="4.7" y1="19.3" x2="6.3" y2="17.7" />
            <line x1="17.7" y1="6.3" x2="19.3" y2="4.7" />
          </g>
        </svg>
      </span>
    </button>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [animateHints, setAnimateHints] = useState(false);

  // Close the mobile menu whenever navigation happens.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Only animate the search hints after mount and when motion is welcome.
  useEffect(() => {
    setAnimateHints(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const typed = useTypewriter(SEARCH_HINTS, animateHints);

  // Elevation shadow once content scrolls under the sticky header.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="site-header" data-scrolled={scrolled || undefined}>
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
            <button
              className="header-search"
              onClick={() => setOpen(true)}
              aria-label="Search tools"
            >
              <SearchIcon />
              <span className="lbl" aria-hidden>
                {typed ? (
                  <>
                    Try “<span className="typed">{typed}</span>
                    <span className="caret" />”
                  </>
                ) : (
                  "Search tools…"
                )}
              </span>
              <kbd className="k">⌘K</kbd>
            </button>
            <ThemeToggle />
            <button
              className="btn btn-primary btn-sm get-started-btn"
              onClick={() => setOpen(true)}
            >
              Get Started{" "}
              <span className="arrow" aria-hidden>
                →
              </span>
            </button>
            <button
              className="icon-btn menu-btn"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden>{menuOpen ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="mobile-nav container" aria-label="Primary mobile">
            {NAV.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <div className="mobile-nav-cats">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to="/tools/$category"
                  params={{ category: c.id }}
                  onClick={() => setMenuOpen(false)}
                >
                  <span aria-hidden>{c.icon}</span> {c.name} tools
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main id="main">{children}</main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand" aria-label="Tools Platform home">
              <span className="brand-mark">
                <BrandMark />
              </span>
              <span className="brand-text">
                <span className="brand-title">Tools Platform</span>
                <span className="brand-sub">One Platform. Many Tools.</span>
              </span>
            </Link>
            <p className="footer-tagline">
              Small jobs, done in your browser. Every tool runs on your device — no uploads, no
              accounts, no paywalls.
            </p>
            <ul className="footer-pledge">
              <li>
                <span className="check" aria-hidden>
                  ✓
                </span>{" "}
                100% client-side
              </li>
              <li>
                <span className="check" aria-hidden>
                  ✓
                </span>{" "}
                Files never uploaded
              </li>
              <li>
                <span className="check" aria-hidden>
                  ✓
                </span>{" "}
                Free & open in any browser
              </li>
            </ul>
          </div>

          <div className="footer-links">
            {CATEGORIES.map((c) => {
              const tools = getToolsByCategory(c.id).slice(0, 5);
              return (
                <div className="footer-col" key={c.id}>
                  <h4>
                    <span aria-hidden>{c.icon}</span> {c.name}
                  </h4>
                  {tools.map((t) => (
                    <Link
                      key={t.slug}
                      to="/tools/$category/$slug"
                      params={{ category: c.id, slug: t.slug }}
                    >
                      {t.name}
                    </Link>
                  ))}
                  <Link to="/tools/$category" params={{ category: c.id }} className="footer-all">
                    All {categoryCount(c.id)} {c.name.toLowerCase()} tools →
                  </Link>
                </div>
              );
            })}
            <div className="footer-col">
              <h4>Site</h4>
              <a href="/#popular">Popular tools</a>
              <a href="/#why">How it works</a>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Tools Platform. All rights reserved.</span>
          <span className="footer-bottom-note">
            <span aria-hidden>🔒</span> Runs entirely in your browser
          </span>
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
