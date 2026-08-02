import { Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { type Tool, getTool } from "@/data/registry";
import { CategoryChip } from "@/components/Breadcrumbs";
import { track } from "@/lib/analytics";
import { ADSENSE_CLIENT, ADSENSE_SLOT_TOOL } from "@/lib/ads";

export function ToolCard({ tool, onRelated }: { tool: Tool; onRelated?: boolean }) {
  return (
    <Link
      to="/tools/$category/$slug"
      params={{ category: tool.category, slug: tool.slug }}
      className="tool-card"
      onClick={() => onRelated && track("related_clicked", { slug: tool.slug })}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}
      >
        <CategoryChip category={tool.category} />
      </div>

      <span className="name">{tool.name}</span>
      <span className="desc">{tool.shortDesc}</span>
    </Link>
  );
}

export function RelatedTools({ slugs }: { slugs: string[] }) {
  const tools = slugs.map((s) => getTool(s)).filter(Boolean) as Tool[];
  if (tools.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" style={{ marginTop: 40 }}>
      <h2 id="related-heading">Related tools</h2>
      <div className="grid grid-2">
        {tools.map((t) => (
          <ToolCard key={t.slug} tool={t} onRelated />
        ))}
      </div>
    </section>
  );
}

export function AdSlot({ label = "Advertisement" }: { label?: string }) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !ADSENSE_SLOT_TOOL) return;
    try {
      // @ts-expect-error injected by the AdSense loader script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script blocked (adblock) or not loaded yet — leave the empty <ins>.
    }
  }, []);

  if (!ADSENSE_CLIENT || !ADSENSE_SLOT_TOOL) {
    return (
      <div className="ad-slot" role="complementary" aria-label="Advertisement">
        {label}
      </div>
    );
  }

  return (
    <ins
      ref={insRef}
      className="adsbygoogle ad-slot"
      style={{ display: "block" }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={ADSENSE_SLOT_TOOL}
      data-ad-format="auto"
      data-full-width-responsive="true"
      role="complementary"
      aria-label="Advertisement"
    />
  );
}

// Drop-in affiliate mention, e.g. <AffiliateLink href="..." label="Need more storage? Try X" />
// near a relevant tool. rel="sponsored" tells search engines it's a paid link.
export function AffiliateLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="ad-slot"
      style={{ textTransform: "none", letterSpacing: "normal", fontSize: "0.85rem" }}
    >
      {label}
    </a>
  );
}
