#!/bin/sh
set -e

echo "╔══════════════════════════════════╗"
echo "║        Traytic API               ║"
echo "╚══════════════════════════════════╝"

echo ""
echo "→ Running database migrations..."
cd /app/apps/api
/app/node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma

echo "→ Starting API on port ${PORT:-3001}..."
exec node /app/apps/api/dist/main
