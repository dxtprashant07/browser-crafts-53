import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absUrl } from "@/lib/site";
import { TOOLS } from "@/data/registry";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Subtrate" },
      {
        name: "description",
        content: `Why Subtrate exists: ${TOOLS.length} free, browser-only tools with no uploads, no accounts, no paywalls.`,
      },
      { property: "og:url", content: absUrl("/about") },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: absUrl("/about") }],
  }),
  component: () => (
    <SiteChrome>
      <div className="tool-column section prose">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />
        <h1>About Subtrate</h1>
        <p>
          Subtrate is {TOOLS.length} small, free tools — image, PDF, text, developer, and generator
          utilities — that all run entirely in your browser. No file or text you touch here is ever
          uploaded to a server.
        </p>
        <h2>Why client-side only</h2>
        <p>
          Most "free online tools" quietly upload your file to do the work, then delete it (or
          don't). Subtrate does the processing with your browser's own JavaScript, canvas, and
          WebAssembly APIs — the file never leaves your device, so there's nothing to trust us with
          in the first place.
        </p>
        <h2>What we won't do</h2>
        <p>
          No account walls, no artificial usage limits, no ads before you get your result. One ad
          slot, shown after — never blocking the tool itself.
        </p>
        <h2>What's next</h2>
        <p>
          New tools ship regularly. See what's currently planned on the{" "}
          <a href="/#roadmap">roadmap</a>.
        </p>
      </div>
    </SiteChrome>
  ),
});
