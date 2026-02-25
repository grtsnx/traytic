# Traytic

Open-source, privacy-first analytics platform. A self-hostable alternative to Vercel Analytics and Cloudflare Analytics — built for developers, captured in real time.

```bash
npm install @traytic/analytics
```

```tsx
// app/layout.tsx
import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics siteId={process.env.NEXT_PUBLIC_TRAYTIC_SITE_ID!} />
      </body>
    </html>
  )
}
```

---

## Features

- **Real-time** — live visitor counts via SSE, no polling
- **Privacy-first** — no cookies, no raw IP storage, GDPR-compliant fingerprinting via daily-rotating SHA-256 hash
- **Web Vitals** — LCP, CLS, INP, TTFB, FCP per route with P75/P95 breakdown
- **Custom events** — `track('signup', { plan: 'pro' })`
- **Bot filtering** — server-side UA pattern detection
- **Self-hostable** — one `docker compose up` and everything is running
- **Dual payments** — Paystack for Africa (NGN/GHS/KES/ZAR), Polar for everywhere else (USD/EUR)
- **Framework adapters** — Next.js App Router, React SPA, more coming

---

## Monorepo Structure

```
traytic/
├── apps/
│   ├── web/          # Next.js 15 dashboard + landing  (port 3000)
│   └── api/          # NestJS 10 + Fastify collector    (port 3001)
├── packages/
│   ├── sdk/          # @traytic/analytics — the npm package  (<3kb)
│   └── types/        # @traytic/types — shared TypeScript types
├── docker-compose.yml
└── turbo.json
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Dashboard | Next.js 15, React 19, Tailwind v4, shadcn/ui |
| API | NestJS 10, Fastify |
| Events DB | ClickHouse (columnar, real-time aggregations) |
| Relational DB | PostgreSQL + Prisma |
| Auth | Better Auth |
| Real-time | Server-Sent Events (SSE) |
| SDK | TypeScript + tsup (ESM + CJS, <3kb) |
| Payments (Africa) | Paystack (NGN, GHS, KES, ZAR) |
| Payments (Global) | Polar (USD, EUR) |
| Monorepo | Bun 1.3.9 workspaces + Turborepo |
| Self-host | Docker Compose |

---

## Quick Start (Docker)

The fastest way to run Traytic. One command spins up everything — databases, API, and web app.

### 1. Clone

```bash
git clone https://github.com/traytic/traytic
cd traytic
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set **one required value**:

```env
BETTER_AUTH_SECRET=your_random_32_char_string_here
```

Generate one with: `openssl rand -hex 32`

Everything else (database URLs, ports, hostnames) is pre-configured for Docker and works out of the box.

### 3. Build and run

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Web dashboard | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger docs | http://localhost:3001/docs |

> Prisma migrations run automatically on first API startup via `entrypoint.sh`.
> ClickHouse schema is applied automatically via the `docker-entrypoint-initdb.d` mount.

---

## Local Development

For active development with hot-reload on your host machine.

### Prerequisites

- [Bun](https://bun.sh) >= 1.1
- Docker + Docker Compose

### 1. Install dependencies

```bash
bun install
```

### 2. Start databases only

```bash
docker compose up postgres clickhouse redis -d
```

### 3. Configure environment

```bash
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env`:
- Set `BETTER_AUTH_SECRET` to any 32+ char string
- DB connection strings already point to `localhost` and match the Docker defaults — no changes needed

### 4. Run Prisma migrations

```bash
cd apps/api && bun run prisma:migrate
```

### 5. Start all dev servers

```bash
bun dev
```

Hot-reload is active for both `apps/web` and `apps/api`.

---

## Deploying to Coolify

1. Point Coolify at your repo and select **Docker Compose** as the deployment method
2. Set these environment variables in Coolify's UI:

```env
BETTER_AUTH_SECRET=<generated secret>

# Set to your actual public domains
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
BETTER_AUTH_URL=https://api.yourdomain.com
APP_URL=https://yourdomain.com
API_URL=https://api.yourdomain.com
```

> `NEXT_PUBLIC_*` variables are baked into the JS bundle at build time. If you change your domain later, trigger a rebuild of the `web` service.

---

## Data Flow

```
User's website (SDK)
  └── POST /collect  ──►  NestJS API
                              ├── filter bots (UA regex)
                              ├── enrich: IP → geo, UA → device/browser
                              ├── build visitor_id: SHA256(siteId+ip+ua+date)
                              ├── async insert ──► ClickHouse
                              └── emit ──► SSE stream ──► Dashboard live view
```

### Databases

**PostgreSQL** — relational / business data:
Users, orgs, sessions, sites, API keys, subscriptions, invoices, goals, alerts

**ClickHouse** — analytics events:
Pageviews, custom events, web vitals, errors. Partitioned by month, ordered by `(site_id, ts)`. Aggregation queries return in milliseconds at any scale.

---

## API Reference

### Collect (public, no auth)

```
POST /collect
Content-Type: application/json

{
  "siteId": "your_site_id",
  "events": [
    {
      "type": "pageview",
      "url": "https://yoursite.com/blog/hello",
      "referrer": "https://google.com"
    }
  ]
}
```

Returns `204 No Content`. All processing is async.

### Stats (authenticated)

```
GET /api/events/:siteId/overview?period=30d
GET /api/events/:siteId/timeseries?period=7d
GET /api/events/:siteId/pages?period=30d
GET /api/events/:siteId/sources?period=30d
GET /api/events/:siteId/countries?period=30d
GET /api/events/:siteId/devices?period=30d
GET /api/events/:siteId/vitals?period=30d
```

Period options: `24h` | `7d` | `30d` | `90d`

### Real-time stream (SSE)

```
GET /api/stream/:siteId
```

```ts
const es = new EventSource(`/api/stream/${siteId}`)
es.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## SDK

### Next.js (App Router)

```tsx
import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics siteId={process.env.NEXT_PUBLIC_TRAYTIC_SITE_ID!} />
      </body>
    </html>
  )
}
```

### Custom events

```ts
import { track } from '@traytic/analytics'

track('signup', { plan: 'pro', source: 'landing' })
track('purchase', { product: 'shirt', value: '49.99' })
```

### Self-hosted endpoint

```tsx
<Analytics
  siteId="your_site_id"
  endpoint="https://your-api.example.com/collect"
/>
```

### Privacy options

```tsx
<Analytics
  siteId="your_site_id"
  respectDnt={true}   // honour browser Do Not Track (default: true)
  hashPaths={true}    // /users/123 → /users/[id]
/>
```

---

## Pricing

| Plan | USD | NGN | Events/mo | Retention |
|---|---|---|---|---|
| Free (self-host) | $0 | ₦0 | Unlimited | Unlimited |
| Pro | $9/mo | ₦14,900/mo | 5M | 2 years |
| Team | $29/mo | ₦44,900/mo | 50M | 2 years + team features |

Traytic automatically routes users to the right payment processor:

| Region | Processor | Currencies |
|---|---|---|
| Nigeria, Ghana, Kenya, South Africa | Paystack | NGN, GHS, KES, ZAR |
| Rest of world | Polar | USD, EUR |

---

## Roadmap

- [ ] Dashboard UI (charts, tables, live view)
- [ ] Auth flow (signup, login, org management)
- [ ] GeoIP integration (MaxMind)
- [ ] Goals & funnels
- [ ] Alerts (email + Slack)
- [ ] Astro, Vue, Svelte adapters
- [ ] CLI (`bunx traytic dev`)

---

## Contributing

Issues and PRs welcome.

---

## License

MIT
