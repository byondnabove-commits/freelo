# 02 — Architecture & Foundation (rebuild)

**Status:** Draft (2026-11-11). This is the Phase 3 cross-cutting spec, written first because the rebuild starts here.
**Context:** Full rebuild. Zero users, no data to migrate (`01-audit.md`). Same stack, new foundation, good parts ported slice by slice.
**Rule:** every feature spec in Phase 2 follows this document. A deviation is changed here first.

---

## 0. Architectural style: modular monolith + "DDD-lite"

**Decision (2026-11-11):** one deployable application and one PostgreSQL database, split into business modules with strict layers. Domain-Driven Design ideas are used only where they pay off. Not microservices, not an event bus, not plain CRUD everywhere.

### 0.1 What we use
| Principle | In practice |
|---|---|
| **Modular monolith** | `apps/api` (HTTP) and `apps/worker` (jobs) share the same code packages and the same database. Deployed together. |
| **Modules by business area** | `auth`, `workspace`, `services`, `clients`, `leads`, `forms`, `devis`, `contracts`, `factures`, `projects`, `activity`... A module owns its tables and is called **only through its service**, never through another module's repository. |
| **Layers in every module** | `routes` (HTTP only) → `service` (rules, transactions) → `repository` (SQL only, always scoped by `organizationId`). Simple CRUD modules keep thin services. |
| **DDD-lite** | A shared glossary (`00-product-frame.md` §7). Pure business rules in `@freelo/domain` (money, TVA, schedules, numbering, permissions, plan limits, `missingFor`). Consistency boundaries where invariants matter: a devis with its lines, options and acceptance, and a facture with its lines and payments, always change in one transaction. |
| **Explicit flow** | Modules call each other directly through services. A status change never triggers hidden side effects (`00-product-frame.md` §8, principle 6). |
| **Async only for slow side effects** | Emails, PDF and AI run as **jobs** in the worker (pg-boss, stored in Postgres). History goes to `activity_events`. Both are written **in the same transaction** as the change, so nothing fires for a rolled-back write. |

### 0.2 What we don't use, and why
| Option | Why not |
|---|---|
| Microservices | One developer, one server. Money operations (issuing a facture with its number) need a single database transaction. Network calls and distributed failures would add cost with no benefit. |
| Event bus / event-driven core | Implicit reactions between modules are hard to follow and were the root of the old "lead won → auto-create project" bug. |
| Full DDD (aggregates everywhere, domain events, CQRS, event sourcing) | Too much ceremony for the size of the product and team. |
| Plain CRUD everywhere | Money, devis, numbering and acceptance rules would end up scattered in routes and UI. |

### 0.3 Growth path (no rewrite needed)
1. Bigger server (vertical scaling).
2. More worker containers; heavy queues (PDF) get their own worker. pg-boss uses `SKIP LOCKED`, so workers never process the same job twice.
3. Database on its own server, then managed Postgres with replicas.
4. Several API instances behind Caddy. Sessions are already in the database and files in object storage. The in-memory rate limiter must move to a shared store first (marked `shortcut:` in the code).
5. A module that truly needs independent scaling can be extracted along its existing boundary. The queue can be swapped (Redis/BullMQ or a cloud queue) behind the job contracts in `@freelo/contracts/jobs`.

At the M4 milestone (≈ 5,000 workspaces, ≈ 100k jobs/day ≈ 1 job/s, a rough estimate), steps 1–2 are expected to be enough. PDF rendering and database size are the first limits, not the architecture.

---

## 1. Stack (kept)

