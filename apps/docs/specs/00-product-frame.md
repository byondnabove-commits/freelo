# 00 — Product Frame

**Status:** Locked v3 (2026-11-11). Market decisions in §2, product decisions in §11. Phase 0 is closed.
**Phase:** 0 of the redesign (see "Process" at the bottom)
**Purpose:** The single reference every feature spec builds on: market, users, jobs, lifecycle, domain model, principles, scope.

> The product is less than half built. This document describes the **target product**, not the current code. Gaps with the current code are resolved in the Phase 1 audit.

---

## 1. Positioning

**One line:** FreeLo is the professional back office for Algerian freelancers and small studios. It takes an inquiry to a signed, delivered and paid project, and makes the freelancer look like an agency.

**The problem.** An Algerian freelancer today runs their business on WhatsApp, phone calls, Word/Canva quotes (devis), Excel and paper invoices. Leads get lost in chats, quotes look improvised, nobody tracks who paid what, and invoices often miss the legal mentions.

**One local tool overlaps: GoGoPact** (AI proposals and contracts for Algerian agencies, 4,900–8,900 DZD/user/month, no free plan, no factures shown). See `pricing-model.md` §8. It covers winning the deal. FreeLo covers the whole path, from the inquiry to the money collected. For most freelancers, the real competitor is still the habit stack: **WhatsApp + Word/Canva + Excel**. International tools (HoneyBook, Dubsado, Bonsai, Moxie) are built on Stripe and e-signature, work in USD, and none of them fit Algerian payment methods, DZD or local invoice rules.

**Why FreeLo wins:**
1. **Built for how Algeria works.** DZD, CCP/BaridiMob/bank transfers/cash/cheque, compliant devis and factures, French documents, printed and stamped contracts.
2. **Looks professional in one click.** A branded intake form, devis, contract and facture, all generated from the same data with nothing retyped.
3. **One place for the whole client relationship.** Lead, devis, contract, project, files and payments are all linked, instead of spread across WhatsApp threads.
4. **Free to start.** A reverse trial, then a useful free plan. Nobody has to pay before they see the value.

---

## 2. Locked market decisions

| # | Decision | Value |
|---|---|---|
| M1 | Launch market | **Algeria only.** International expansion later if it works. Keep the schema ready (currency and language stored per org and per document) but build no foreign flows now. |
| M2 | Freelancers' clients | **Algerian clients** (businesses and individuals). |
| M3 | Currency | **DZD.** Amounts stored in integer centimes plus a currency code, so other currencies can be added later without a migration. |
| M4 | Client payments | **Offline, recorded in FreeLo.** Documents show the freelancer's payment instructions (CCP/RIP, BaridiMob, bank RIB, cash, cheque). The freelancer records each payment received. Online payment (CIB/Edahabia through a local gateway such as Chargily or SATIM) is a later option, not v1. |
| M5 | Signatures | **No e-signature in the app** (legal caution). **Contracts** are generated as PDF, printed, signed and stamped in person, and the signed scan can be uploaded. **Devis** can also be accepted online ("bon pour accord"): checkbox, typed full name, email one-time code, then an immutable acceptance record (name, contact, timestamp, IP, browser, hash of the exact version) and a locked PDF with an acceptance footer. Per devis, the freelancer chooses online, paper, or both. Have a lawyer confirm the evidentiary value before launch. |
| M6 | Languages | **French and English** for the app and documents. Documents default to French. Arabic (right-to-left) later. |
| M7 | Free tier | **Reverse trial:** every new workspace gets full paid features for 30 days, then drops to a limited forever-free plan. Paid plans are **prepaid** (monthly or yearly) in DZD, with no automatic renewal. |
| M8 | Project start | **Always an explicit action by the freelancer.** No status change or setting ever creates a client or a project on its own (§5). |

---

## 3. Who it is for

### Primary persona: the solo Algerian freelancer
- Graphic or brand designer, web designer or developer, UI/UX, motion/video, photographer, content or social media manager.
- Often under the **auto-entrepreneur** status (or wants to get it). Needs invoices that hold up for clients who are companies.
- Works with local SMEs, shops, restaurants, startups, event organizers and individuals.
- Talks with clients mostly on **WhatsApp and by phone**, and less by email.
- Pain: looking professional, tracking payments and unpaid balances, endless feedback rounds, scope creep, leads lost in chats.

