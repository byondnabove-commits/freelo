# 01 — Audit: as built vs target

**Status:** Draft (2026-11-11), Phase 1 of the redesign.
**Compares:** the code on `main` (commit `4e91ec6`), the docs in `apps/docs/`, and the target in `00-product-frame.md`.
**Verdicts:** **Keep** (fits the target as is) · **Rework** (useful base, must change) · **Cut** (remove) · **New** (does not exist yet).
**Effort:** S (days) · M (1–2 weeks) · L (more than 2 weeks), for one developer.

---

## 1. Summary

| Area | Today | Verdict | Effort | Main reason |
|---|---|---|---|---|
| Auth (email/password, Google, verification, reset) | Built, Better Auth | **Keep** | S | Solid base. Needs FR/EN emails and branded templates. |
| Workspace / organization, members | Built (Better Auth org plugin) | **Keep** | — | Already team-ready (owner/member). |
| Onboarding (4 steps) | Built | **Rework** | M | Missing legal identity (NIF, NIS, RC/AE, RIB/CCP), defaults to DZD, service records not created, no default devis/contract/project templates. |
| Organization profile + branding | Schema only (brand kit unused) | **Rework** | M | Add legal identity, payment instructions and document settings (numbering, TVA mode). |
| Settings | API with one setting (`autoConvertLeadsOnWon`), web page is a stub | **Rework** | M | Remove that setting. Build real settings: profile, legal, branding, payment instructions, tax, members, plan. |
| Services | Table exists, unused (onboarding stores categories as text) | **Rework** | S | Services become real records with prices. Add Packages. |
| Forms (builder, publish, public page, idempotent submit) | Built, one form per workspace | **Keep + extend** | M | Good base. Multiple forms (Solo 5, Studio unlimited), phone captured, rate limits, FR/EN. |
| Leads | Built (list, detail, status, lost reason, notes, convert) | **Rework** | M | Remove status-triggered conversion. Link to an existing client. Add follow-ups, phone, AI summary. |
| Clients | Built (list, detail, archive) | **Rework** | M | Add Contacts. Remove `portalToken` in favour of ShareLink. Allow manual creation in the Start project dialog. |
| Lead → client conversion (+ auto-convert) | Built | **Cut / replace** | S | Replaced by the explicit "Start project" action. |
| Projects + kanban | Built (stages, create, drag and drop) | **Keep + extend** | M | Add `proposalId` (unique), templates, milestones, detail page. |
| Tasks | Table only | **New (on existing table)** | M | Tasks inside projects, from templates. |
| Devis / proposals | Table only (jsonb content), web stub | **New** | L | Core of the MVP: line items, options, schedule, AI draft, PDF, share link, online acceptance. |
| Contracts | Table only (e-sign fields), web stub | **Rework + New** | M | Remove the e-sign fields. Templates, PDF, signed-scan upload. |
| Factures / invoices | Tables exist (good design), no API or UI | **New (on existing tables)** | L | Numbering, legal mentions, TVA, schedule-based generation, PDF. |
| Payments | Missing | **New** | M | Record payments, partial payments, outstanding balance. |
| Files | Table only. Logo upload writes to local disk. | **Rework** | M | Object storage (R2/S3), per-workspace quotas, signed URLs. |
| Annotations / feedback | Table only | **Keep for v1.1** | — | Not in the MVP. |
| Messages | Table only | **Keep for v1.1** | — | Portal comes first. |
| Notifications | Table only | **Rework (v1.1)** | — | Email only in the MVP. |
| Client portal | Web stub, `clients.portalToken` | **Replace** | M | MVP uses ShareLinks per document. Full portal in v1.1. |
| Overview / dashboard | Web stub | **New** | M | "Today" page: follow-ups, unpaid factures, devis waiting. |
| CRM page, Profile page | Web stubs | **Cut / merge** | S | CRM is covered by Leads + Clients. Profile merges into Settings. |
| Subscriptions / plans | Table with Stripe fields, plans `sketchbook`/`studio` | **Rework** | M | Prepaid DZD periods, trial end, seats, quotas, manual activation. Remove Stripe fields. |
| AI (devis drafts, lead summaries) | Missing | **New** | M | MVP. Quotas per plan. |
| Activity timeline | Missing | **New** | M | One `activity_events` table used by every module. |
| PDF generation | Missing | **New** | M | A4 devis, contract, facture (FR/EN). |
| Share links | Missing (scattered `publicToken`/`portalToken` columns) | **New** | S | One expiring, revocable mechanism. |
| i18n (FR/EN) | Missing: UI and emails are hard-coded English | **New** | M | Needed for launch. Easier to add now than after more screens exist. |
| Email delivery | Mailtrap **sandbox** only | **Rework** | S | Production provider (Resend is already installed). Branded FR/EN templates. |
| Tests | None | **New** | ongoing | At least services and money logic. |

