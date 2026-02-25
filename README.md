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
import { Analytics } from '@traytic/analytics/next'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

That's it. No site ID, no endpoint, no config. The SDK auto-detects your site by domain.

---

## Features

- **Zero-config SDK** — `<Analytics />` and done. Site resolved by domain, endpoint auto-configured
- **Real-time** — live visitor count (polled every 10 s) + SSE stream from collect pipeline
- **Privacy-first** — no cookies, no raw IP storage, daily-rotating SHA-256 visitor fingerprint
- **Web Vitals** — LCP, CLS, INP, TTFB, FCP per route, with p75/p95 and good-rate reporting
- **Custom events** — `track('signup', { plan: 'pro' })` with arbitrary metadata
- **UTM tracking** — automatic `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` capture
- **Bot filtering** — server-side UA regex (drops bots, crawlers, headless browsers)
- **Referrer parsing** — known-source detection (Google, Bing, Twitter/X, Facebook, LinkedIn, Reddit, GitHub, YouTube)
- **SPA navigation** — automatic `pushState`/`popstate` tracking for single-page apps
- **Social auth** — GitHub, Google, or email + password (Better Auth)
- **Team management** — organizations with OWNER / ADMIN / MEMBER roles, email invitations, member CRUD
- **Guided onboarding** — signup → create org → invite team → add site → verify tracking
- **Dual billing** — Paystack for Africa (NGN/GHS/KES/ZAR), Polar everywhere else (USD/EUR)
- **Self-hostable** — `docker compose up` and everything runs

---

## Stack

| Layer | Technology |
|---|---|
| Web | Next.js 15 (App Router) |
| API | NestJS 10 + Fastify |
| Analytics DB | ClickHouse — partitioned by month, 2-year TTL |
| App DB | PostgreSQL + Prisma 7 |
| Cache | Redis |
| Auth | Better Auth |
| Real-time | Server-Sent Events (SSE) via RxJS |
| SDK | `@traytic/analytics` — ESM + CJS, < 3 kB, `sendBeacon` first |
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

### Email (optional)

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM_DOMAIN=yourdomain.com
```

Sign up at [resend.com](https://resend.com), create an API key, and verify your sending domain. Emails are sent for password resets and team invitations.

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
│   │   │   │   ├── stream/     # SSE real-time feed (RxJS)
│   │   │   │   ├── orgs/       # Organization + member + invitation CRUD
│   │   │   │   └── billing/    # Paystack + Polar checkout + webhooks
│   │   │   └── databases/
│   │   │       ├── prisma/     # Schema + migrations (PostgreSQL)
│   │   │       └── clickhouse/ # Events table DDL
│   │   ├── Dockerfile
│   │   └── entrypoint.sh       # migrate deploy → start server
│   └── web/                    # Next.js app (port 3000)
│       ├── app/                # Routes — dashboard, onboarding, settings, etc.
│       └── views/              # Full-page view components
│           ├── home.tsx        # Landing page
│           ├── dashboard.tsx   # Analytics dashboard (live API data)
│           ├── onboarding.tsx  # Auth → org → invite → site → verify
│           ├── team-settings.tsx # Org, members, invitations management
│           ├── invite.tsx      # Invitation acceptance flow
│           ├── upgrade.tsx     # Plan upgrade + billing
│           ├── reset-password.tsx
│           ├── terms.tsx
│           └── privacy.tsx
├── packages/
│   ├── sdk/                    # @traytic/analytics npm package
│   │   └── src/
│   │       ├── core.ts         # init, track, trackPageView, vitals, SPA patching
│   │       ├── types.ts        # TractycConfig, TrackOptions
│   │       └── adapters/       # next.tsx, react.tsx
│   └── types/                  # Shared TypeScript types
└── docker-compose.yml
```

---

## Data flow

```
User's browser (SDK)
  └── POST /collect  { domain: "mysite.com", events: [...] }
        ├── resolve site by domain (Prisma lookup)
        ├── drop bots (UA regex)
        ├── parse UA → browser, OS, device type
        ├── parse referrer → known source or raw hostname
        ├── visitor_id = SHA256(siteId + ip + ua + date)  — no PII stored
        ├── session_id = SHA256(siteId + ip + ua + hour)
        ├── insert → ClickHouse (async, fire-and-forget)
        └── emit  → SSE stream → live dashboard
```

---

## SDK

### Next.js

```tsx
import { Analytics } from '@traytic/analytics/next'

<Analytics />
```

### React (other frameworks)

```tsx
import { Analytics } from '@traytic/analytics/react'

<Analytics />
```

### Custom events

