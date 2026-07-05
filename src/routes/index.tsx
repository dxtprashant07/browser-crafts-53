import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CATEGORIES, getPopularTools, categoryCount } from "@/data/registry";
import { SiteChrome } from "@/components/SiteChrome";
import { ToolCard } from "@/components/ToolCard";
import { useCommandPalette } from "@/components/CommandPalette";
import { CategoryChip } from "@/components/Breadcrumbs";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";

const ImageCompressor = lazy(() => import("@/islands/ImageCompressor"));

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: "/" }],
    meta: [{ property: "og:url", content: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Tools Platform",
          description: "Fast, private browser tools for images, PDFs, text, and code.",
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
      <section className="container hero">
        <h1>Small jobs. Done in your browser.</h1>
        <p className="sub">
          Free, fast tools for images, PDFs, text, and code. Nothing is uploaded — everything runs on your device.
        </p>
        <button className="big-search" onClick={() => setOpen(true)} aria-label="Search tools">
          <span aria-hidden>🔍</span>
          <span>Search tools…</span>
          <span className="kbd">⌘K</span>
        </button>
        <div className="example-chips">
          {popular.slice(0, 5).map((t) => (
            <button key={t.slug} onClick={() => navigate({ to: "/tools/$category/$slug", params: { category: t.category, slug: t.slug } })}>
              {t.name}
            </button>
          ))}
        </div>
        <p className="trust-line">0 uploads · 0 accounts · 0 paywalls · &lt;2s loads</p>
      </section>

      <section className="container section" aria-labelledby="popular-heading">
        <h2 id="popular-heading">Popular tools</h2>
        <div className="bento">
          <div className="feature card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CategoryChip category="image" />
              <div>
                <strong style={{ fontSize: "1.1rem" }}>Image Compressor</strong>
                <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>Drop an image to shrink it instantly</div>
              </div>
            </div>
            <ClientOnly fallback={<div className="dropzone">Loading…</div>}>
              <Suspense fallback={<div className="dropzone">Loading…</div>}>
                <ImageCompressor />
              </Suspense>
            </ClientOnly>
          </div>
          {popular.filter((t) => t.slug !== "compress-image").map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      <section className="container section" aria-labelledby="cat-heading">
        <h2 id="cat-heading">Browse by category</h2>
        <div className="cat-list">
          {CATEGORIES.map((c) => (
            <Link key={c.id} to="/tools/$category" params={{ category: c.id }}>
              <CategoryChip category={c.id} />
              <span>{c.name}</span>
              <span className="count">{categoryCount(c.id)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="why-panel">
          <h2>Why this site is different</h2>
          <ul>
            <li><strong>Truly private</strong><span>Files and text never leave your device. No server, ever.</span></li>
            <li><strong>No accounts</strong><span>No sign-up, no email, no tracking walls. Just open and use.</span></li>
            <li><strong>Fast &amp; free</strong><span>Lightweight pages that load in under two seconds, always free.</span></li>
          </ul>
        </div>
      </section>
    </SiteChrome>
  );
}
