# FreeLo

Back office for Algerian freelancers and small studios: inquiry → devis → project → facture → payment.

Specs live in [`apps/docs/specs/`](apps/docs/specs/). Start with `00-product-frame.md` and `02-architecture.md`.

## Requirements

- Node 22 (`.nvmrc`)
- pnpm 10
- Docker Desktop (Postgres, Mailpit, MinIO for local development)

## First run

```bash
pnpm install
cp .env.example .env
pnpm dev:services        # Postgres :5432, Mailpit :8025, MinIO :9001
pnpm db:migrate
pnpm dev                 # api :3001, worker, web :5173
```

## Everyday commands

| Command | What it does |
|---|---|
| `pnpm dev` | Runs api, worker and web in watch mode |
| `pnpm typecheck` | Type-checks every workspace |
| `pnpm test` | Unit tests everywhere. Integration tests run when `TEST_DATABASE_URL` is set. |
| `pnpm db:generate` | Creates a migration from schema changes in `packages/db/src/schema` |
| `pnpm db:migrate` | Applies migrations to `DATABASE_URL` |

Never use `drizzle-kit push`: every schema change goes through a committed migration.

## Layout

| Path | Role |
|---|---|
| `apps/api` | Hono HTTP API |
| `apps/worker` | Background jobs (pg-boss): emails, later PDF and AI |
| `apps/web` | React app |
| `packages/db` | Drizzle schema, migrations, db client |
| `packages/contracts` | zod schemas and types shared by api, worker and web |
| `packages/domain` | Pure business logic (money, later tax, schedules, plan limits) |
| `packages/config` | Shared TypeScript config |
