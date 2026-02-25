# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM oven/bun:1.3.9-alpine AS builder
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json bun.lock turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY packages/types/package.json ./packages/types/
COPY packages/sdk/package.json ./packages/sdk/

RUN bun install --frozen-lockfile

# Copy source
COPY apps/web ./apps/web
COPY packages/types ./packages/types

# NEXT_PUBLIC_* vars are baked into the JS bundle at build time.
# Pass the real URLs here — for Coolify set these in the service build args.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

WORKDIR /app/apps/web
RUN bun run build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Use plain Node — standalone output has everything it needs, no bun required.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output already contains the server + traced node_modules.
# Because outputFileTracingRoot points to the monorepo root, the server lives
# at apps/web/server.js inside the standalone directory.
COPY --from=builder /app/apps/web/.next/standalone ./

# Static assets are NOT included in standalone — copy them separately.
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
