# Tools Platform

Fast, private browser tools for images, PDFs, text, and code. Every tool runs
100% client-side — files never leave the device. Built with TanStack Start
(React 19) + Vite, server-rendered for SEO.

## Requirements

- [Bun](https://bun.sh) (respects `bun.lock`) **or** Node 20+ / npm
- Node 20+ at runtime (the production server uses only Node builtins)

## Local development

```bash
bun install
bun run dev          # http://localhost:3000 (Vite dev server)
```

## Scripts

| Script              | Does                                          |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Vite dev server with HMR                      |
| `bun run build`     | Build client + SSR bundle into `dist/`        |
| `bun run start`     | Serve the built app (`server.mjs`, port 3000) |
| `bun run typecheck` | `tsc --noEmit`                                |
| `bun run lint`      | ESLint + Prettier check                       |
| `bun run format`    | Prettier write                                |

## Production build & run

```bash
bun run build
bun run start        # -> http://localhost:3000
```

`server.mjs` is a dependency-free Node adapter: it serves hashed static assets
from `dist/client` (immutable caching) and forwards everything else to the SSR
handler in `dist/server`. Configurable via env:

- `PORT` (default `3000`)
- `HOST` (default `0.0.0.0`)
- `GET /healthz` returns `200 ok` for load-balancer probes

## Docker

```bash
docker build -t tools-platform .
docker run -p 3000:3000 tools-platform
```

Multi-stage: builds with Bun, runs on `node:22-alpine` as a non-root user with a
built-in healthcheck. The SSR bundle is self-contained, so the runtime image
ships no `node_modules`.

## Deploy

- **Any Docker host** (Render, Railway, Fly.io, Cloud Run, ECS): build the
  `Dockerfile`. `render.yaml` is included for Render Blueprint one-click deploy.
- **GHCR image**: pushed automatically on every `main` push / `v*` tag by
  `.github/workflows/docker-publish.yml` to
  `ghcr.io/<owner>/<repo>:latest`.
- **VPS / bare Node**: `bun run build` (or `npm run build`), copy `dist/` +
  `server.mjs` + `package.json`, then `node server.mjs` behind a reverse proxy.

## CI/CD

- `.github/workflows/ci.yml` — lint, typecheck, build on every push/PR to
  `main`; uploads the `dist` artifact.
- `.github/workflows/docker-publish.yml` — builds and pushes the container image
  to GHCR (uses the built-in `GITHUB_TOKEN`, no extra secrets).