| Layer | Choice |
|---|---|
| Language | TypeScript (strict) everywhere |
| Monorepo | pnpm workspaces + Turborepo |
| API | Hono on Node (`@hono/node-server`) |
| Database | PostgreSQL 16 + Drizzle ORM + drizzle-kit migrations |
| Auth | Better Auth (email/password, Google, organization plugin) |
| Validation | zod (shared between API and web) |
| Web | React 19 + Vite + React Router + TanStack Query + TanStack Table |
| UI | Tailwind 4 + shadcn/ui (Radix), lucide icons, dnd-kit |
| Jobs | **pg-boss** (job queue stored in Postgres, no Redis) |
| PDF | Playwright (headless Chromium) in the worker |
| Storage | S3-compatible object storage (Cloudflare R2 or equivalent), via the AWS S3 SDK |
| Email | Resend (production), Mailtrap or a local catcher (development) |
| AI | Anthropic Claude API: Haiku 5.5 for summaries, Sonnet 5.5 for devis drafts |
| i18n | i18next + react-i18next (web), same keys for emails and PDFs |
| Tests | Vitest + a real Postgres test database |
| Deployment | Docker Compose on one VPS: `api`, `worker`, `postgres`, `caddy` (serves the web build + TLS) |

**Exact versions** are pinned in the lockfile. Upgrades are deliberate commits.

---

## 2. Repository layout

```
freelo/
├── apps/
│   ├── api/          Hono HTTP API (no long work inside requests)
│   ├── worker/       pg-boss consumers: emails, PDF, AI, scheduled jobs
│   ├── web/          React app (freelancer app + public client pages)
│   └── docs/         specs and architecture docs
├── packages/
│   ├── db/           Drizzle schema, migrations, seed, db client factory
│   ├── contracts/    zod schemas + inferred types shared by api and web (inputs, outputs, enums)
│   ├── domain/       pure business logic with no I/O: money, tax, numbering format, schedule math, permissions, plan limits
│   ├── templates/    HTML templates for devis / contract / facture (used by the share pages AND the PDF renderer), and email templates
│   └── config/       shared tsconfig, eslint, env schema helper
└── docker/           compose files, Caddyfile, Dockerfiles
```

**Why `domain` is separate:** money, TVA, schedule math and plan limits are the code where bugs cost real money. As pure functions they are trivial to unit-test, and both the API and the worker use them.

---

## 3. API architecture

### 3.1 Module layout (kept from the old code, made stricter)
```
apps/api/src/modules/<feature>/
  routes.ts       HTTP only: validate (zod from @freelo/contracts), call the service, shape the response
  service.ts      business rules, transactions, activity events, job enqueueing
  repository.ts   database access only. Every method takes organizationId.
  errors.ts       domain errors (mapped to HTTP status centrally)
  index.ts
```
Modules call each other **through services**, never through another module's repository.

### 3.2 Conventions
| Topic | Rule |
|---|---|
| URLs | `/api/v1/<resource>`, plural nouns. Public client pages: `/api/v1/public/...` |
| Success response | `{ "data": ... }`. Lists: `{ "data": [...], "page": { "nextCursor": "...", "limit": 50 } }` |
| Errors | `{ "error": { "code": "DEVIS_LOCKED", "message": "...", "details": {...} } }`. One central mapper. Messages are i18n keys resolved by the client. |
| Pagination | Cursor-based (`createdAt` + `id`), default 50, max 100 |
| Validation | zod at every boundary: body, params, query, env, job payloads, AI output |
| Idempotency | Public writes (form submit, devis accept) and money writes (record payment, issue facture) take an `Idempotency-Key`, backed by a unique constraint |
| Transactions | A service method that writes more than one row runs in one transaction. Jobs are enqueued **inside** that transaction (pg-boss supports this), so nothing is sent for a rolled-back write. |
| Time | `timestamptz` in UTC. Dates without time (due dates) as `date`. Display in the workspace timezone (default `Africa/Algiers`). |
| Money | Integer centimes (`bigint`) + `currency` (ISO code, default `DZD`). Never floats. Math lives in `@freelo/domain`. |
| IDs | UUID v7 (time-ordered, good for indexes and cursors), generated in the app |
| Type safety to the web | Hono RPC client (`hc<AppType>`) wrapped by TanStack Query hooks |

### 3.3 Request pipeline
`requestId → logger → secureHeaders (global) → CORS → rate limit (public routes and auth) → session → requireAuth → requireOrg → requireRole/plan check → route`.

---

## 4. Multi-tenancy

