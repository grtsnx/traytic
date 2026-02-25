# Contributing to Traytic

Thank you for your interest in contributing to Traytic. This document explains how to get set up, our workflow, and what we expect from contributions.

## Code of Conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- **Bun** >= 1.1 ([install](https://bun.sh))
- **Docker** and **Docker Compose** (for PostgreSQL and ClickHouse)

### Setup

1. **Fork and clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/traytic.git
   cd traytic
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start databases**

   ```bash
   docker compose up -d
   ```

4. **Configure environment**

   ```bash
   cp .env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   In `apps/api/.env`, set `BETTER_AUTH_SECRET` to a 32+ character string (e.g. `openssl rand -hex 32`).

5. **Run migrations**

   ```bash
   cd apps/api && bun run prisma:migrate
   cd ../..
   ```

6. **Start dev servers**

   ```bash
   bun dev
   ```

   - Web dashboard: http://localhost:3000  
   - API + Swagger: http://localhost:3001  
   - API docs: http://localhost:3001/docs  

## Project Structure

| Path | Description |
|------|-------------|
| `apps/web` | Next.js 15 dashboard + landing |
| `apps/api` | NestJS 10 + Fastify collector API |
| `packages/sdk` | `@traytic/analytics` — public npm package |
| `packages/types` | `@traytic/types` — shared TypeScript types |

Use `bun dev` at the repo root to run all apps with Turborepo. Run app-specific commands from the relevant directory (e.g. `cd apps/api && bun run prisma:studio`).

## How to Contribute

### Reporting bugs

- Use the [issue tracker](https://github.com/traytic/traytic/issues).
- Include steps to reproduce, your environment (OS, Bun/Node version), and relevant logs or screenshots.

### Suggesting features

- Open an issue with the **feature** label.
- Describe the use case and, if possible, a proposed API or behavior.

### Pull requests

1. **Branch** from `main` (e.g. `fix/collect-endpoint`, `feat/custom-events-docs`).
2. **Keep changes focused** — one logical change per PR when possible.
3. **Follow existing style** — we use Prettier; run `bun run lint` at the root.
4. **Test** — run the app(s) you changed and ensure nothing is broken.
5. **Update docs** — if you change behavior or add options, update the README or relevant `.md` files.

### Commit messages

- Use clear, present-tense messages: e.g. `Fix bot filter for edge runtimes`, `Add INP to Web Vitals response`.
- Reference issues when relevant: `Fix #123: prevent double-counting pageviews`.

## Development tips

- **API changes**: If you add or change endpoints, update Swagger decorators and the README “API Reference” section.
- **SDK changes**: The SDK lives in `packages/sdk`; keep the bundle small and avoid breaking the public API without a major version plan.
- **Database**: Use Prisma migrations for schema changes (`cd apps/api && bun run prisma:migrate`). ClickHouse schema is in `docker-entrypoint-initdb.d` for local Docker.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project — [GNU AGPL-3.0](LICENSE).
