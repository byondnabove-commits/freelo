# 04 — S2: Onboarding & Workspace Settings

**Status:** Draft (2026-11-11). Slice S2 of the rebuild (`02-architecture.md` §19).
**Builds on:** S1 (auth, workspaces, members).
**Decision behind this spec:** onboarding is a **short multi-step form** (3 steps), not an AI conversation. No AI API account exists yet. The form keeps a hook so AI can be added later without a redesign (§4.2).
**Done when:** a verified user finishes onboarding in about 2 minutes with a named workspace, an optional logo and a priced service catalog. Settings hold everything documents need later (legal identity, payment details, tax mode), and the app knows exactly which of those are still missing.

---

## 1. Principles

1. **Never ask twice.** Anything known from sign-up (name, email, language) or from the market (Algeria) is not asked.
2. **Ask only what the next step needs.** Legal identity and payment details are asked **when the user first issues a devis or a facture**, not on day one.
3. **Every step saves immediately.** Refresh, crash or device switch resumes at the same step (§3.1).
4. **Optional means skippable.** Only the business name is required.

---

## 2. What is never asked during onboarding

| Data | Source |
|---|---|
| Owner name, email, language | Sign-up (S1) |
| Professional email on documents | Defaults to the account email; editable in settings |
| Currency | `DZD` (fixed for the Algerian launch) |
| Timezone | `Africa/Algiers` (editable in settings) |
| Legal identity (NIF, NIS, RC / auto-entrepreneur card, address) | Asked just in time (§6) |
| Payment details (RIP/CCP, RIB, BaridiMob) | Asked just in time (§6) |
| Intake form fields | Generated from the answers in S5 (Forms) |

---

## 3. Flow

After email verification, a user with no workspace lands on `/onboarding`. A user who already has a workspace never sees onboarding again (invited members skip it entirely).

```
Step 1 — Your business  →  Step 2 — What you sell  →  Step 3 — How you work  →  Ready
   (creates workspace)        (skippable)                (skippable)
```

A left stepper shows the 3 steps (the Figma layout is kept). "Back" never loses data.

### 3.1 Leaving halfway and coming back

| Where the user left | On return (any device) |
|---|---|
| Before confirming step 1 | Step 1 (nothing saved server-side yet) |
| After confirming step 1 or 2 | The next unconfirmed step, with earlier answers pre-filled |
| On Ready | Ready, then the dashboard |

- **Confirmed steps** live in the database (`onboarding_step` plus the saved answers), so they resume on any device.
- **Unconfirmed edits** inside the current step (typed but not yet "Continue") are kept as a **browser draft** in `localStorage`. The key is `freelo:onboarding-draft:<userId>:<step>`, and the draft is written on change, debounced 500 ms.
  - On return to the same step **on the same browser**, the draft is restored over the saved answers, with a small "Restored your unsaved changes" note and an "Undo" link back to the saved version.
  - The draft is deleted when the step is confirmed, when onboarding completes, and on sign-out.
  - It holds only the step's form values (business name, services, team, budget, invitation emails). Never the logo file, never tokens.
  - If storage is unavailable (private mode, blocked), the form works normally without drafts. Every read and write is wrapped in try/catch.
- Every app page redirects an owner whose onboarding isn't complete back to `/onboarding`, at the resume step.

---

## 4. Steps

### 4.1 Step 1 — Your business (required)
| Field | Rules |
|---|---|
| Business name | Required, 2–80 characters. Becomes the workspace name. Example placeholder: "Studio Amine Design". |
| Logo | Optional. PNG, JPEG or WebP, max 2 MB (checked by file content, not the extension). **No SVG.** "Add later" link. |