### Secondary persona: the small studio or agency (2–5 people)
- Same work, plus shared client context and task assignment. Studio plan.

### External persona: the client
- Never creates an account.
- Gets a **link** (sent over WhatsApp or email) to view a devis, an invoice or project files.
- Often prefers a **printed, stamped document** for anything binding or for accounting.
- Every client-facing screen must work on a phone over a slow connection.

### Not for (v1)
- Freelancers whose clients are mainly abroad (USD/EUR, Payoneer): a later expansion.
- Agencies with more than 10 people, and timesheet-driven consultants.

---

## 4. Jobs to be done

| # | Job (freelancer) | Today in FreeLo |
|---|---|---|
| J1 | Capture inquiries professionally (link in bio, WhatsApp, website) | Built (forms, public page) |
| J2 | Keep every lead in one list, know where each one stands, never forget a follow-up | Partial |
| J3 | Produce a clean devis in minutes from my services and prices | Missing |
| J4 | Produce a contract from a template, print it, get it signed, keep the proof | Missing |
| J5 | Start the project with a standard plan, without retyping anything | Partial (no templates) |
| J6 | Share progress and files, and collect feedback in one place instead of 200 WhatsApp messages | Missing |
| J7 | Issue compliant factures (deposit, balance) and know exactly who still owes me what | Missing |
| J8 | See at a glance what needs my attention today | Missing |
| J9 | Reuse my services, templates and past client data | Partial |

| # | Job (client) |
|---|---|
| C1 | Understand exactly what I'm paying for (a clear devis) |
| C2 | Get proper documents for my accounting (devis, contract, facture) |
| C3 | See project progress and files without chasing the freelancer |
| C4 | Give feedback on the work in context |
| C5 | Know how much I've paid and what's left |

---

## 5. The end-to-end lifecycle (target)

```
 ACQUIRE           CLOSE                              DELIVER                          WRAP UP
┌─────────┐  ┌──────────────────────────────┐  ┌─────────────────────────────┐  ┌──────────────────┐
│ Intake  │─▶│ Lead (triage, follow-ups)    │─▶│ "Start project" (explicit)  │─▶│ Balance facture  │
│ form or │  │   └─ Devis / Proposal        │  │  from a project template    │  │ Final files      │
│ manual  │  │        ├ packages / options  │  │ Tasks · Milestones          │  │ Project completed│
│ (WA,    │  │        ├ contract (PDF)      │  │ Files · Feedback            │  └────────┬─────────┘
│ phone)  │  │        └ payment schedule    │  │ Deposit / milestone factures│           │
└─────────┘  │  Sent as link + PDF          │  │ Payments recorded           │           │
             │  Accepted = signed scan or   │  └─────────────────────────────┘           │
             │  freelancer marks accepted   │                                             │
             └──────────────────────────────┘                                             │
                        ▲──────── repeat work: new devis for an existing client ◀──────────┘
```

### Lifecycle rules
1. **Starting a project is always explicit.** There is one "Start project" action and one dialog, reused everywhere: accepted devis, won lead, client page, kanban, overview. The dialog is pre-filled from where it was opened, and the freelancer picks a project template.
2. **Status changes never create records.** Marking a devis accepted or a lead won only *suggests* the next step ("Start project?"). This removes the `autoConvertLeadsOnWon` path and the class of bugs that came from status-triggered side effects.
3. **Duplicates are blocked by the database.** At most one project per accepted devis (unique `proposal_id`), and public submissions keep the idempotency key. "Must happen once" is always a database constraint, not an application check.
4. **Acceptance is recorded, not e-signed.** A devis becomes accepted when the client accepts it online ("bon pour accord" record), the freelancer uploads the signed scan, or the freelancer marks it accepted (with the date and a note). A contract becomes accepted only through the scan upload or a manual mark. Accepted versions are locked, so any change creates a new version.
5. **Money follows the schedule.** The devis defines the payment schedule (for example 50% at signature, 50% on delivery). Factures are generated from it, and payments recorded against factures. Nobody retypes amounts.
6. **Returning clients skip intake.** A new lead or devis can be attached to an existing client.

---

## 6. Domain model (target)

`★` exists today · `◐` exists, needs rework · `○` missing

