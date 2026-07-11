import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Tools Platform" },
      {
        name: "description",
        content:
          "How Tools Platform handles your data: it doesn't. Every tool runs in your browser.",
      },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <SiteChrome>
      <div className="tool-column section prose">
        <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy" }]} />
        <h1>Privacy</h1>
        <p>
          Tools Platform is built to be private by design. Every tool runs entirely in your browser
          using client-side JavaScript.
        </p>
        <h2>Your files stay on your device</h2>
        <p>
          When you compress an image, merge a PDF, or format JSON, the file or text is processed
          locally. No file data or text content is ever sent to a server.
        </p>
        <h2>What we store</h2>
        <p>
          The only things saved to your browser's local storage are your dark-mode preference and,
          for the Word Counter, an autosaved draft. These never leave your device and you can clear
          them anytime.
        </p>
        <h2>Analytics</h2>
        <p>
          We may use privacy-friendly, aggregate analytics to understand which tools are popular.
          These never include your file contents or text.
        </p>
      </div>
    </SiteChrome>
  ),
});
