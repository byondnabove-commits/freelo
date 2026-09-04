# Lead → Client Lifecycle — Feature Spec

**Status:** Design finalized, partially implemented (Won flow shipped; Lost flow and idempotency pending build)
**Scope:** From public form submission through a lead becoming a client (and optionally a project). Does not cover Discovery, Brief, or Proposal — those are future stages with no code yet.

---

## 1. Purpose

Eliminate manual, error-prone handling of inbound inquiries. The freelancer should never have to guess whether a lead was actually converted, never lose a duplicate-click submission to a double-send, and never lose visibility into *why* a deal was lost.

---

## 2. Lead State Machine

```
new → contacted → qualified → proposal_sent → negotiating → won
                                                            → lost
```

- States are freely movable between each other via a manual dropdown (no enforced linear order) — this is a pipeline stage indicator, not a strict workflow gate.
- `won` and `lost` are the only states with dedicated side-effect flows (below). All other transitions are a plain status update with no side effects.
- **`status` is never trusted as a signal that an action occurred.** It's a label the freelancer sets. Whether a lead was actually converted is answered by whether a `client` row referencing it exists — never by `status === "won"`. This is the single most important rule in this spec; it's the rule the original production bug violated.

---

## 3. Screens & Touchpoints

| Touchpoint | Purpose |
|---|---|
| Public intake form (`/f/:slug`) | Prospect submits inquiry |
| Leads table (`/dashboard/leads`) | Browse/sort/filter all leads, inline status dropdown per row |
| Lead detail page (`/dashboard/leads/:id`) | Full deal context, notes, status control, conversion actions |
| Won conversion dialog | Appears on Won transition (unless auto-convert is on) |
| Lost reason dialog | Appears on Lost transition |

---

## 4. Detailed Flows

### 4.1 Form Submission

**Happy path:** Prospect fills form → submits → lead row created → two emails sent (owner notified, prospect confirmed).

**Duplicate-submission protection (industry-standard idempotency key, not a time-window heuristic):**
1. Form generates a random key (`crypto.randomUUID()`) once when it loads — not regenerated on re-render.
2. Submit button disables immediately on click — fast UI feedback, first line of defense only.
3. Key is sent with the submission payload.
4. `form_submissions.idempotencyKey` has a **unique DB constraint**. A second request with the same key returns the existing result instead of creating anything — no duplicate lead, no duplicate email, regardless of *why* the duplicate request happened (double-click, retry, flaky network).
5. A genuinely new submission (new form load, new key) is never blocked — this only guards against the same submission being processed twice, not against the same prospect submitting a new inquiry later.

This is a stronger guarantee than the Won-conversion race guard (which relies on an application-level check inside a transaction): a unique constraint holds even if application code has a bug. Worth applying this same pattern anywhere "this must only happen once" matters.

**Frozen fields, deliberate:** Company, budget, timeline, project type, description are captured once at submission and are **not editable afterward**. This data exists to help the freelancer prepare for the discovery conversation (research the company, draft questions) — it is not a source of truth once a Brief exists (future feature). No edit UI is planned for these fields.

### 4.2 Lead Review & Qualification

Freelancer moves a lead through `new → contacted → qualified → proposal_sent → negotiating` via the status dropdown (`LeadStatusBadge`, present on both the table and detail page). Plain status update, no side effects, at every step except the two below.

### 4.3 Marking Won

Trigger: status dropdown → `won`, and no client exists yet for this lead.

1. Check org preference `autoConvertLeadsOnWon` (stored in `organization.metadata`).
2. **If on:** silently create client + project using a templated name/description/deadline derived from the lead's own data. Toast confirms. No dialog.
3. **If off (default):** show the **Won dialog**:
   - Read-only deal summary (company, project type, budget, timeline, original description)
   - Editable project template: name (pre-filled `"{Project Type} — {Company}"`), deadline (best-effort parsed from the freeform timeline text, e.g. "15 days" → today+15; blank if unparseable), description (copied from the lead)
   - Checkbox: "Always do this automatically — don't ask again" → flips the org preference for future conversions
   - **Not yet** → saves `status: won` only, no client/project created
   - **Convert & create project** → client + project created in one transaction; if the project insert fails, the client insert and status update both roll back too
   - Dismissing without choosing a button (outside click, Escape) does nothing at all — not even the status change saves. No silent side effects from closing a dialog.
4. The real "is this converted?" signal, everywhere: does a client row exist referencing this lead. Never `status === "won"`.

### 4.4 Marking Lost

Trigger: status dropdown → `lost`.

1. Show the **Lost dialog**: a required reason dropdown (see enum below) — required, not optional, because an optional field gets skipped and defeats the point of tracking loss patterns.
2. Reason is stored in a new `lead_lost_reason` enum column. Free-form elaboration, if any, goes in the lead's existing `notes` field — no new text column needed.
3. On confirm: status set to `lost`, reason saved.
4. The lead is **archived** — meaning excluded from the Leads table's default view. "Archived" is not a stored field; it's derived purely from `status === "lost"`, the same principle as the conversion signal: never store a second fact that has to stay in sync with a first one. A filter/tab on the Leads table (e.g. "Show lost") reveals archived leads on demand.
5. This intentionally diverges from Won, which remains visible in the default list — Won and Lost are different outcomes (one produces a new entity worth seeing; the other closes a chapter) and don't need matching visibility rules.

**Lost reason enum:**
```
budget_too_low
chose_other_freelancer
timeline_mismatch
went_unresponsive
not_right_fit
other
```

---

## 5. Notifications Map

| Trigger | Recipient | Channel | Status |
|---|---|---|---|
| Form submitted | Freelancer (org owner) | Email + dashboard | Built |
| Form submitted | Prospect | Email (confirmation) | Built |
| Status changed (any) | — | — | None planned — pipeline moves are freelancer-initiated, no notification needed |
| Marked Won (dialog or auto) | Freelancer | Toast (in-app) | Built |
| Marked Lost | Freelancer | Toast (in-app) | Planned |
| Lead gone stale (no activity in N days) | Freelancer | — | **Deferred** — not designed, flagged as a future candidate, not part of this cycle's scope |

---

## 6. Data Model Changes Required

| Change | Table | Status |
|---|---|---|
| `convertedClient` derived field (not a column — computed in `LeadService.getById` from `clients.leadId`) | n/a | Shipped |
| `organization.metadata.autoConvertLeadsOnWon` (JSON key in existing column) | `organization` | Shipped |
| `lead_lost_reason` enum + column on `leads` | `leads` | **Not yet built** |
| `idempotencyKey` column (unique constraint) on `form_submissions` | `form_submissions` | **Not yet built** |

---

## 7. Explicit Non-Goals (this cycle)

- Editing captured lead fields after submission
- Merging/linking a prospect's repeat submissions into one lead
- Stale-lead reminders or follow-up automation
- Anything involving Discovery, Brief, or Proposal — no code exists for these yet; out of scope until those cycles are designed

---

## 8. Open Items Deferred to Later

- Stale-lead surfacing (dashboard callout for leads with no activity in N days) — worth revisiting once the Dashboard cycle is designed
- Whether a "lost" lead can ever be reopened / moved back into the active pipeline