**In numbers:** about 30% of the MVP exists (auth, forms, leads, clients, projects). Most of what is missing is the core of the target: devis, contracts, factures, payments, AI, PDF and i18n.

---

## 2. Issues to fix whatever the redesign decides

These are bugs or risks in the current code, ranked by severity.

| # | Severity | Issue | Where | Fix |
|---|---|---|---|---|
| I1 | **High (security)** | **Logo upload needs no login.** Anyone can upload files, SVG is allowed, and files are served from the API's own origin. An SVG with a script can then run on that origin (stored XSS), and anyone can fill the disk. | `apps/api/src/routes/upload/logo.ts`, `index.ts` (`serveStatic` on `/uploads/*`) | Require auth + org. Drop SVG or sanitize it. Take the extension from the checked MIME type, not the file name. Move storage to R2/S3 with per-workspace keys. |
| I2 | **High** | **Every public form submission waits 10 seconds.** A `setTimeout(10000)` sits between the owner email and the prospect email, inside the request. | `apps/api/src/modules/leads/service.ts:69` | Remove it. Send emails after the response (or through a small queue), with the existing retry helper. |
| I3 | **High** | **No rate limiting on public endpoints** (form submit, auth). `hono-rate-limiter` is installed but never used. | `apps/api/src/index.ts` | Rate-limit public submit, auth, and later the share links and devis acceptance. |
| I4 | **High (data)** | **Schema and migrations disagree.** `clients.archived_at` and `form_submissions.idempotency_key` exist in the schema but in no migration file (likely applied with `drizzle-kit push`). A fresh database will miss them. | `packages/shared/db/migrations/` | Generate a migration now. Rule from here on: no `push` outside a throwaway local DB. |
| I5 | Medium | **Production email will not be delivered.** Email goes to the Mailtrap sandbox only. Resend is installed but unused. | `apps/api/src/services/email.ts` | Provider chosen by environment. Sandbox in development only. |
| I6 | Medium | **16 uploaded logos are committed to git** (`apps/api/uploads/logos/*`). That is user data in the repository. | repo root `.gitignore` | Remove them from git and ignore `uploads/`. Solved for good by I1's object storage. |
| I7 | Medium | **Security headers only on some routes** (`/api/me`, `/api/leads`, `/api/onboarding`, `/health`). Forms, clients, projects and upload have none. | `apps/api/src/index.ts:99-102` | Apply `secureHeaders()` globally. |
| I8 | Medium | **Onboarding routes check the organization but not the login.** With no session, `requireOrg` likely fails with a 500 instead of a 401. | `apps/api/src/routes/onboarding/*.ts` | Add `requireAuth` before `requireOrg`, as `me.ts` does. |
| I9 | Medium | **Writes are scoped by `id` only.** The service checks the organization first, then the repository updates `WHERE id = ?`. This is correct today but fragile: one missed check leaks data across tenants. | `modules/*/repository.ts` (`update`, `delete`, `archive`...) | Every repository query takes `organizationId` and filters on it. |
| I10 | Low | **A lead's phone is never saved from forms.** It is hard-coded to `null`, even though a phone field type exists. Phone is the main channel in Algeria. | `apps/api/src/modules/leads/service.ts:50` | Map the phone field like the others, and make it a default intake field. |
| I11 | Low | **Converting a lead sets its status to `won` as a side effect.** This is the reverse coupling of the old bug. | `apps/api/src/modules/clients/service.ts` (`createFromLead`) | Goes away with the explicit Start project flow. |
| I12 | Low | **No tests at all.** | — | Start with services that touch money, numbering, acceptance and conversions. |

