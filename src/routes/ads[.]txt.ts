import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ADSENSE_CLIENT } from "@/lib/ads";

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        // ADSENSE_CLIENT is "ca-pub-XXXX"; ads.txt wants the "pub-XXXX" form.
        const pubId = ADSENSE_CLIENT.replace(/^ca-/, "");
        const body = pubId ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n` : "";
        return new Response(body, {
          headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
