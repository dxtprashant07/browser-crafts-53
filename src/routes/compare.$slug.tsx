import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getComparison } from "@/data/comparisons";
import { getTool } from "@/data/registry";
import { absUrl } from "@/lib/site";

export const Route = createFileRoute("/compare/$slug")({
  loader: ({ params }) => {
    const comparison = getComparison(params.slug);
    if (!comparison) throw notFound();
    return { comparison };
  },
  head: ({ params, loaderData }) => {
    const c = loaderData?.comparison;
    if (!c)
      return { meta: [{ title: "Comparison not found" }, { name: "robots", content: "noindex" }] };
    const path = `/compare/${params.slug}`;
    return {
      meta: [
        { title: c.title },
        { name: "description", content: c.description },
        { property: "og:title", content: c.title },
        { property: "og:description", content: c.description },
        { property: "og:url", content: absUrl(path) },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: absUrl(path) }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
              { "@type": "ListItem", position: 2, name: c.h1, item: absUrl(path) },
            ],
          }),
        },
      ],
    };
  },
  component: ComparePage,
  notFoundComponent: () => (
    <SiteChrome>
      <div className="container section" style={{ textAlign: "center" }}>
        <h1>Comparison not found</h1>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    </SiteChrome>
  ),
});

function ComparePage() {
  const { comparison: c } = Route.useLoaderData();
  const tools = c.toolSlugs.map((slug) => getTool(slug)).filter((t) => t !== undefined);

  return (
    <SiteChrome>
      <div className="tool-column section prose">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: c.h1 }]} />
        <h1>{c.h1}</h1>
        <p>{c.intro}</p>

        <h2>At a glance</h2>
        <table className="regex-table" style={{ marginBottom: 8 }}>
          <thead>
            <tr>
              <th></th>
              <th>Subtrate</th>
              <th>{c.competitorName}</th>
            </tr>
          </thead>
          <tbody>
            {c.rows.map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td>{row.subtrate}</td>
                <td>{row.competitor}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: "var(--fs-sm)", color: "var(--muted)", marginTop: -4 }}>
          {c.competitorName} details from{" "}
          <a href={c.competitorUrl} target="_blank" rel="noopener noreferrer nofollow">
            their own site
          </a>{" "}
          as of{" "}
          <time dateTime={c.checkedDate}>
            {new Date(c.checkedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          ; check their site for current limits and pricing.
        </p>

        <h2>Where Subtrate has the edge</h2>
        <p>{c.subtrateEdge}</p>

        <h2>Where {c.competitorName} has the edge</h2>
        <p>{c.competitorEdge}</p>

        {tools.length > 0 && (
          <>
            <h2>Try Subtrate's tools</h2>
            <ul>
              {tools.map((t) => (
                <li key={t.slug}>
                  <Link to="/tools/$category/$slug" params={{ category: t.category, slug: t.slug }}>
                    {t.name}
                  </Link>{" "}
                  — {t.shortDesc}
                </li>
              ))}
            </ul>
          </>
        )}

        <section className="faq" aria-labelledby="faq-heading" style={{ marginTop: 40 }}>
          <h2 id="faq-heading">Frequently asked questions</h2>
          {c.faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </div>
    </SiteChrome>
  );
}
