import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CATEGORIES, TOOLS, getPopularTools, categoryCount } from "@/data/registry";
import { absUrl } from "@/lib/site";
import { SiteChrome } from "@/components/SiteChrome";
import { ToolCard } from "@/components/ToolCard";
import { useCommandPalette } from "@/components/CommandPalette";
import { CategoryChip } from "@/components/Breadcrumbs";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const ImageCompressor = lazy(() => import("@/islands/ImageCompressor"));

const HERO_CHIPS: { label: string; slug: string; category: string }[] = [
  { label: "compress image", slug: "compress-image", category: "image" },
  { label: "merge pdf", slug: "merge-pdf", category: "pdf" },
  { label: "qr code", slug: "qr-code-generator", category: "generator" },
  { label: "json", slug: "json-formatter", category: "developer" },
  { label: "password", slug: "password-generator", category: "generator" },
];

const ROADMAP_ITEMS: { title: string; desc: string; status: "in-progress" | "planned" }[] = [
  {
    title: "Unit converters",
    desc: "Length, weight, temperature, and data-size conversions — same client-side approach.",
    status: "in-progress",
  },
  {
    title: "Image-to-PDF & PDF-to-image",
    desc: "Turn photos into a PDF, or pull pages back out as images.",
    status: "planned",
  },
  {
    title: "CSV ⇄ JSON converter",
    desc: "Convert between CSV and JSON with column mapping, no upload.",
    status: "planned",
  },
  {
    title: "Color picker & palette generator",
    desc: "Pick colors from an image or generate a palette, export as CSS/JSON.",
    status: "planned",
  },
];

const CAT_DISPLAY: Record<string, string> = {
  image: "Image tools",
  pdf: "PDF tools",
  text: "Text tools",
  developer: "Developer tools",
  generator: "Generators",
};

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: absUrl("/") }],
    meta: [{ property: "og:url", content: absUrl("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Subtrate",
          url: absUrl("/"),
          description: "Fast, private browser tools for images, PDFs, text, and code.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Subtrate",
          url: absUrl("/"),
          logo: absUrl("/og-image.png"),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const popular = getPopularTools();
  const navigate = useNavigate();
  const { setOpen } = useCommandPalette();

  return (
    <SiteChrome>
      <div className="free-banner" role="note">
        <span className="free-banner-badge">✨ No limits</span>
        <span>
          Unlimited tool use, forever free — no sign-up, no quota, no catch. Hit · <kbd>Ctrl</kbd>+
          <kbd>D</kbd> to bookmark this page so you don't lose it.
        </span>
      </div>
      <section className="hero">
        <div className="hero-glow" aria-hidden />
        <div className="container hero-inner">
          <span className="hero-eyebrow">
            <span className="pulse" aria-hidden />
            {TOOLS.length} free browser tools · nothing uploaded
          </span>
          <h1>
            Small jobs.
            <br />
            Done in <span className="grad">your browser</span>.
          </h1>
          <p className="sub">
            Free tools that work instantly and never see your files — no account, no upload, no
            paywall.
          </p>
          <button className="big-search" onClick={() => setOpen(true)} aria-label="Search tools">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
              focusable="false"
            >
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
            <span className="bs-label">What do you need to do?</span>
            <span className="kbd">Ctrl K</span>
          </button>
          <div className="example-chips">
            <span className="ec-lead">Popular:</span>
            {HERO_CHIPS.map((c) => (
              <button
                key={c.slug}
                onClick={() =>
                  navigate({
                    to: "/tools/$category/$slug",
                    params: { category: c.category, slug: c.slug },
                  })
                }
              >
                {c.label}
                <span className="ec-arrow" aria-hidden>
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container section" id="popular" aria-labelledby="popular-heading">
        <div className="section-head">
          <h2 id="popular-heading">Popular tools</h2>
          <Link to="/tools/$category" params={{ category: "image" }}>
            All {TOOLS.length} tools →
          </Link>
        </div>
        <div className="bento">
          <div
            className="feature card"
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CategoryChip category="image" />
              <div>
                <strong style={{ fontSize: "1.1rem" }}>Image Compressor</strong>
                <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                  Shrink JPG, PNG, and WEBP up to 85% — right here, before you even leave this card.
                </div>
              </div>
            </div>
            <ClientOnly fallback={<div className="dropzone">Loading…</div>}>
              <Suspense fallback={<div className="dropzone">Loading…</div>}>
                <ImageCompressor />
              </Suspense>
            </ClientOnly>
          </div>
          {popular
            .filter((t) => t.slug !== "compress-image")
            .map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
        </div>
      </section>

      <section className="container section" id="categories">
        <div className="home-lower">
          <div>
            <h2 style={{ marginBottom: 18 }}>Browse by category</h2>
            <div className="cat-two">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to="/tools/$category"
                  params={{ category: c.id }}
                  className="cat-item"
                >
                  <CategoryChip category={c.id} />
                  <span>{CAT_DISPLAY[c.id] ?? c.name}</span>
                  <span className="count">{categoryCount(c.id)}</span>
                </Link>
              ))}
              <div className="cat-item soon" aria-disabled="true">
                <span className="chip" style={{ background: "var(--bg)", color: "var(--muted)" }}>
                  ⇄
                </span>
                <span>Converters</span>
                <span className="count">soon</span>
              </div>
            </div>
          </div>

          <div className="why-panel" id="why">
            <h2 style={{ fontSize: "1.3rem" }}>Why this site is different</h2>
            <ul>
              <li>
                <strong>
                  <span className="check" aria-hidden>
                    ✓
                  </span>
                  Private by architecture.
                </strong>
                <span>
                  Every tool runs client-side — your files physically cannot reach a server.
                </span>
              </li>
              <li>
                <strong>
                  <span className="check" aria-hidden>
                    ✓
                  </span>
                  Ads never get in the way.
                </strong>
                <span>One slot, only after your result. Never before, never blocking.</span>
              </li>
              <li>
                <strong>
                  <span className="check" aria-hidden>
                    ✓
                  </span>
                  Dark mode native.
                </strong>
                <span>A first-class theme, not an inverted afterthought.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container section" id="roadmap">
        <div className="section-head">
          <h2>Roadmap</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>What's next, in order</span>
        </div>
        <ul className="roadmap-list">
          {ROADMAP_ITEMS.map((item) => (
            <li key={item.title} className={`roadmap-item roadmap-${item.status}`}>
              <span className="roadmap-status">
                {item.status === "in-progress" ? "In progress" : "Planned"}
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </SiteChrome>
  );
}