```ts
import { track } from '@traytic/analytics'

track('signup', { plan: 'pro' })
track('purchase', { value: '49.99' })
```

### Script tag

```html
<script defer src="https://api.traytic.com/tracker.js"></script>
```

### Configuration options

All props are optional. The SDK auto-detects your site by `window.location.hostname`.

| Option | Default | Description |
|---|---|---|
| `endpoint` | `https://api.traytic.com/collect` | Collection endpoint |
| `respectDnt` | `true` | Honour the browser Do Not Track flag |
| `hashPaths` | `false` | Hash path segments for extra privacy |
| `disabled` | `false` | Kill switch — disables all tracking |

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
{ "domain": "mysite.com", "events": [{ "type": "pageview", "url": "...", "referrer": "..." }] }
```

Returns `204`. Site is resolved by domain. Processing is async.

Legacy `siteId` field is still supported for backward compatibility.

### Stats (authenticated)

```
GET /api/events/:siteId/overview?period=30d
GET /api/events/:siteId/timeseries?period=7d
GET /api/events/:siteId/pages
GET /api/events/:siteId/sources
GET /api/events/:siteId/countries
GET /api/events/:siteId/devices
GET /api/events/:siteId/vitals
GET /api/events/:siteId/live
```

Periods: `24h` · `7d` · `30d` · `90d`

### Real-time (SSE)

```ts
const es = new EventSource(`/api/stream/${siteId}`, { withCredentials: true })
es.onmessage = (e) => console.log(JSON.parse(e.data))
```

### Organizations (authenticated)

```
GET    /api/orgs                              # list your orgs
POST   /api/orgs                              # create org
PATCH  /api/orgs/:orgId                       # update name / slug
DELETE /api/orgs/:orgId                       # delete org (owner only)
POST   /api/orgs/:orgId/leave                 # leave org

GET    /api/orgs/:orgId/members               # list members
PATCH  /api/orgs/:orgId/members/:memberId     # change role
DELETE /api/orgs/:orgId/members/:memberId     # remove member

POST   /api/orgs/:orgId/invitations           # invite by email
GET    /api/orgs/:orgId/invitations           # list pending invitations
DELETE /api/orgs/:orgId/invitations/:id       # revoke invitation
POST   /api/orgs/invitations/accept           # accept invitation (token)
```

### Billing

```
GET  /api/billing/plans                   # list plans (public)
POST /api/billing/checkout                # create checkout session
GET  /api/billing/subscription            # current subscription
POST /api/billing/webhooks/paystack       # Paystack webhook
POST /api/billing/webhooks/polar          # Polar webhook
```

---

## Roadmap

- [x] SDK — zero-config Next.js and React adapters, `< 3 kB`, ESM + CJS, Web Vitals, custom events, UTM capture, SPA navigation
- [x] Domain-based site resolution — no site ID needed, SDK sends hostname, API resolves automatically
- [x] Event collection — bot filtering, privacy fingerprinting (SHA-256, daily-rotating), referrer parsing, Web Vitals
- [x] Real-time — SSE stream from collect pipeline + polled live visitor count
- [x] Auth — email + password, GitHub and Google OAuth, password reset via email (Better Auth)
- [x] Email — Resend SMTP for password resets and team invitations
- [x] Billing — Paystack (Africa) + Polar (global), checkout, webhooks, subscription management
- [x] Dashboard — metric cards, timeseries chart, top pages & sources, devices & countries — wired to live ClickHouse API
- [x] Site management — site selector, add site, delete site with confirmation
- [x] Team management — organizations (CRUD), members with role-based access (OWNER/ADMIN/MEMBER), email invitations with accept/revoke flow
- [x] Onboarding flow — signup → create org → invite team (or skip) → add site → verify tracking
- [x] Landing page, upgrade, billing success, and password reset pages
- [x] Terms of service and privacy policy pages
- [ ] Dashboard sub-views — dedicated realtime, pages, sources, devices, goals panels (sidebar nav exists, needs per-tab content)
- [ ] GeoIP — country/region/city enrichment in collect pipeline (ClickHouse columns exist, not wired yet)
- [ ] Goals & funnels — Prisma schema exists (Goal model with URL/EVENT types), needs API + UI
- [ ] Alerts — Prisma schema exists (Alert model with metric/condition/threshold/channels), needs API + UI
- [ ] Web Vitals dashboard tab — API endpoint exists (`/vitals`), needs frontend visualization
- [ ] Live visitor map
- [ ] Astro, Vue, Svelte SDK adapters
- [ ] CLI — `bunx traytic dev`
- [ ] Public/shared dashboards (Site model has `public` flag, not yet exposed)

---

## License

[GNU AGPL-3.0](LICENSE)