```
Organization ★ ─┬─ Member ★ (owner | member)
                ├─ OrganizationProfile ◐ (branding, legal identity: NIF, NIS, RC/AE card, RIB/CCP, address)
                ├─ Subscription ◐ (plan, prepaid period, trial end)
                ├─ Service ◐ ──▶ Package ○ (priced bundles used in a devis)
                │
                ├─ Form ★ ─ FormField ★ ─ FormSubmission ★ ──creates──▶ Lead ★
                │
                ├─ Client ◐ ─ Contact ○ (people; one primary; phone required, email optional)
                │
                ├─ Lead ◐ (an opportunity; links to an existing Client when known)
                │     └─ Proposal/Devis ◐ ─┬─ LineItem ○ (options / packages)
                │                          ├─ Contract ◐ (from a template, PDF) ─ SignedCopy (File) ○
                │                          └─ PaymentScheduleItem ○
                │
                ├─ Project ◐ (from ProjectTemplate ○) ─┬─ Milestone ○
                │                                      ├─ Task ★
                │                                      ├─ File ★ ─ Annotation ◐ (feedback)
                │                                      ├─ Message ◐
                │                                      └─ Invoice/Facture ★ ─ LineItem ★ ─ Payment ○
                │
                ├─ Template ○ (devis | contract | project | message)
                ├─ ActivityEvent ○ (timeline and audit for every entity)
                ├─ Notification ◐
                └─ ShareLink ○ (expiring, revocable link to a client-facing view)
```