- Every business table has `organization_id` (not null, indexed, FK with cascade).
- **Every repository method takes `organizationId` as its first argument and filters on it, for reads AND writes** (`WHERE id = $1 AND organization_id = $2`). This fixes audit issue I9.
- An automated test scans the repositories and fails when a query on a tenant table does not filter by `organization_id`.
- Public client pages never take an `organization_id` from the request. They resolve everything from a share-link token (§8).
- Row-level security in Postgres is **not** used in v1, because app-level scoping plus the test is enough. It can be added later as a second safety net.

---

## 5. Auth and permissions

- Better Auth, as today: email/password with mandatory verification, Google sign-in, password reset, 7-day sessions.
- Organization plugin: one user can belong to several workspaces. The active workspace is stored on the session.
- Roles: `owner` (billing, members, settings) and `member` (all daily work). Checked by `requireRole` and by pure functions in `@freelo/domain/permissions`.
- Auth emails go through the job queue and the shared FR/EN templates, with the workspace language when known.
- Clients never log in (§8).

---

## 6. Database conventions

| Rule | Detail |
|---|---|
| Naming | snake_case tables (plural) and columns. Drizzle maps them to camelCase. |
| Standard columns | `id`, `organization_id`, `created_at`, `updated_at`, plus `archived_at` where archiving applies |
| Archive vs delete | Business records with history are archived. Hard delete only for records with no dependants (same rule as clients today). |
| Immutable tables | `payments`, `proposal_acceptances`, `activity_events`, issued factures (`locked_at`). No UPDATE or DELETE from the app. Corrections are new rows (credit note, reversal). |
| Numbering | `document_sequences(organization_id, type, year, last_value)`, incremented with `SELECT ... FOR UPDATE` in the issuing transaction. Gap-free. Format comes from workspace settings (for example `F-2026-0001`). |
| Migrations | Generated by drizzle-kit, committed, applied by a `migrate` step on deploy. **`drizzle-kit push` is forbidden** outside a throwaway local DB. The fresh rebuild starts at `0000`. |
| Seed | `pnpm db:seed` creates a demo workspace with realistic Algerian data (FR) for development and demos. |
| Constraints | "Must happen once" is a unique constraint (project per proposal, acceptance per devis version, idempotency keys). |

---

## 7. Activity events

- One table: `activity_events(id, organization_id, actor_type [member|client|system], actor_id, entity_type, entity_id, type, data jsonb, created_at)`.
- Written by services in the same transaction as the change (`activityService.record(tx, ...)`).
- Feeds the timelines on lead, client, project and devis pages, the overview page, and later the notifications.
- Event types are a typed enum in `@freelo/contracts`, such as `devis.sent`, `devis.viewed`, `devis.accepted`, `payment.recorded`, `project.started`.

---

## 8. Share links (client-facing pages)

- Table `share_links(id, organization_id, entity_type, entity_id, token_hash, expires_at, revoked_at, created_by, last_viewed_at, view_count)`.
- The token is 32 random bytes, base64url, shown once. Only its SHA-256 hash is stored.
- URL: `https://app.freelo.dz/s/<token>`. The page and the PDF render from the same template (§10).
- Default expiry: 60 days, configurable. The freelancer can revoke a link or create a new one.
- Every view writes `devis.viewed` (deduplicated per day). Rate-limited.
- **Devis acceptance:** typed name, a 6-digit one-time code sent to the contact's email (10-minute validity, 5 attempts), then an immutable `proposal_acceptances` row with IP, user agent, timestamp and a SHA-256 of the rendered version. Idempotent.

---

## 9. Background jobs (worker)

| Queue | Jobs | Retry |
|---|---|---|
| `email` | Every outgoing email (auth, lead notification, devis sent, OTP, receipts) | 5 attempts, exponential backoff |
| `pdf` | Render devis, contract, facture to PDF, store it in object storage, save the file record | 3 attempts |
| `ai` | Lead summary, devis draft | 2 attempts. Quota checked before enqueueing. |
| `scheduled` | Trial ending reminders, plan downgrade at period end, share-link cleanup, overdue factures (derived), daily DB backup check | cron via pg-boss |

