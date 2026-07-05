import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { getCategory, getTool } from "@/data/registry";
import { SiteChrome } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedTools, AdSlot } from "@/components/ToolCard";
import { ToolIsland } from "@/islands";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/tools/$category/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    const cat = getCategory(params.category);
    if (!tool || !cat || tool.category !== params.category) throw notFound();
    return { tool, cat };
  },
  head: ({ params, loaderData }) => {
    const tool = loaderData?.tool;
    if (!tool) return { meta: [{ title: "Tool not found" }, { name: "robots", content: "noindex" }] };
    return {
      meta: [
        { title: tool.metaTitle },
        { name: "description", content: tool.metaDescription },
        { property: "og:title", content: tool.metaTitle },
        { property: "og:description", content: tool.metaDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/tools/${params.category}/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/tools/${params.category}/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: tool.name,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            description: tool.metaDescription,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: tool.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: ToolPage,
  notFoundComponent: () => (
    <SiteChrome>
      <div className="container section" style={{ textAlign: "center" }}>
        <h1>Tool not found</h1>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </SiteChrome>
  ),
});

function ToolPage() {
  const { tool, cat } = Route.useLoaderData();
  const wide = tool.slug === "word-counter";

  useEffect(() => {
    track("tool_viewed", { slug: tool.slug });
  }, [tool.slug]);

  const Body = (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: cat.name, to: "/tools/$category", params: { category: cat.id } },
          { label: tool.name },
        ]}
      />
      <h1>{tool.h1}</h1>
      <p className="prose" style={{ marginBottom: 20 }}>{tool.intro}</p>

      <ToolIsland slug={tool.slug} />

      <section aria-labelledby="how-heading" style={{ marginTop: 40 }}>
        <h2 id="how-heading">How to use</h2>
        <ol style={{ paddingLeft: 20, color: "var(--muted)" }}>
          {tool.howTo.map((s: string, i: number) => (
            <li key={i} style={{ marginBottom: 8 }}>{s}</li>
          ))}
        </ol>
      </section>

      <RelatedTools slugs={tool.related} />

      <section className="faq" aria-labelledby="faq-heading" style={{ marginTop: 40 }}>
        <h2 id="faq-heading">Frequently asked questions</h2>
        {tool.faqs.map((f, i) => (
          <details key={i}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      <section aria-labelledby="about-heading" style={{ marginTop: 40 }}>
        <h2 id="about-heading">About this tool</h2>
        <p className="prose">
          {tool.name} is a free, browser-based tool from Tools Platform. It runs entirely on your device — your data
          is never uploaded to a server, so it stays completely private. There are no accounts, no watermarks, and no
          limits. {tool.intro}
        </p>
      </section>
    </>
  );

  return (
    <SiteChrome>
      <div className={wide ? "container section" : "tool-column section"}>{Body}</div>
    </SiteChrome>
  );
}
