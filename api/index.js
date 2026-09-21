// Vercel serverless entry. Adapts Node's http req/res to the Web-standard
// Request/Response that the built SSR handler (dist/server/server.js) speaks.
// Static assets under dist/client are served by Vercel's CDN directly
// (see outputDirectory in vercel.json); only non-static routes reach here.

import { Readable } from "node:stream";
import handler from "../dist/server/server.js";

function toWebRequest(req) {
  const host = req.headers.host || "localhost";
  const url = `https://${host}${req.url}`;
  const method = req.method || "GET";
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) v.forEach((val) => headers.append(k, val));
    else if (v != null) headers.set(k, v);
  }
  const hasBody = method !== "GET" && method !== "HEAD";
  return new Request(url, {
    method,
    headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? "half" : undefined,
  });
}

export default async function (req, res) {
  try {
    // Security headers are set centrally in vercel.json (applies to static
    // assets too, which this function never sees) — not duplicated here.
    const response = await handler.fetch(toWebRequest(req), {}, {});
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    // Every page here renders from the static tool registry — no cookies, no
    // per-user data — so successful GETs are safe to cache on Vercel's edge.
    // `max-age` alone only controls the browser; Vercel's CDN keys off
    // `s-maxage`. Without it every request (including crawlers) recomputes
    // SSR from cold, which is what was producing multi-second TTFB.
    if (req.method === "GET" && response.status === 200) {
      headers["cache-control"] = "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400";
    }
    res.writeHead(response.status, headers);
    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain" });
    res.end("Internal Server Error");
  }
}