The API never waits on email, PDF or AI. The web app polls or refetches the job's result (an AI draft shows a "génération..." state).

---

## 10. Documents and PDF

- Templates live in `@freelo/templates` as plain HTML/CSS functions (typed props, no React needed server-side), in FR and EN. They are A4 print CSS with space for signature and stamp.
- The same template renders the public share page (web) and the PDF (worker, Playwright `page.pdf()`).
- Branding: logo, colors, legal identity and payment instructions from the workspace profile.
- Every PDF of an issued facture or an accepted devis is stored and **never regenerated**: the stored file is the legal copy.
- Arabic (RTL) later only needs new templates. Chromium already handles RTL.

---

## 11. Files and storage

- Object storage with keys `org/<organization_id>/<kind>/<uuid>.<ext>`.
- Uploads: the API checks auth, plan quota, MIME type (from file content, not the file name) and size, then returns a short-lived presigned upload URL. Downloads use presigned GET URLs.
- Allowed types: images (PNG, JPEG, WebP), PDF, common office documents. **No SVG uploads** (XSS risk, audit I1).
- `files` tracks `size_bytes`. Per-workspace usage is summed for plan limits.
- Nothing is served from the API's filesystem. `uploads/` disappears.

---

## 12. Email

- Provider adapter: Resend in production, a local catcher (Mailpit) in development, chosen by environment.
- Templates in `@freelo/templates/email`, FR/EN, branded with the workspace logo for client-facing emails.
- Sender: `FreeLo <noreply@...>` with `reply-to` set to the freelancer's professional email. Custom sending domains come later (Studio).
- Every send goes through the `email` queue. No email is sent inside a request.

---

## 13. AI

- Module `ai` in the API, with calls made only from the worker.
- Models: `claude-haiku-5-5` for lead summaries, `claude-sonnet-5-5` for devis drafts (French by default). Output is validated with zod (structured output), then turned into a **draft** devis the freelancer edits. Nothing is sent automatically.
- Context: workspace services, packages, prices, past accepted devis (summarized), lead answers.
- Quotas: `ai_usage(organization_id, month, kind, count, input_tokens, output_tokens)`. The plan limit is checked before enqueueing (Solo 30 drafts/month, Studio 50 per member).
- Prompt caching on the stable system prompt and workspace catalog.
- Customer data is not used for training (Anthropic API default). Say so on the privacy page.

---

## 14. i18n

- Languages: `en` (default) and `fr`. The UI language is per user, the document language per document (defaulting to the workspace setting).
- Keys organized by feature (`devis.status.accepted`). No hard-coded UI text, enforced by a lint rule.
- Dates, numbers and money formatted with `Intl` in the selected locale (`1 234 500,00 DA` in FR).
- API error codes map to translated messages on the client.

---

## 15. Plans and limits

- Plan definitions live in code in `@freelo/domain/plans.ts` (limits, quotas, features), not in the database.
- `subscription(organization_id, plan [free|solo|studio], seats, trial_ends_at, period_start, period_end, status, payment_reference, activated_by)`.
- `planGuard` checks run in services (create project, publish form, invite member, upload, AI). On a limit they return `PLAN_LIMIT_REACHED` with the limit name, and the web app shows the upgrade prompt.
- Payment at launch: manual (the user pays by BaridiMob/CCP, and the owner activates the period from an internal admin screen). A gateway (Chargily or SlickPay) comes later, plugged into the same `activate period` function.

---

## 16. Security checklist (applies to every slice)

- `secureHeaders` on every route, with a strict CSP on the web app.
- Rate limits: auth, public form submit, share-link views, OTP send and verify, AI enqueue.
- CSRF: Better Auth cookies `SameSite=Lax` + origin check on mutations.
- No secrets in the repo. Env validated by zod at startup (the process refuses to start if one is missing).
- Uploaded content never executed or served inline from the app origin.
- Every query tenant-scoped (§4). Every public endpoint resolves its tenant from a token.
- Dependency updates and `pnpm audit` in CI.
- **Personal data (Algeria, law 18-07 and the ANPDP):** get legal advice on registration and on hosting location **before** the public launch (§18).

