import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absUrl } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Subtrate" },
      {
        name: "description",
        content: "Terms of use for Subtrate's free, browser-based tools.",
      },
      { property: "og:url", content: absUrl("/terms") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absUrl("/terms") }],
  }),
  component: () => (
    <SiteChrome>
      <div className="tool-column section prose">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Terms" }]} />
        <h1>Terms of use</h1>
        <p>
          Subtrate provides free, browser-based utilities on an "as is" basis, without warranties of
          any kind.
        </p>
        <h2>Acceptable use</h2>
        <p>
          You may use these tools for any lawful purpose. Because processing happens on your own
          device, you are responsible for the files and content you process.
        </p>
        <h2>No liability</h2>
        <p>
          We are not liable for any loss or damage arising from the use of these tools. Always keep
          backups of important files.
        </p>
      </div>
    </SiteChrome>
  ),
});
