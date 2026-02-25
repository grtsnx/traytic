# Traytic

Open-source, privacy-first analytics platform. A self-hostable alternative to Vercel Analytics and Cloudflare Analytics — built for developers, captured in real time.

```bash
bun add @traytic/analytics
```

```tsx
// app/layout.tsx — analytics start immediately
import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics siteId="your_site_id" />
      </body>
    </html>
  )
}
```

---

## Features

- **Real-time** — live visitor counts via SSE, no polling
- **Privacy-first** — no cookies, no raw IP storage, GDPR-friendly fingerprinting
- **Web Vitals** — LCP, CLS, INP, TTFB, FCP per route with P75/P95 breakdown
- **Custom events** — typed event tracking with `track('signup', { plan: 'pro' })`
- **Bot filtering** — server-side UA + pattern detection
- **Self-hostable** — one `docker compose up` and you're running
- **Dual payments** — Paystack for Africa (NGN/GHS/KES/ZAR), Polar for everywhere else (USD/EUR)
- **Framework adapters** — Next.js, React, and more

---

## Monorepo Structure

```
traytic/
├── apps/
│   ├── web/          # Next.js dashboard + landing (port 3000)
│   └── api/          # NestJS collector + REST API (port 3001)
├── packages/
│   ├── sdk/          # @traytic/analytics — the npm package
│   └── types/        # @traytic/types — shared TypeScript types
├── docker-compose.yml
└── turbo.json
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Dashboard | Next.js 15, React 19, Tailwind v4, Shadcn |
| API | NestJS 10, Fastify |
| Events DB | ClickHouse (columnar, real-time aggregations) |
| Relational DB | PostgreSQL + Prisma |
| Auth | Better Auth |
| Real-time | Server-Sent Events (SSE) |
| SDK | TypeScript + web-vitals, built with tsup |
| Payments (Africa) | Paystack (NGN, GHS, KES, ZAR) |
| Payments (Global) | Polar (USD, EUR) |
| Monorepo | Bun workspaces + Turborepo |
| Self-host | Docker Compose |

---

## Local Development

### Prerequisites

- Bun >= 1.1 — [bun.sh](https://bun.sh)
- Docker + Docker Compose

### 1. Clone and install

```bash
git clone https://github.com/traytic/traytic
cd traytic
bun install
```

### 2. Start databases

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on `localhost:5432`
- **ClickHouse** on `localhost:8123`
- **Redis** on `localhost:6379`

### 3. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` and fill in your secrets. The `.env.example` files show exactly what's needed — they're safe to commit because they contain no real values.

### 4. Run Prisma migrations

```bash
cd apps/api && bun run prisma:migrate
```

### 5. Run ClickHouse migrations

```bash
docker exec -i traytic_clickhouse clickhouse-client \
  --database traytic \
  < apps/api/src/databases/clickhouse/migrations/001_create_events.sql
```

### 6. Start dev servers

```bash
bun dev
```

- Dashboard: http://localhost:3000
- API: http://localhost:3001
- Swagger docs: http://localhost:3001/docs

---

## Data Flow

```
User's website (SDK)
  └── POST /collect  →  NestJS API
                            ├── enrich: IP → geo, UA → device/browser
                            ├── filter bots
                            ├── async insert → ClickHouse
                            └── emit → SSE stream
                                          └── Dashboard live updates
```

### Databases

**PostgreSQL** — relational business data:
- Users, organizations, sessions
- Sites, API keys
- Subscriptions, invoices
- Goals, alerts

**ClickHouse** — all analytics events:
- Pageviews, custom events, web vitals, errors
- Partitioned by month, ordered by `(site_id, ts)`
- Aggregation queries in milliseconds at scale

---

## API Reference

### Collect endpoint (public)

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

Returns `204 No Content` immediately. All processing is async.

### Stats endpoints (authenticated)

```
GET /api/events/:siteId/overview?period=30d
GET /api/events/:siteId/timeseries?period=7d
GET /api/events/:siteId/pages?period=30d
GET /api/events/:siteId/sources?period=30d
GET /api/events/:siteId/countries?period=30d
GET /api/events/:siteId/devices?period=30d
GET /api/events/:siteId/vitals?period=30d
GET /api/events/:siteId/live
```

Period options: `24h` | `7d` | `30d` | `90d`

### Real-time stream

```
GET /api/stream/:siteId   (SSE)
```

Streams pageview events as they arrive. Connect from the dashboard:

```ts
const es = new EventSource(`/api/stream/${siteId}`)
es.onmessage = (e) => console.log(JSON.parse(e.data))
```

---

## SDK Usage

### Next.js (App Router)

```tsx
import { Analytics } from '@traytic/analytics/next'

// app/layout.tsx
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
  endpoint="https://your-api.com/collect"
/>
```

### Privacy options

```tsx
<Analytics
  siteId="your_site_id"
  respectDnt={true}    // honour browser Do Not Track (default: true)
  hashPaths={true}     // /users/123 → /users/[id]
/>
```

---

## Payments

Traytic automatically routes users to the right payment processor based on country:

| Region | Processor | Currencies |
|---|---|---|
| Nigeria, Ghana, Kenya, South Africa + 4 more | Paystack | NGN, GHS, KES, ZAR |
| Rest of world | Polar | USD, EUR |

### Plans

| Plan | USD | NGN | Events | Retention |
|---|---|---|---|---|
| Free | $0 | ₦0 | 10k/mo | 6 months |
| Pro | $9/mo | ₦14,900/mo | Unlimited | 2 years |
| Team | $29/mo | ₦44,900/mo | Unlimited | 2 years + team features |

---

## Self-Hosting

```bash
docker compose up -d
```

All services are defined in `docker-compose.yml`. Configure via environment variables.

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

Issues and PRs welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT
