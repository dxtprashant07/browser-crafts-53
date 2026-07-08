import { Link } from "@tanstack/react-router";
import { type Tool, getTool } from "@/data/registry";
import { CategoryChip } from "@/components/Breadcrumbs";
import { track } from "@/lib/analytics";

export function ToolCard({ tool, onRelated }: { tool: Tool; onRelated?: boolean }) {
  return (
    <Link
      to="/tools/$category/$slug"
      params={{ category: tool.category, slug: tool.slug }}
      className="tool-card"
      onClick={() => onRelated && track("related_clicked", { slug: tool.slug })}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "space-between" }}>
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
  return (
    <div className="ad-slot" role="complementary" aria-label="Advertisement">
      {label}
    </div>
  );
}
