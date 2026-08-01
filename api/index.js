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
    const response = await handler.fetch(toWebRequest(req), {}, {});
    const headers = {
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "referrer-policy": "strict-origin-when-cross-origin",
    };
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
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