---

## 3. Schema review (table by table)

| Table | Verdict | Changes for the target |
|---|---|---|
| `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation` | Keep | Owned by Better Auth. |
| `organization_profile` | Rework | Add legal identity (`legal_name`, `nif`, `nis`, `rc_number` or `ae_card_number`, `article_imposition`, `address`, `wilaya`), `phone`, payment instructions (`rib`, `ccp`, `baridimob`), `tax_mode`, document numbering settings, `default_language`. Default `currency = 'DZD'`. Rename `onboardingCompletedAt` consistently with the docs (`completedAt`). |
| `service` | Rework | Make price required for use in a devis. Add `unit` (fixed, per page, per day...). Add `archived_at`. |
| `package` | **New** | Named bundle of services with a price and a description. |
| `forms`, `form_fields`, `form_submissions` | Keep | Add a phone field to the default form. Enforce the per-plan count of published forms. |
| `leads` | Rework | Add `client_id` (nullable, for returning clients), `next_follow_up_at`, `ai_summary`, `source`. Keep `lost_reason`. Make `email` optional and `phone` important (local reality). |
| `clients` | Rework | Drop `portal_token`. `email` becomes optional. Add `type` (company/person), legal fields for company clients (NIF, RC, address, needed on factures to companies). |
| `contacts` | **New** | `client_id`, name, phone (required), email, role, `is_primary`. |
| `proposals` (devis) | Rework | Replace the free `content` jsonb with structure: `number`, `client_id`, `lead_id` (nullable), `title`, `version`, `currency`, totals in centimes, `valid_until`, `acceptance_mode` (online/paper/both), `locked_at`. Drop `public_token` (ShareLink). |
| `proposal_items` | **New** | Line items, options (`option_group`, `is_selected`), position. |
| `proposal_acceptances` | **New, immutable** | Name, contact, OTP-verified email, IP, user agent, timestamp, `document_hash`, version. |
| `payment_schedule_items` | **New** | Label, percent or amount, trigger (signature, milestone, delivery), linked invoice. |
| `contracts` | Rework | Drop the e-sign fields (`signed_at`, `signer_name`, `signer_email`, `public_token`). Add `template_id`, `status` (draft, sent, signed_paper), `signed_copy_file_id`. Make `proposal_id` nullable (standalone contracts). |
| `projects` | Rework | Add `proposal_id` (**unique**, nullable), `template_id`, `start_date`, `archived_at`. |
| `project_templates`, `template_tasks` | **New** | Default stages, tasks and offsets. |
| `milestones` | **New** | Optional in the MVP, linked to payment schedule items. |
| `tasks` | Keep | Add `position`, `milestone_id`. |
| `invoices` | Rework (good base) | Add `tax_mode`, `tax_total`, `currency`, `proposal_id`, `schedule_item_id`, `issued_at`, `locked_at`, client legal snapshot (jsonb, frozen at issue time), `amount_paid`. Rename statuses to match payments (draft, issued, partially_paid, paid, cancelled). Overdue is derived from `due_date`, not stored. |
| `invoice_line_items` | Keep | Add `tax_rate`. |
| `payments` | **New, immutable** | `invoice_id`, amount, method (CCP, BaridiMob, transfer, cash, cheque), `received_at`, reference, note. Corrections are new rows. |
| `files` | Rework | Add `storage_bytes` accounting per workspace, `kind` (logo, deliverable, signed_copy, attachment). |
| `annotations`, `messages` | Keep for v1.1 | — |
| `notifications` | Keep for v1.1 | Add `user_id` (per member, not per workspace). |
| `subscription` | Rework | Drop `stripe_*`. Add `trial_ends_at`, `seats`, `period_start`, `period_end` (prepaid), `payment_reference`, `activated_by`. Plans become `free`, `solo`, `studio`. |
| `share_links` | **New** | `entity_type`, `entity_id`, `token_hash`, `expires_at`, `revoked_at`, `last_viewed_at`. |
| `activity_events` | **New** | `organization_id`, `actor` (member or client), `entity_type`, `entity_id`, `type`, `data` jsonb, `created_at`. |
| `ai_usage` | **New** | Per-workspace monthly counters for quotas and cost tracking. |
| `document_sequences` | **New** | Per workspace, per type (devis, facture), per year. Gap-free numbering in a transaction (factures legally need sequential numbers). |

