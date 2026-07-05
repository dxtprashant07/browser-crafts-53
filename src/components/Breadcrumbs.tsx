import { Link } from "@tanstack/react-router";
import { CATEGORIES, type Category } from "@/data/registry";

export function Breadcrumbs({ items }: { items: { label: string; to?: string; params?: Record<string, string> }[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          {i > 0 && <span className="sep" aria-hidden>›</span>}
          {it.to ? (
            it.params ? (
              <Link
                to="/tools/$category"
                params={{ category: it.params.category }}
              >
                {it.label}
              </Link>
            ) : (
              <Link to={it.to as "/"}>{it.label}</Link>
            )
          ) : (
            <span aria-current="page" style={{ color: "var(--ink)" }}>
              {it.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export const CATEGORY_CHIP_CLASS: Record<Category, { bg: string; fg: string }> = {
  image: { bg: "var(--cat-image-bg)", fg: "var(--cat-image-fg)" },
  pdf: { bg: "var(--cat-pdf-bg)", fg: "var(--cat-pdf-fg)" },
  text: { bg: "var(--cat-text-bg)", fg: "var(--cat-text-fg)" },
  developer: { bg: "var(--cat-developer-bg)", fg: "var(--cat-developer-fg)" },
  generator: { bg: "var(--cat-generator-bg)", fg: "var(--cat-generator-fg)" },
};

export function CategoryChip({ category }: { category: Category }) {
  const meta = CATEGORIES.find((c) => c.id === category)!;
  const c = CATEGORY_CHIP_CLASS[category];
  return (
    <span className="chip" style={{ background: c.bg, color: c.fg }} aria-hidden>
      {meta.icon}
    </span>
  );
}