"Continue" creates the workspace (S1's `POST /api/v1/workspaces`: organization + owner + `workspace.created` event) and its profile in one transaction, and sets it active. This **replaces** S1's separate "create workspace" screen.

### 4.2 Step 2 — What you sell (skippable)
- Chips with common services, one click to add: Brand identity · Logo · Website · Social media management · UI/UX design · Photography · Video / motion · Copywriting · Printing design. Plus "Add your own".
- Each added service is a row: **name** (editable) and **starting price in DA** (optional), with a unit: per project (default), per day, per month, per item.
- Up to 20 services here. More can be added in the catalog later.
- Saved as real `services` rows. They feed devis (S6) and the intake form's "service needed" field (S5).
- **AI hook (later):** a collapsed "Or describe what you do" text box, shown only when an AI provider is configured (`AI_PROVIDER` env set). Its output fills the same rows, which the user reviews. Hidden in this slice.

### 4.3 Step 3 — How you work (skippable)
| Field | Options |
|---|---|
| Team | Solo · Small team (2–5) · Agency (6+) |
| Typical project budget | Under 50 000 DA · 50 000 – 150 000 DA · 150 000 – 500 000 DA · Over 500 000 DA · Varies |
| Invite teammates | Shown only for "Small team" / "Agency": up to 5 emails, using S1 invitations. Skippable. |

The budget brackets are a starting point **to validate with real freelancers**. They seed the intake form's budget options in S5 and are editable there.

### 4.4 Ready
- "Your workspace is ready" with the business name and logo.
- A checklist that later slices tick automatically:
  - Business set up ✓
  - Services added (✓ if any)
  - Complete your business details (legal identity, payment details) → link to settings
  - Share your intake form *(appears in S5)*
  - Send your first devis *(appears in S6)*
- "Go to my dashboard" → `/app`.

---

## 5. Workspace settings (`/app/settings/...`)

| Page | Content | Who |
|---|---|---|
| **General** | Business name, logo, document language (default `en`), timezone, currency (shown, locked to DZD) | owner |
| **Business details** | Legal name, legal form (auto-entrepreneur · personne physique · EURL · SARL · other), NIF, NIS, RC number **or** auto-entrepreneur card number, article d'imposition, address, wilaya, business phone, professional email | owner |
| **Payment details** | Payment methods shown on documents, each optional: CCP (account + key), RIP, bank RIB + bank name, BaridiMob, cash, cheque. Plus a free "payment instructions" note. | owner |
| **Tax** | Subject to TVA: yes / no. If no: the legal mention printed on documents (editable default). If yes: default rate (19% / 9% / 0%). | owner |
| **Services** | The catalog: add, edit, reorder, archive | owner, member |
| **Members** | From S1 | owner (actions) |
| **Account** (personal) | Name, language, password, sign out everywhere, **delete my account** | every user |
| **Danger zone** | **Delete workspace** (type the name to confirm) | owner |

- Members can read business, payment and tax settings (they appear on documents) but only owners change them.
- **Validation:** NIF, NIS, RC and RIB/RIP get digit and length checks only. **Exact formats are to be confirmed with an accountant** before S8 (factures). Until then they are checked loosely, never rejected on format alone.

### 5.1 Deleting (law 18-07)
- **Delete my account:** allowed if the user is not the last owner of any workspace (otherwise they delete or hand over the workspace first). Removes the user, sessions and memberships.
- **Delete workspace:** removes the workspace and everything in it, after typing its name. An email confirms it to all owners.
- ⚠ **Revisit in S8:** once factures exist, Algerian law requires keeping issued invoices for years. Deleting a workspace with issued factures will then need an export and probably a retention period. Not a problem in S2, because no factures exist yet.

---

## 6. Just-in-time completeness

One pure function in `@freelo/domain` decides what a document still needs:

```ts
missingFor(profile, "devis" | "facture"): MissingField[]
```

| Document | Required |
|---|---|
| Devis | Business name, business phone or email, address + wilaya |
| Facture | Everything for a devis, plus legal form, NIF, NIS, RC or auto-entrepreneur card, article d'imposition, at least one payment method, tax mode |

*(The facture list is provisional until the accountant confirms the legal mentions.)*

- S6 and S8 call it before issuing. If anything is missing, a dialog asks for **exactly those fields**, saves them to settings, and continues. The user never leaves the document they were working on.
- The Ready checklist and a settings banner use the same function.

---

## 7. Data model (migration `0002`)

| Table | Columns |
|---|---|
| `organization_profile` (1:1 with organization) | `organization_id` (PK, FK), `logo_file_id`, `document_locale` (`en`\|`fr`, default `en`), `timezone` (default `Africa/Algiers`), `currency` (default `DZD`), `team_size` (`solo`\|`small_team`\|`agency`, nullable), `typical_budget` (enum of the brackets, nullable), `legal_name`, `legal_form`, `nif`, `nis`, `rc_number`, `ae_card_number`, `article_imposition`, `address`, `wilaya`, `business_phone`, `business_email`, `payment_methods` (jsonb, validated by zod), `payment_note`, `tva_subject` (boolean, nullable until set), `tva_default_rate_bp` (basis points), `tva_exemption_mention`, `onboarding_step` (1–3), `onboarding_completed_at`, `created_at`, `updated_at` |
| `services` | `id`, `organization_id`, `name`, `description`, `price` (centimes, nullable), `unit` (`project`\|`day`\|`month`\|`item`), `position`, `archived_at`, `created_at`, `updated_at` |
| `files` | `id`, `organization_id`, `kind` (`logo` for now), `storage_key`, `mime_type`, `size_bytes`, `uploaded_by`, `created_at` |

Activity events: `onboarding.completed`, `workspace.profile_updated` (settings changes; which fields changed, never their values).

---

## 8. Storage (first use, deferred from S0)

- One `Storage` adapter in the API with `put`, `getSignedUrl` and `delete`.
- **Production:** S3-compatible (Cloudflare R2).
- **Development:** a local-disk driver writing to `.data/uploads/` (git-ignored), served by an API route that checks a signed, expiring URL. This replaces MinIO, whose images left Docker Hub.
- Logos are small, so they upload **through the API** (multipart, 2 MB limit, magic-byte check), stored at `org/<organization_id>/logo/<uuid>.<ext>`. Presigned direct uploads arrive with bigger files in S9.

---

## 9. API contract

| Method + path | Who | Purpose |
|---|---|---|
| `GET /api/v1/onboarding` | session | Current step and saved answers (or `null` before step 1) |
| `POST /api/v1/onboarding/business` | verified session | Step 1: creates the workspace + profile (or updates the name when going back) |
| `PUT /api/v1/onboarding/services` | owner | Step 2: replaces the onboarding services list |
| `PUT /api/v1/onboarding/work` | owner | Step 3: team size, budget, optional invitations |
| `POST /api/v1/onboarding/complete` | owner | Marks complete, records `onboarding.completed` |
| `GET / PATCH /api/v1/workspace/profile` | org / owner | General, business, payment and tax settings (one zod schema per section) |
| `GET /api/v1/workspace/profile/missing?for=devis\|facture` | org | `missingFor` result |
| `GET / POST /api/v1/services`, `PATCH / DELETE /api/v1/services/:id`, `POST /api/v1/services/reorder` | org | Catalog. Delete archives a service once documents use it (S6+); hard delete before that. |
| `POST /api/v1/workspace/logo`, `DELETE /api/v1/workspace/logo` | owner | Upload / remove the logo |
| `DELETE /api/v1/me` | session | Delete my account (§5.1) |
| `DELETE /api/v1/workspace` | owner | Delete the workspace, body `{ confirmName }` |

Guard: business routes (S3+) require `onboarding_completed_at` for **owners** of a workspace. The web app redirects owners to `/onboarding` until then. Members are never blocked.

---

## 10. Web screens

- `/onboarding` (3 steps + Ready), using the Figma layout: left stepper, white content area, green primary button.
- `/app/settings/general`, `/business`, `/payment`, `/tax`, `/services`, `/members`, `/account`.
- The "missing details" dialog component, built here and reused by S6 and S8.
- Every amount displays through `formatMoney` (DZD, the user's locale). Every string is in i18n (EN/FR).

---

## 11. Figma updates needed

1. Onboarding: 3 steps (business · what you sell · how you work) + Ready, replacing the current 4. Remove the name, email, timezone and currency fields. Budget brackets in DA. Logo hint "PNG, JPEG or WebP, max 2 MB".
2. Service rows (chip → row with name, price, unit).
3. Settings pages (§5) and the "missing details" dialog.
4. Delete account / delete workspace confirmations.

---

## 12. Acceptance criteria

1. Sign-up → verify → `/onboarding` → step 1 creates the workspace, profile and owner in one transaction.
2. Steps 2 and 3 can be skipped. Refreshing at any step resumes there with the answers kept. Unconfirmed edits come back on the same browser, the draft is cleared after "Continue" and sign-out, and the form still works with storage blocked.
3. Services from step 2 appear in the catalog with prices in centimes, shown as DA.
4. An invited member never sees onboarding.
5. A logo over 2 MB, an SVG, or a file renamed to `.png` that isn't a PNG is rejected with a clear error.
6. `missingFor` returns the right fields for devis and facture, covered by unit tests for every field.
7. Only owners can change settings (members get `403 FORBIDDEN`).
8. Deleting a workspace removes all its rows (cascade) and stored files. Deleting an account is refused while the user is the last owner of a workspace.
9. All new repositories pass the tenancy guard. Typecheck, unit and integration tests pass.

---

## 13. Non-goals (S2)

- The AI conversation (the hook only, §4.2).
- Intake form generation (S5), devis and project templates (S6, S9).
- Branding beyond the logo (colors, fonts): later, with document templates.
- Currencies other than DZD, Arabic.
- Workspace data export (needed before S8 deletion rules).

---

## 14. Open items

| # | Question | Owner |
|---|---|---|
| Q1 | Exact formats and required mentions for NIF, NIS, RC, AE card, article d'imposition, RIB/RIP | Accountant, before S8 |
| Q2 | Budget brackets in DA | Interviews with 5–10 freelancers |
| Q3 | The common services list for the chips | Same interviews |
| Q4 | When to add the AI onboarding hook | Once an AI API account exists (also needed for AI devis drafts, which are in the launch scope) |