---

## 4. Docs review

| Doc | Verdict | Notes |
|---|---|---|
| `architecture/architecture.md` | Keep | Module layout matches the code. Add the cross-cutting rules (Phase 3). |
| `architecture/onboarding.md` | Rework | Says services become records (they don't). Add the legal identity step and default templates. |
| `architecture/subscriptions.md` | Rework | USD prices, Stripe, AI on every plan. Replace with `pricing-model.md`. |
| `architecture/business-rules.md` | Rework | "Accepting a proposal creates a client and a project" contradicts the explicit Start project rule. |
| `architecture/database.md`, `api.md`, `auth.md`, `multi-tenancy.md`, `organization.md`, `storage.md` | Review in Phase 3 | Large docs. Check against the code when writing the cross-cutting standards. |
| `lead-to-client-lifecycle-spec.md` | Superseded | Its idempotency and "status is not a signal" rules are kept. The auto-convert and Won dialog flows are replaced. |
| `client-to-project-lifecycle-spec.md` | Partly kept | The unified project dialog survives as "Start project". Client-without-project and archiving rules are kept. |

---

## 5. What this means for Phase 2 (spec order)

The specs follow dependencies. Each one lists what is reused from the code.

1. **Workspace foundation:** onboarding, organization profile (legal identity, payment instructions, tax mode), settings, members, i18n FR/EN. *Reuses auth, org, onboarding steps.*
2. **Catalog:** services and packages. *Reuses the `service` table.*
3. **Clients and contacts.** *Reuses clients, archive logic.*
4. **Acquisition:** forms (multiple forms, phone) and leads (follow-ups, link to client, AI summary). *Reuses forms and leads almost entirely.*
5. **Devis:** structure, AI draft, PDF, share link, online acceptance, versions. *New.*
6. **Contracts:** templates, PDF, signed copy. *Reworks the table.*
7. **Factures and payments:** numbering, legal mentions, TVA, schedule-based generation, payment recording. *Builds on the existing invoice tables.* Needs the accountant's input first.
8. **Delivery:** Start project dialog, project templates, projects, tasks, files. *Reuses kanban and projects.*
9. **Overview page and activity timeline.**
10. **Plans:** trial, Free limits, quotas, prepaid activation.

**Phase 3** (cross-cutting standards) runs alongside spec 1, because every later spec depends on it: tenant-scoped repositories, the error format, activity events, share links, PDF, storage, email, rate limits, migrations and tests.

**Decision (2026-11-11): full rebuild.** The app has zero users and only runs on the owner's machine, so there is nothing to migrate. The schema and migrations restart from `0000`, the stack is kept, and good parts are ported slice by slice (see `02-architecture.md`). Issues I1–I12 are therefore fixed by design in the new foundation, not patched in the old code.
