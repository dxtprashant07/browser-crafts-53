// Production server for the built app.
//
// The build emits a Web-standard fetch handler (dist/server/server.js) plus a
// static client bundle (dist/client). This adapter serves hashed static assets
// straight from disk and hands everything else to the SSR handler, bridging
// Node's http req/res to the WHATWG Request/Response the handler speaks.
//
// Runtime deps: none beyond Node 20+ (global Request/Response/ReadableStream).

import { createServer } from "node:http";
import { Readable } from "node:stream";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, normalize, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const clientDir = join(root, "dist", "client");
const serverEntry = join(root, "dist", "server", "server.js");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

const { default: handler } = await import(pathToFileURL(serverEntry).href);

// Resolve a URL path to a real file inside dist/client, guarding against
// path traversal. Returns null when there is no matching static file.
function resolveStatic(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = normalize(decoded)
    .replace(/^(\.\.[/\\])+/, "")
    .replace(/^[/\\]+/, "");
  const filePath = join(clientDir, rel);
  if (!filePath.startsWith(clientDir)) return null;
  if (existsSync(filePath) && statSync(filePath).isFile()) return filePath;
  return null;
}

function serveStatic(res, filePath) {
  const ext = extname(filePath).toLowerCase();
  const type = MIME[ext] || "application/octet-stream";
  // Vite emits content-hashed filenames under /assets — safe to cache forever.
  const immutable = filePath.includes(`${join("dist", "client", "assets")}`);
  res.writeHead(200, {
    "content-type": type,
    "cache-control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=3600",
  });
  createReadStream(filePath).pipe(res);
}

function toWebRequest(req) {
  const url = `http://${req.headers.host || `${HOST}:${PORT}`}${req.url}`;
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

async function sendWebResponse(res, response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  res.writeHead(response.status, headers);
  if (response.body) {
    Readable.fromWeb(response.body).pipe(res);
  } else {
    res.end();
  }
}

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "SAMEORIGIN",
  "referrer-policy": "strict-origin-when-cross-origin",
  "cross-origin-opener-policy": "same-origin",
  "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
};

const server = createServer(async (req, res) => {
  try {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(key, value);
    }

    // Health check for load balancers / platform probes.
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok");
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      const filePath = resolveStatic(req.url);
      if (filePath) {
        serveStatic(res, filePath);
        return;
      }
    }

    const response = await handler.fetch(toWebRequest(req), {}, {});
    await sendWebResponse(res, response);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain" });
    res.end("Internal Server Error");
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
