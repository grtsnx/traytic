# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM oven/bun:1.3.9-alpine AS deps
WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json bun.lock turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/nest-cli.json apps/api/tsconfig.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/types/package.json ./packages/types/
COPY packages/sdk/package.json ./packages/sdk/

RUN bun install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY apps/api/src ./apps/api/src
COPY packages/types/src ./packages/types/src

WORKDIR /app/apps/api

# Generate Prisma client (uses devDep prisma CLI, available from full install)
RUN bunx prisma generate --schema=./src/databases/prisma/schema.prisma

# Compile TypeScript → dist/
RUN bun run build

# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM oven/bun:1.3.9-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Compiled output
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Prisma schema (needed for migrate deploy at startup)
COPY --from=builder /app/apps/api/src/databases/prisma ./apps/api/prisma

# Generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma CLI (needed to run migrate deploy)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Production runtime node_modules
# NestJS and all production deps
COPY --from=builder /app/node_modules ./node_modules

# Package manifests (for module resolution)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json
COPY --from=builder /app/packages/types/src ./packages/types/src

COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["sh", "./entrypoint.sh"]
