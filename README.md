<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-light.svg" />
  <source media="(prefers-color-scheme: light)" srcset="assets/logo.svg" />
  <img src="assets/logo.svg" height="52" alt="Traytic" />
</picture>

<p>Privacy-first, open-source web analytics.<br>No cookies. No PII. Self-hostable in one command.</p>

[![License: AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-7c3aed?style=flat-square)](LICENSE) &nbsp; [![Bun](https://img.shields.io/badge/bun-1.3.9-fbf0df?style=flat-square&logo=bun)](https://bun.sh) &nbsp; [![Self-hostable](https://img.shields.io/badge/self--hostable-yes-4ade80?style=flat-square)]()

[Features](#features) &nbsp;·&nbsp; [Quick start](#quick-start-docker) &nbsp;·&nbsp; [SDK](#sdk) &nbsp;·&nbsp; [API](#api-reference) &nbsp;·&nbsp; [Roadmap](#roadmap)

</div>

---

```bash
npm install @traytic/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      <Analytics siteId="your-site-id" />
    </body></html>
  )
}
```

---

## Features

- **Real-time** — live visitor counts via SSE, no polling
- **Privacy-first** — no cookies, no raw IP storage, daily-rotating SHA-256 visitor fingerprint
- **Web Vitals** — LCP, CLS, INP, TTFB, FCP per route
- **Custom events** — `track('signup', { plan: 'pro' })`
- **Bot filtering** — server-side UA detection
- **Social auth** — GitHub, Google, or email + password
- **Dual billing** — Paystack for Africa (NGN/GHS/KES/ZAR), Polar everywhere else (USD/EUR)
- **Self-hostable** — `docker compose up` and everything runs

---

## Stack

| Layer | Technology |
|---|---|
| Web | Next.js 15 (App Router) |
| API | NestJS 10 + Fastify |
| Analytics DB | ClickHouse — partitioned by month |
| App DB | PostgreSQL + Prisma 7 |
| Cache | Redis |
| Auth | Better Auth |
| Real-time | Server-Sent Events (SSE) |
| SDK | `@traytic/analytics` — ESM + CJS, < 3 kB |
| Monorepo | Bun 1.3.9 workspaces + Turborepo |

---

## Plans

| Plan | Sites | Events / month | Price |
|---|---|---|---|
| Free | 1 | 50 000 | Free — no card |
| Pro | 10 | 1 000 000 | $5 · ₦7 900 / month |
| Team | Unlimited | 10 000 000 | $19 · ₦29 900 / month |

---

## Quick start (Docker)

```bash
# 1. Clone
git clone https://github.com/traytic/traytic && cd traytic

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — set BETTER_AUTH_SECRET at minimum
# Generate one: openssl rand -hex 32

# 3. Start everything (databases + API + web)
docker compose up --build
```

| URL | Service |
|---|---|
| http://localhost:3000 | Web |
| http://localhost:3001 | API |
| http://localhost:3001/docs | Swagger |

The API container runs `prisma migrate deploy` automatically on startup.
ClickHouse schema is applied automatically from `docker-entrypoint-initdb.d`.

---

## Local development

**Requirements:** Bun ≥ 1.3.9 · Docker

```bash
# Install dependencies
bun install

# Start databases only
docker compose up postgres clickhouse redis -d

# Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Set BETTER_AUTH_SECRET in apps/api/.env

# Run migrations
cd apps/api && bun run prisma:migrate && cd ../..

# Start all apps with hot reload
bun dev
```

---

## Environment variables

For **Docker**, all variables are read from `.env` at the project root (copy from `.env.example`).
For **local development**, API variables live in `apps/api/.env` and web variables in `apps/web/.env`.

### Required

```env
DATABASE_URL=postgresql://traytic:traytic_secret@localhost:5432/traytic
BETTER_AUTH_SECRET=<random 32-char string — run: openssl rand -hex 32>
```

### Social auth (optional)

Create OAuth apps and set the callback URLs below, then fill in the credentials:

| Provider | Callback URL |
|---|---|
| GitHub | `http://localhost:3001/api/auth/callback/github` |
| Google | `http://localhost:3001/api/auth/callback/google` |

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Leave blank to show only email/password on the auth forms.

### Billing (optional)

```env
# Africa — https://dashboard.paystack.com
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_WEBHOOK_SECRET=

# Global — https://polar.sh
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=
POLAR_ORGANIZATION_ID=
```

Register webhook endpoints in your provider dashboards:

| Provider | Webhook URL |
|---|---|
| Paystack | `https://your-api-domain/api/billing/webhooks/paystack` |
| Polar | `https://your-api-domain/api/billing/webhooks/polar` |

---

## Project structure

```
traytic/
├── apps/
│   ├── api/                    # NestJS API (port 3001)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Better Auth + session guard
│   │   │   │   ├── sites/      # Sites CRUD + plan limits
│   │   │   │   ├── collect/    # POST /collect — no auth, rate-limited
│   │   │   │   ├── events/     # ClickHouse query endpoints
│   │   │   │   ├── stream/     # SSE real-time feed
│   │   │   │   └── billing/    # Paystack + Polar checkout + webhooks
│   │   │   └── databases/
│   │   │       ├── prisma/     # Schema + migrations
│   │   │       └── clickhouse/ # Events table DDL
│   │   ├── Dockerfile
│   │   └── entrypoint.sh       # migrate deploy → start server
│   └── web/                    # Next.js app (port 3000)
│       ├── app/                # Routes (page.tsx wrappers + layout)
│       ├── views/              # Full-page view components
│       └── lib/                # ThemeProvider
├── packages/
│   ├── sdk/                    # @traytic/analytics npm package
│   └── types/                  # Shared TypeScript types
└── docker-compose.yml
```

---

## Data flow

```
User's browser (SDK)
  └── POST /collect
        ├── drop bots (UA regex)
        ├── visitor_id = SHA256(siteId + ip + ua + date)  — no PII stored
        ├── insert → ClickHouse (async, fire-and-forget)
        └── emit  → SSE stream → live dashboard
```

---

## SDK

### Next.js

```tsx
import { Analytics } from '@traytic/analytics/next'

<Analytics siteId="your-site-id" />
```

### React (other frameworks)

```tsx
import { Analytics } from '@traytic/analytics/react'

<Analytics siteId="your-site-id" />
```

### Custom events

```ts
import { track } from '@traytic/analytics'

track('signup', { plan: 'pro' })
track('purchase', { value: '49.99' })
```

### Self-hosted endpoint

```tsx
<Analytics siteId="your-site-id" endpoint="https://api.yourdomain.com/collect" />
```

---

## Deployment (Coolify / Railway / Fly)

1. Point your host at the repo, pick **Docker Compose** deployment.
2. Set environment variables — at minimum:

```env
BETTER_AUTH_SECRET=<secret>
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
BETTER_AUTH_URL=https://api.yourdomain.com
APP_URL=https://yourdomain.com
```

3. `NEXT_PUBLIC_*` vars are baked into the JS bundle at build time. Change domain → trigger a web rebuild.

---

## API reference

### Collect (public, no auth)

```
POST /collect
{ "siteId": "...", "events": [{ "type": "pageview", "url": "...", "referrer": "..." }] }
```

Returns `204`. Processing is async.

### Stats (authenticated)

```
GET /api/events/:siteId/overview?period=30d
GET /api/events/:siteId/timeseries?period=7d
GET /api/events/:siteId/pages
GET /api/events/:siteId/sources
GET /api/events/:siteId/countries
GET /api/events/:siteId/devices
GET /api/events/:siteId/vitals
```

Periods: `24h` · `7d` · `30d` · `90d`

### Real-time (SSE)

```ts
const es = new EventSource(`/api/stream/${siteId}`, { withCredentials: true })
es.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## Roadmap

- [x] SDK — Next.js and React adapters, `< 3 kB`, ESM + CJS, Web Vitals, custom events
- [x] Event collection — bot filtering, privacy fingerprinting (SHA-256, daily-rotating), Web Vitals
- [x] Real-time — SSE live visitor count via RxJS stream
- [x] Auth — email + password, GitHub and Google OAuth, password reset via email (Better Auth)
- [x] Billing — Paystack (Africa) + Polar (global), checkout and webhooks
- [x] Dashboard UI — metric cards, timeseries chart, top pages & sources, devices & countries
- [x] Landing page, onboarding, upgrade, billing success, and password reset pages
- [ ] Wire dashboard to live API (currently shows mock data)
- [ ] Dashboard multi-view navigation — realtime, pages, sources tabs
- [ ] GeoIP — MaxMind installed, not wired into collect pipeline
- [ ] Goals & funnels (schema exists, needs API + UI)
- [ ] Alerts — email + Slack (schema exists, needs API + UI)
- [ ] Live visitor map
- [ ] Astro, Vue, Svelte SDK adapters
- [ ] CLI — `bunx traytic dev`
- [ ] Team / organization management

---

## License

[GNU AGPL-3.0](LICENSE)
