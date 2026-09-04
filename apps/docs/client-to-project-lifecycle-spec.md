# Client → Project Lifecycle — Feature Spec ("Onboard")

**Status:** Design finalized, not yet built
**Scope:** From a client existing (however they got there) through starting a project with them. Does not cover Task or File management within a project — those are separate cycles.

---

## 1. Purpose

Remove the friction of starting new work with a client — whether they're brand new or returning — without forcing every client through the lead pipeline, and without scattering "create a project" into multiple inconsistent flows.

---

## 2. Client Entity

Unlike Lead and Project, **Client does not get a full state machine.** A client's "active vs. dormant" standing is a UI-level distinction only, derivable from whether they have any project not in `completed`/`cancelled` — it is not stored.

**One field is still needed:** `archivedAt` (nullable timestamp) — see §4.3. This is a deliberate, minimal addition, not a reversal of the "no client status" principle: it exists purely to support soft-delete, not to model a business-meaningful lifecycle the way Lead/Project status does.

---

## 3. Screens & Touchpoints

| Touchpoint | Purpose |
|---|---|
| Kanban board (`/dashboard/kanban`) | Existing generic "+ Add Project" |
| Clients list (`/dashboard/clients`) | Gains "+ Add Project" |
| Client detail page (`/dashboard/clients/:id`) | Gains "+ New Project" (client pre-filled) and a new "Projects" section |
| Dashboard / Overview (W9, not yet built) | Will gain "+ Add Project" once that page exists — noted now, not actionable yet |
| Won conversion dialog (already shipped) | Existing project-creation entry point, unchanged |

---

## 4. Detailed Flows

### 4.1 Unified Project Creation

**One dialog component, reused across every entry point — not a separate feature per page.** The only thing that changes between placements is whether the client is already known:

| Entry point | Client known? | Behavior |
|---|---|---|
| Kanban "+" | No | Client picker shown: select existing, or create new inline |
| Clients list "+" | No | Same — picker shown |
| Client detail page "+ New Project" | Yes | Client pre-filled via `preselectedClientId`, picker skipped |
| Dashboard "+" (future) | No | Picker shown |
| Won conversion dialog | Yes (just converted) | Client pre-filled, part of the existing conversion transaction |

### 4.2 Client Creation

**No standalone "Add Client" page or route.** Creating a client happens only as a side effect of one of:
- Lead conversion (existing)
- Choosing "create new" inline inside the unified project-creation dialog's client picker

This is deliberate: in this product, a client without a project doesn't really occur in practice, so there's no reason to offer client creation as its own disconnected action.

### 4.3 Deleting a Client

- **0 associated projects:** unchanged — real hard delete, same as today.
- **≥1 associated projects:** the delete action becomes an **archive** instead. No cascade-delete option is exposed in the UI for this case — a destructive action that could wipe project history isn't offered as a casual button click.
  - Archive sets `archivedAt` on the client. The client disappears from the default Clients list.
  - Every project that belonged to them is completely unaffected — same client name on the card, same working link to the client's page, nothing breaks. This is the reason archive was chosen over nulling the project's client reference: history (including the client's own name/email/company) stays intact for the "reuse as inspiration later" case.
  - The client's own page, if visited directly, shows an "Archived" indicator plus a **Restore** action to undo it. A soft-delete without a way back isn't really soft.
  - Archived clients follow the same visibility rule as archived (Lost) leads: hidden from the default list, visible via a filter/tab. One consistent mechanism, not two.
  - Archived clients **do not appear** in the project-creation client picker. To start a new project with a previously-archived client, restore them first from their own page — this keeps the "who's active" picture consistent everywhere rather than letting an archived client sneak back in through a side door.

### 4.4 Client Detail Page — New "Projects" Section

Lists the client's existing projects (name, stage, deadline) — the natural read-side complement to being able to create one from that page. Uses the same relation already in the schema (`clients.projects`), just not surfaced in UI until now.

---

## 5. Data Model Changes Required

| Change | Table | Status |
|---|---|---|
| `archivedAt` (nullable timestamp) | `clients` | Not yet built |
| `ClientRepository.findByOrganizationId` filters out archived by default | n/a (repository logic) | Not yet built |
| Archive/restore service methods (replacing plain `delete` for the ≥1-project case) | `ClientService` | Not yet built |
| `preselectedClientId` prop threading through the shared project-creation dialog | Frontend only | Not yet built |

---

## 6. Explicit Non-Goals (this cycle)

- A standalone "Add Client" page or form
- A hard-delete-with-cascade option for clients that have projects, exposed anywhere in the UI
- Building the Dashboard/Overview page itself — only its future button placement is noted here
- Any client-facing portal work — still Phase 6, untouched

---

## 7. Open Items Deferred to Later

- Whether "active vs. dormant" client status should ever become a visible filter/badge in the Clients list (currently: derivable on demand, not stored, not surfaced)
- Bulk client import from other tools — mentioned as a possible future need given FreeLo's centralization goal, not scoped here
