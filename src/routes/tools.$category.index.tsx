import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CATEGORIES, getCategory, getToolsByCategory, type Category } from "@/data/registry";
import { SiteChrome } from "@/components/SiteChrome";
import { ToolCard } from "@/components/ToolCard";
import { Breadcrumbs, CategoryChip } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/tools/$category/")({
  loader: ({ params }) => {
    const cat = getCategory(params.category);
    if (!cat) throw notFound();
    return { category: cat };
  },
  head: ({ params, loaderData }) => {
    const cat = loaderData?.category;
    if (!cat) return { meta: [{ title: "Category not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: `${cat.name} Tools — Tools Platform` },
        { name: "description", content: cat.description },
        { property: "og:title", content: `${cat.name} Tools — Tools Platform` },
        { property: "og:description", content: cat.description },
        { property: "og:url", content: `/tools/${params.category}` },
      ],
      links: [{ rel: "canonical", href: `/tools/${params.category}` }],
    };
  },
  component: CategoryHub,
  notFoundComponent: () => (
    <SiteChrome>
      <div className="container section" style={{ textAlign: "center" }}>
        <h1>Category not found</h1>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </SiteChrome>
  ),
});

function CategoryHub() {
  const { category } = Route.useLoaderData();
  const tools = getToolsByCategory(category.id as Category);

  return (
    <SiteChrome>
      <div className="container section">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: category.name }]} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <CategoryChip category={category.id} />
          <h1 style={{ margin: 0 }}>{category.name} Tools</h1>
        </div>
        <p className="prose">{category.description}</p>
        <p className="mono" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>{tools.length} tools</p>

        {tools.length > 0 ? (
          <div className="grid grid-3" style={{ marginTop: 20 }}>
            {tools.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", marginTop: 20 }}>
            <h2>Coming soon</h2>
            <p style={{ color: "var(--muted)" }}>We're still building tools for this category.</p>
            <Link to="/" className="btn btn-sm">Suggest a tool</Link>
          </div>
        )}

        <h2 style={{ marginTop: 40 }}>Other categories</h2>
        <div className="wc-toolbar">
          {CATEGORIES.filter((c) => c.id !== category.id).map((c) => (
            <Link key={c.id} to="/tools/$category" params={{ category: c.id }} className="btn btn-sm">
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </SiteChrome>
  );
}