---

## 17. Testing and CI

- **Unit tests:** `@freelo/domain` (money, TVA, schedules, numbering format, limits), aiming at about 100% of that package.
- **Integration tests:** services against a real Postgres (one database per test run, migrations applied), covering tenancy, numbering under concurrency, acceptance idempotency, plan limits.
- **API tests:** a few end-to-end request tests per module through `app.request()`.
- **Web:** type-check + lint in CI. Playwright end-to-end tests for the golden path (sign up, onboarding, lead, devis, accept, project, facture, payment) once those slices exist.
- **CI (GitHub Actions):** install, lint, type-check, test, build on every push. Migrations checked against a fresh database.

---

## 18. Environments and deployment

| Env | What |
|---|---|
| Local | `docker compose up` for Postgres + Mailpit + MinIO (S3-compatible). `pnpm dev` runs api, worker and web. |
| Staging | Same compose on the VPS, separate database, test email domain |
| Production | One VPS: `caddy` (TLS, web static files, reverse proxy to `api`), `api`, `worker`, `postgres` with a volume. Nightly `pg_dump` to object storage, kept 30 days. |

**Open decision, hosting location:** a European VPS (Hetzner or OVH: cheap, reliable, about 40 ms from Algeria) or an Algerian host (Algérie Télécom, Icosnet: likely simpler under law 18-07, usually more expensive and less mature). This needs a lawyer's view on cross-border transfer of personal data before the public launch. Development and private beta can run anywhere.

---

## 19. Rebuild plan (vertical slices)

Work happens on branch `rebuild`. `main` stays as a reference until the rebuild replaces it.

| Slice | Content | Done when |
|---|---|---|
| **S0 — Foundation** | New monorepo layout, packages (`db`, `contracts`, `domain`, `templates`, `config`), Docker dev stack, env validation, logger, error format, rate limits, pg-boss worker skeleton, storage adapter, email adapter, i18n setup, CI, test DB | `pnpm dev` runs everything. CI is green. One example module passes the tenancy test. |
| **S1 — Auth + workspace** | Better Auth (port), workspaces, members and roles, session org context | Sign up → verify → workspace created, FR/EN emails via the queue |
| **S2 — Onboarding + settings** | Profile, legal identity, payment instructions, tax mode, branding, numbering, default templates, trial start | A new workspace is ready to issue a devis |
| **S3 — Catalog** | Services, packages | — |
| **S4 — Clients + contacts** | Port + rework | — |
| **S5 — Forms + leads** | Port forms (multiple, phone) and leads (follow-ups, link to client, AI summary) | Public form → lead → AI summary |
| **S6 — Devis** | Structure, AI draft, PDF, share link, online acceptance, versions | The golden path up to "accepted" |
| **S7 — Contracts** | Templates, PDF, signed copy | — |
| **S8 — Factures + payments** | Numbering, legal mentions, TVA, schedule → factures, payments, balance | Accountant-validated mentions |
| **S9 — Projects** | Start project, templates, kanban (port), tasks, files | — |
| **S10 — Overview + activity** | Today page, timelines | — |
| **S11 — Plans** | Free limits, quotas, trial end, manual activation admin | Ready for private beta (milestone M0) |

Each slice gets its Phase 2 feature spec **before** coding starts. S0 needs only this document.

---

## 20. Open decisions

| # | Decision | Recommendation |
|---|---|---|
| A1 | Router: keep React Router or move to TanStack Router (typed routes) | **Keep React Router.** No churn, the team knows it. |
| A2 | Hosting location (§18) | Decide before the public launch, after legal advice. Use a European VPS for staging and beta. |
| A3 | Domain name (`freelo.dz`?) | `.dz` needs an Algerian entity or residence. Check availability. |
| A4 | Who validates invoice legal mentions and law 18-07 | An accountant (factures) and a lawyer (data, devis acceptance). Needed before S8 and before the public launch. |
