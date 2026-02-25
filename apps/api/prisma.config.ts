import { defineConfig } from 'prisma/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Prisma 7 evaluates this file before loading .env — parse it manually.
// Use process.cwd() (not __dirname) because this runs as ESM.
try {
  const lines = readFileSync(join(process.cwd(), '.env'), 'utf8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["'](.*)["']$/, '$1');
    if (!process.env[k]) process.env[k] = v;
  }
} catch {}

export default defineConfig({
  schema: 'src/databases/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrate: {
    async adapter(env) {
      const pool = new Pool({ connectionString: env['DATABASE_URL'] });
      return new PrismaPg(pool);
    },
  },
});