### Biggest model changes compared with today
| Change | Why |
|---|---|
| Legal identity on OrganizationProfile (NIF, NIS, RC or auto-entrepreneur card, article d'imposition, RIB/CCP) | Required on Algerian factures and devis |
| Client gets Contacts (phone first) | Companies have several people. In Algeria the phone or WhatsApp is the main channel. |
| Lead becomes an opportunity, linkable to an existing client | Repeat work |
| Devis gets line items, options and a payment schedule | Packages, factures generated from the devis, deposits |
| Payment as its own table | Partial payments and "what's still owed" (J7, C5) |
| ProjectTemplate | Replaces parsing free-text lead fields to build a project |
| ShareLink | Client-facing pages without accounts, shareable on WhatsApp |
| ActivityEvent | Timelines, audit, follow-ups |

---

## 7. Glossary

| Term (code / UI FR / UI EN) | Meaning |
|---|---|
| `organization` / Espace / Workspace | The tenant: one freelancer or studio |
| `member` / Membre / Member | A user inside the workspace |
| `lead` / Prospect / Lead | An opportunity, someone who may buy |
| `client` / Client / Client | The paying party (person or company) |
| `contact` / Contact / Contact | A person at a client |
| `service` / Service / Service | Something the workspace sells |
| `package` / Formule / Package | A priced, scoped bundle used in a devis |
| `proposal` / Devis / Quote | The priced offer sent to a client |
| `contract` / Contrat / Contract | The legal agreement, printed and signed |
| `invoice` / Facture / Invoice | A request for payment (deposit, milestone, balance) |
| `payment` / Paiement / Payment | Money actually received |
| `project` / Projet / Project | The delivery container |
| `share_link` / Lien de partage / Share link | An expiring link to a client-facing page |

> In Algerian practice the "proposal" *is* the **devis**. The UI says Devis in French. The code keeps `proposal`.

---

## 8. Product principles (apply to every spec)

1. **No client accounts.** Clients use expiring, revocable share links, made to be pasted into WhatsApp.
2. **Branded by default:** logo, colors and legal identity on every document and client page.
3. **Print-ready documents.** Every devis, contract and facture renders to a clean A4 PDF with a space for signature and stamp.
4. **Mobile-first and light for client pages,** desktop-first for the freelancer's app.
5. **Status is a label; records are facts.** Decisions are based on records (a payment row, a signed-copy file, a project row), never on a status string.
6. **Status changes have no hidden side effects.** Creation is always an explicit user action.
7. **Money:** integer centimes plus a currency code. Never floats.
8. **Time:** stored in UTC, shown in Africa/Algiers by default (taken from the org's timezone).
9. **Archive, don't delete,** once a record has history. Payments and accepted documents are immutable. Correct them with a new entry, never by editing.
10. **"Must happen once" is a database constraint** (unique keys, idempotency keys).
11. **Every meaningful action writes an ActivityEvent.**
12. **Defaults beat settings:** onboarding produces a ready-to-use devis template, contract template, project template and intake form.

---

## 9. Free tier and plans (direction; details go in the subscriptions spec)

> Locked prices, costs, margins and user milestones are in `pricing-model.md`: Solo 3,000 DZD/month (30,000/year), Studio 5,000 DZD per member per month (minimum 2 members). The starting limits listed below are superseded by that file.

- **Trial:** 30 days with all features, no payment needed.
- **Free plan (forever):** limited by capacity, never by feature. Starting point:
  - 1 member
  - 2 active projects
  - 1 published form
  - 20 new leads per month
  - 500 MB of storage
  - a "Made with FreeLo" mark on PDFs and client pages
- **Paid plans (Solo, Studio):** prepaid monthly or yearly in DZD. Higher limits, no FreeLo mark, team seats (Studio). Prices are set in the subscriptions spec. The current $29 and $79 figures do not fit the market.
- **Downgrade:** nothing is deleted. Items over the limit become read-only, and the user frees a slot by archiving.
- **Collecting FreeLo's own subscription payments:** manual (BaridiMob/CCP transfer plus admin activation) at launch, then a local gateway. Decided in the subscriptions spec.

---

## 10. Scope tiers

| Tier | Contents |
|---|---|
| **MVP — launchable** | Auth and onboarding (rework, including legal identity) · Forms · Leads (with follow-ups) · Clients + Contacts · Services/Packages · **Devis** with options, schedule and PDF · **Contracts** from templates, PDF, signed copy upload · **Factures and payments** (deposit, balance, outstanding balance) · "Start project" dialog + project templates · Projects + tasks (kanban) · Share links (devis, facture, project files) · Activity timeline · Overview "today" page · Reverse trial + Free plan |
| **v1.1** | Client portal (one link per client: projects, files, factures) · Feedback and annotations on files, approvals · Milestone factures · Payment reminders · In-app notifications · Basic reports (revenue collected, outstanding, pipeline) |
| **MVP addition** | **AI devis drafts + AI lead summaries**, with plan quotas |
| **v1.2** | Studio: team seats and task assignment · White-label · AI contract drafts (if not in v1.1) · CSV export |
| **Later** | Online payment (CIB/Edahabia) · Arabic/RTL · Automations · Time tracking · Expenses · Foreign clients (USD/EUR) |

---

## 11. Product decisions (all locked 2026-11-11)

| # | Decision | Locked value |
|---|---|---|
| D6 | Client model | **Client + contacts.** A client (company or person) has one or more contacts. One is primary, and the phone is required. Each contact can have a role (approves, pays, reviews). |
| D8 | Pricing models in v1 | **Fixed-price lines + packages (formules) + payment schedule** (deposit, milestones, balance). Factures are generated from the schedule. Hourly and retainers come later. |
| D9 | AI | **AI devis drafts and lead summaries in the MVP**, with monthly quotas per plan (`pricing-model.md`). AI contract drafts in v1.1. |
| D10 | Taxes | **Per-workspace setting:** "not subject to TVA" (with the legal mention printed) or TVA rates (19% / 9%) per line. Exact legal mentions and auto-entrepreneur rules **must be checked with an Algerian accountant** before the factures spec is locked. |
| D11 | Scope | **As in §10**, with AI devis drafts and online devis acceptance in the MVP. Client portal and file feedback in v1.1. |

---

## Process

| Phase | Output | Status |
|---|---|---|
| 0 | This document | **Done** |
| 1 | Audit: as-built vs docs vs this frame, with a keep / rework / cut / new verdict per feature | **Next** |
| 2 | One spec per feature, in dependency order: Foundation (auth, workspace, onboarding, settings and legal identity, services) → Acquisition (forms, leads) → Close (devis, contracts) → Money (factures, payments) → Delivery (clients, start project, projects, tasks, files) → Client-facing (share links, portal, feedback) → Insight (overview, reports) → Monetization (trial, plans, subscriptions) | — |
| 3 | Cross-cutting standards (API, errors, pagination, idempotency, activity log, PDF generation, storage, email, i18n FR/EN, security, migrations, testing) | — |
| 4 | Gap analysis, then an ordered backlog of vertical slices | — |

Spec template for Phase 2: purpose · user stories · state machine · screens and flows · edge cases · permissions and tenancy · notifications · data model · API contract · acceptance criteria · non-goals · open items.
