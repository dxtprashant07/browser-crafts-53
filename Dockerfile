# syntax=docker/dockerfile:1

# ---- Build stage: install with bun (respects bun.lock), produce dist/ ----
FROM oven/bun:1 AS builder
WORKDIR /app

# Install deps first for better layer caching.
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# Build the client + SSR bundle.
COPY . .
RUN bun run build

# ---- Runtime stage: Node serves the built app; no node_modules needed ----
# The SSR bundle is fully self-contained and server.mjs uses only Node builtins.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/package.json ./package.json

# Run as the built-in non-root user.
USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
