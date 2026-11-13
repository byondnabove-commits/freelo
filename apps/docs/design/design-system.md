# FreeLo design system

Status: draft v0.1 (2026-11-12). Light theme only in v1.
Source of truth for UI. Coding sessions read this before building any screen.
Decisions that change this file get a dated line in `decisions.md`.

Contents
1. Who we design for
2. The feeling (vibe)
3. Principles
4. Foundations: color, type, spacing, radius, elevation, motion, icons
5. Local formats (DA, dates, phone, wilaya)
6. Components
7. Screen patterns
8. Copy and language
9. Inspiration board
10. Open questions

---

## 1. Who we design for

Two audiences, two moods.

| | The freelancer (our user) | Their client |
|---|---|---|
| Who | Algerian freelancer or small studio: designer, developer, photographer, marketer | Algerian business owner or person |
| Device | Laptop for editing, phone for checking | Phone. Opens a link from WhatsApp |
| Frequency | Every day | Once or twice per devis or invoice |
| Needs to feel | "I'm in control. I look like a real business." | "This is serious and official. I know what to do." |
| Screens | App shell, Today, lists, editors, settings | Public form, public devis, public invoice, PDFs, emails |

Consequence: the app can be dense and fast. Client pages must be simple, large, and carry the freelancer's brand first. FreeLo stays small on client pages ("Powered by FreeLo" in the footer).

## 2. The feeling

Four words. Every screen should pass all four.

- **Calm**: lots of white, quiet borders, one strong color per screen. No dashboards full of charts.
- **Sure**: amounts, dates and statuses are always exact and easy to find. Nothing hides money.
- **Professional**: documents look like they come from a real company: aligned numbers, legal mentions, stamp space.
- **Local**: DA, wilayas, CCP/RIP, BaridiMob, French and English as equals. It feels built for Algeria, not translated.

Metaphor: **a clean, well-organized office desk**. Paper documents (devis, factures) are the heroes. The app is the desk around them.

What it is not: playful startup (no mascots, no confetti everywhere), bank-grey (no heavy navy blocks), crypto-dark (no neon on black).

## 3. Principles

1. **One primary action per screen.** Green button, top right of the page header. Everything else is secondary or ghost.
2. **Status is shape + color + word.** Never color alone (color-blind users, printed PDFs).
3. **Money is sacred.** Amounts are right-aligned, tabular figures, always with "DA". Totals are bold and never truncated.
4. **Phone-first for clients, desktop-first for the freelancer**, but every app screen must still work at 375px.
5. **Ask late.** Never ask a field before it's needed (legal details only before the first devis). Matches the onboarding decision.
6. **French-proof.** Design with French labels; they are 20–30% longer. No fixed-width buttons, no labels that only fit in English.
7. **RTL-ready.** Arabic comes later. Use logical CSS (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start`, `end`), never `left`/`right` for layout.
8. **Borders before shadows.** Shadows only for things that float (menus, dialogs, toasts, drawers).
9. **Empty states teach.** Every empty list says what goes there and offers the one action to add the first item.

---

## 4. Foundations

### 4.1 Color

Three color roles. Keep them apart.

- **Green = action.** Primary buttons, links, focus rings, selected nav, "paid/accepted" success. Also echoes the Algerian flag.
- **Purple = brand + AI.** The FreeLo mark, and everything AI does ("Draft with AI", AI summary). Users learn: purple means the machine wrote this, review it. Never use purple for normal buttons.
- **Neutrals = everything else.** Slightly green-tinted greys, so the UI feels warm, not cold blue-grey.

Status colors (amber, red, blue) appear only in badges, alerts and indicators, never as decoration.

#### Tokens (Tailwind v4 `@theme`, paste into `apps/web/src/index.css`)

```css
@theme {
  /* Neutrals: green-tinted grey */
  --color-ink-0:   #ffffff;  /* surfaces: cards, inputs, dialogs */
  --color-ink-25:  #fafbfa;  /* page canvas */
  --color-ink-50:  #f4f6f5;  /* muted surface, table header, hover row */
  --color-ink-100: #ebeeec;  /* selected row, chip bg */
  --color-ink-200: #dde2df;  /* default border, dividers */
  --color-ink-300: #c5ccc8;  /* input border, strong border */
  --color-ink-400: #98a19c;  /* placeholder, disabled text, icons idle */
  --color-ink-500: #6b746f;  /* subtle text (meta, captions) — 4.8:1 on white */
  --color-ink-600: #4f5753;  /* muted text (labels, secondary) */
  --color-ink-700: #373d3a;
  --color-ink-800: #232825;
  --color-ink-900: #131715;  /* main text, headings */

  /* Primary: green (actions) */
  --color-primary-50:  #eef8f1;
  --color-primary-100: #d6efde;
  --color-primary-200: #addfbf;
  --color-primary-300: #7cc99a;
  --color-primary-400: #45ae70;
  --color-primary-500: #1f9454;
  --color-primary-600: #167a45;  /* buttons, links — white text 5.4:1 */
  --color-primary-700: #11623a;  /* hover */
  --color-primary-800: #0e4e2f;  /* pressed */
  --color-primary-900: #0b3d25;

  /* Brand: purple (logo + AI only) */
  --color-brand-50:  #f2eefd;
  --color-brand-100: #e3dafb;
  --color-brand-500: #6a45e0;
  --color-brand-600: #4b1fd1;   /* existing logo color */
  --color-brand-700: #3c18a8;

  /* Status */
  --color-info-50:  #ebf2fe;  --color-info-600:  #2160d6;  --color-info-700:  #1a4dad;
  --color-warn-50:  #fff6e5;  --color-warn-600:  #b25e09;  --color-warn-700:  #8f4a06;
  --color-danger-50:#fdeeee;  --color-danger-600:#c8312f;  --color-danger-700:#a32724;
  /* success = primary-50 / primary-700 */
}
```

Usage table

| Need | Token |
|---|---|
| Page background | `ink-25` |
| Card, input, dialog | `ink-0` + border `ink-200` |
| Main text | `ink-900` |
| Labels, secondary text | `ink-600` |
| Meta (dates, captions) | `ink-500` |
| Primary button | `primary-600`, hover `primary-700` |
| Link | `primary-700`, underline on hover |
| Focus ring | 2px `primary-600` at 40% + 2px offset |
| Selected nav item | bg `ink-100`, text `ink-900`, icon `primary-600` |
| AI surface | bg `brand-50`, border `brand-100`, icon `brand-600` |

### 4.2 Status colors (one map for the whole app)

Each status = dot or icon + label + tint. Same map in app, client pages and PDFs (PDF uses the word only).

| Object | Status | Tone | Icon idea |
|---|---|---|---|
| Devis | Draft | neutral | pencil |
| | Sent | info | send |
| | Viewed | warn ("waiting for answer") | eye |
| | Accepted | success | check |
| | Declined | danger | x |
| | Expired | neutral, muted | clock |
| Invoice | Draft | neutral | pencil |
| | Sent | info | send |
| | Partly paid | warn | half-circle |
| | Paid | success | check |
| | Overdue | danger | alert |
| | Cancelled | neutral, struck | ban |
| Lead | New | info + filled dot | dot |
| | Contacted | neutral | message |
| | Devis sent | info | file |
| | Won | success | check |
| | Lost | neutral, muted | x |
| Project | Stage names are user-defined; show stage in neutral, only "Done" is success | | |

Badge style: height 22px, radius full, 12px medium text, tint bg (`*-50`) + text (`*-700`), 6px dot of `*-600`. No border.

### 4.3 Typography

- **UI font: Inter Variable** (already installed). Excellent French accents, tabular figures, works at small sizes.
- **Arabic later: IBM Plex Sans Arabic** or Noto Sans Arabic, as a fallback in the same stack.
- **Numbers:** `font-variant-numeric: tabular-nums` on every amount, table column, counter, date.
- **No second display font in the app.** Headings are Inter Semibold with tight tracking. A display face can come later for the marketing site only.

Type scale (app base = 14px; client pages base = 16px)

| Token | Size / line | Weight | Use |
|---|---|---|---|
| `text-xs` | 12 / 16 | 500 | badges, captions, table meta |
| `text-sm` | 13 / 20 | 400 | secondary text, table cells, helper text |
| `text-base` | 14 / 20 | 400 | app body, inputs, buttons |
| `text-md` | 16 / 24 | 400 | client pages body, dialog body |
| `text-lg` | 18 / 26 | 600 | card titles, section titles |
| `text-xl` | 20 / 28 | 600 | dialog titles |
| `text-2xl` | 24 / 32 | 600, -0.01em | page titles |
| `text-3xl` | 30 / 36 | 700, -0.02em | auth titles, big totals |
| `text-4xl` | 36 / 40 | 700, -0.02em | amount hero on public devis/invoice |

Section labels in the sidebar ("SALES", "DELIVERY", "MONEY"): 11px, 600, uppercase, +0.06em tracking, `ink-500`.

### 4.4 Spacing and layout

- 4px grid. Common steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Inside components: 8–12. Between fields: 16–20. Between sections: 32–40.
- Breakpoints: phone < 640, tablet 640–1023, desktop ≥ 1024, wide ≥ 1440.
- App shell: sidebar 248px fixed (≥ 1024), drawer below. Content max width 1200px for lists, 760px for forms and settings, full width for kanban.
- Page gutter: 16px phone, 24px tablet, 32px desktop.
- Control heights: 40px default (inputs, buttons), 32px small (table row actions, filters), 44px minimum touch target on phone and on client pages (use 48px buttons there).
- Table row: 48px. Compact lists: 40px.

### 4.5 Radius

| Token | px | Use |
|---|---|---|
| `rounded-sm` | 4 | checkboxes, tags inside inputs |
| `rounded-md` | 6 | small buttons, chips |
| `rounded-lg` | 8 | buttons, inputs, selects, menu items |
| `rounded-xl` | 12 | cards, table container, dropdown panels |
| `rounded-2xl` | 16 | dialogs, drawers, public page cards |
| `rounded-full` | — | badges, avatars, counters, toggles |

### 4.6 Elevation

Borders do the work at rest. Shadows only when floating.

| Level | Style | Use |
|---|---|---|
| 0 | border `ink-200` | cards, tables, inputs |
| 1 | `0 1px 2px rgb(19 23 21 / .06)` | sticky header after scroll, raised card on hover (kanban) |
| 2 | `0 8px 24px -6px rgb(19 23 21 / .16)` + border | dropdown, popover, date picker, toast |
| 3 | `0 24px 48px -12px rgb(19 23 21 / .24)` | dialog, drawer |
| Overlay | `rgb(19 23 21 / .40)` | behind dialog and drawer |

### 4.7 Motion

- 150ms ease-out for hover, focus, small state changes. 200ms for menus. 250ms for dialogs and drawers (fade + 8px rise, drawer slides from the end side).
- No bounces, no spring. One exception: a short check animation when a devis is accepted or an invoice is paid. That's the one moment of joy.
- Respect `prefers-reduced-motion`: drop movement, keep fades.

### 4.8 Icons

- **Lucide** (`lucide-react`), 1.75 stroke, 16px in tables and buttons, 18px in nav, 20px in empty states.
- Icons always next to a label in nav and buttons. Icon-only buttons need a tooltip and `aria-label`.
- Direction icons (arrows, chevrons) must mirror in RTL.

---

## 5. Local formats

Details only Algeria has. Get them right everywhere: app, client pages, PDFs, emails.

| Thing | Format | Example |
|---|---|---|
| Money in UI | space thousands, no decimals if zero, " DA" suffix | `125 000 DA` |
| Money in PDFs | space thousands, comma decimals | `125 000,00 DA` |
| Money in English UI | same as French (Algerian norm, not `125,000`) | `125 000 DA` |
| Money input | user types digits; we format live; suffix "DA" inside the field | `[ 125 000      DA ]` |
| Date | DD/MM/YYYY in both languages | `12/11/2026` |
| Relative date | "in 3 days", "3 days ago", "today" | |
| Phone | +213 then 9 digits, grouped | `+213 5 55 12 34 56` |
| Wilaya | select with number + name, searchable | `16 — Alger` |
| Tax IDs | NIF (15 digits), NIS (15), RC, auto-entrepreneur card number | monospace not needed; tabular |
| Bank | CCP (account + clé), RIP (20 digits), RIB | copy button next to each |
| TVA | percent, default 19%, or "Non assujetti" mention | |

Use a non-breaking space between number and "DA" so it never wraps alone.

---

## 6. Components

Recommended build base: **shadcn/ui pattern** (copy-in components, Radix primitives, Tailwind v4, tokens from section 4). It gives accessible dialog, dropdown, select, tabs, popover, tooltip for free and we own the code. Toasts: `sonner`. Date picker: `react-day-picker`. Drag and drop (form builder, kanban): `@dnd-kit`. Decide in section 10.

Each component below lists: purpose, variants, states, rules.

### 6.1 Actions

**Button**
- Variants: `primary` (green fill), `secondary` (white + border), `ghost` (no border), `danger` (red fill, only inside confirm dialogs), `danger-soft` (red text on red-50, for "Delete" entry points), `ai` (brand-50 bg, brand-700 text, sparkle icon).
- Sizes: `sm` 32px, `md` 40px, `lg` 48px (client pages, phone CTAs).
- States: hover, active, focus-visible, disabled, loading (spinner replaces icon, label stays, width stays).
- Rules: one primary per view. Label = verb + object ("Send devis", "Record payment"). Never "OK" or "Submit".

**Icon button**: square, same sizes, tooltip required.

**Split button / "+ New" menu**: primary-looking button with chevron; opens menu: Lead, Devis, Project, Invoice, Client. Shortcut `N`.

**Link**: green-700, underline on hover; external links get an arrow icon.

### 6.2 Inputs

**Text input / textarea**
- 40px, border `ink-300`, radius 8, focus: border `primary-600` + ring.
- Label above (13px, 500, `ink-800`), optional "(optional)" in `ink-500` — mark optional fields, not required ones.
- Helper text below in `ink-500`; error replaces helper, red-600, with icon.
- Textarea auto-grows to 8 lines.
- The auth screens' underline style stays on auth only; everywhere else use boxed inputs.

**Select**: same box, chevron at end. Searchable variant (combobox) for wilaya, client, service.

**Checkbox, radio, switch**: 16px boxes, green when checked. Switch only for instant settings (no Save button), checkbox inside forms.

**Radio cards**: bigger choice tiles (team size, plan picker, devis package choice on client page).

**Chip select** (onboarding skills, filters): pill, 32px; unselected `ink-0` + border; selected `primary-50` + `primary-700` text + check icon. "+ Add your own" chip opens inline input.

**DA amount input**: right-aligned digits, tabular, live space grouping, "DA" suffix in `ink-500`. Accepts paste like "125.000" or "125 000,00". Negative not allowed except discount lines.

**Phone input**: fixed "+213" prefix block, 9-digit field, auto-grouping.

**Date picker**: input showing DD/MM/YYYY + calendar popover; Monday first; quick picks ("Today", "+7 days", "+30 days") for due dates and follow-ups.

**File / logo upload**: dashed dropzone, 120px; shows preview square with "Replace" and "Remove". Logo rules shown as helper: PNG/JPG/SVG, max 2 MB.

**OTP code input** (client accepts devis): 6 boxes, 48px, auto-advance, paste fills all.

**Search input**: leading search icon, clear button, shortcut hint `/`.

**Copy field**: read-only input + "Copy" button → "Copied" for 2s. Used for share links, RIP, CCP.

### 6.3 Data display

**Table**
- Container: card (border, radius 12). Header row `ink-50`, 12px 500 `ink-600`, sortable headers show arrow on hover and when active.
- Rows 48px, hover `ink-50`, whole row clickable (opens detail), row actions in a `⋯` menu at the end.
- Amount columns right-aligned, tabular. Status column uses badges. First column = name in `ink-900` 500 + sub-line in `ink-500`.
- Bulk select checkbox column only where bulk actions exist.
- Phone: table turns into a card list (name + status top, amount + date bottom).

**Status badge**: see 4.2.

**Counter pill**: in nav ("Leads 3"): 18px, radius full, `ink-100` bg; turns `danger-50/700` for overdue invoices.

**Avatar**: circle, 24/32/40px, initials on tint generated from name (neutral tints only, not status colors). Workspace avatar = rounded square with logo.

**Key-value list** (detail pages): label column `ink-500` 13px, value `ink-900`; copy icon on hover for IDs and bank numbers.

**Stat card** (Today): label, big number (24px tabular), small context line ("3 overdue"). No sparklines in v1.

**Timeline / activity**: vertical line, 8px dot per event, actor + action + object + relative time. Client actions ("Ahmed viewed the devis") get the info dot; money events the green dot.

**Progress / limit meter**: 6px bar; green to 80%, amber 80–99%, red at 100%. Label "4 of 5 devis this month".

**Empty state**: 20px icon in a 40px `ink-50` circle, title (16px 600), one sentence, one primary button. Optional secondary link "Learn how".

**Skeleton**: `ink-100` blocks with a soft shimmer; matches the real layout (same rows, same columns).

**Tooltip**: dark (`ink-900`) bg, white 12px text, 200ms delay.

### 6.4 Navigation

**Sidebar** (see PDF section 1): workspace switcher at top, "Today", "+ New", grouped sections with uppercase labels, counters, Settings + Help, upgrade card, account menu at bottom.
- Item: 36px, radius 8, icon 18px + label; selected = `ink-100` bg + green icon + 500 weight.
- Phone: drawer from the start side behind a ☰ button in a 56px top bar.

**Page header**: title (24px), optional sub-line, actions at end (secondary then primary). Breadcrumb above the title only on detail pages ("Devis / DEV-2026-014").

**Tabs**: underline tabs for detail pages (Overview, Devis, Invoices, Files, Timeline); segmented control for 2–4 filters ("All / Unpaid / Overdue").

**Filter bar**: search + filter chips + "Clear". Applied filters show as removable chips.

**Pagination**: "1–25 of 132" + prev/next. No page number lists.

**Stepper** (onboarding, devis acceptance): numbered steps with labels on desktop; "Step 2 of 3" + thin progress bar on phone.

**Workspace switcher**: dropdown with workspace avatars, check on current, "Create another workspace" at the bottom.

### 6.5 Overlays and feedback

**Dialog**: 480px (small) / 640px (form) / 800px (editor). Title, body, footer with actions at end (cancel ghost, confirm primary). Closes on Esc and overlay click unless it has unsaved changes. Phone: full-width bottom sheet.

**Confirm dialog**: states the consequence ("This deletes 3 invoices. You can't undo it."). Destructive confirm button is `danger` and names the action ("Delete invoices").

**Type-to-confirm dialog** (delete workspace): input must equal the workspace name to enable the button.

**Drawer**: 480px side panel from the end side, for quick view of a lead or client without leaving the list.

**Dropdown menu**: 8px radius items, 32px tall, icons optional, destructive items last in red after a divider.

**Toast**: bottom-end (bottom center on phone), 4s, success/error/info icon, optional "Undo". Errors stay until closed.

**Alert / banner**:
- Inline alert (in forms): tint bg + icon + text.
- Page banner (trial "12 days left", "Missing business details"): full-width bar under the page header, dismissible only if not blocking.

**"Missing details" dialog**: lists only missing fields, grouped (Business, Payment, Tax), saves to Settings and continues the original action.

### 6.6 Documents (FreeLo specific)

**Line items editor** (devis, invoice): rows = description (with service autocomplete), qty, unit, unit price (DA), total. Drag handle to reorder, `⋯` for remove/duplicate. Add line / add from catalog / add section title. Totals block at the end: Subtotal, Discount, TVA 19%, **Total TTC** in 20px bold.

**Packages / options**: 2–3 side-by-side columns ("Essentiel / Pro / Premium"), one marked "Recommended". On client page phone: stacked radio cards.

**Payment schedule**: rows of % + amount + trigger ("At signing 50%", "At delivery 50%"); sum must be 100% (live check).

**Document preview**: A4 sheet (white, shadow level 1) scaled to fit, live updates while typing. Desktop editor = form left 55% / preview right 45%. Phone = "Preview" tab.

**Locked state**: grey "Locked — sent on 12/11/2026" banner, fields read-only, "Create new version" button.

**Share panel**: copy link field + "Send on WhatsApp" (green WhatsApp mark is allowed here) + "Send by email".

### 6.7 Client-facing (public pages)

Phone-first, 16px base, 48px buttons, max width 560px centered on desktop.
- Header: freelancer's logo + business name (not FreeLo). FreeLo only as small footer "Powered by FreeLo".
- Hero: document type + number, big amount (`text-4xl`), status badge, due/valid-until date.
- Sticky bottom bar on phone with the one action ("Accept the devis", "See payment details").
- Payment instructions card: method tabs (BaridiMob / CCP / Bank transfer), each number in a copy field, "Reference to write: FAC-2026-031".
- Acceptance: checkbox "Bon pour accord" + full name + email → OTP screen → success screen with the check animation and "Download PDF".

---

## 7. Screen patterns

Every screen is one of these templates. Build the template once.

### 7.1 App shell
Sidebar + content. Content = page header + body. Trial banner sits above the page header when relevant.
Inspiration: Linear (density, quiet chrome), Attio (sidebar sections), Stripe (page header with one primary action).

### 7.2 Today (overview)
Purpose: "What needs me today?"
Order, top to bottom:
1. Greeting + date (small, not a hero).
2. **Needs attention** list (most important block): follow-ups due, overdue invoices, devis viewed but not answered, expiring devis. Each row: icon, sentence, amount if money, one action button ("Remind", "Call", "Open").
3. Counters row: Open leads, Devis waiting, Unpaid DA, Active projects. 4 stat cards, 2×2 on phone.
4. Active projects (compact cards with stage + due date).
5. Recent activity (timeline, 8 items + "See all").
6. Getting-started checklist (until done): add logo, add a service, create a form, send your first devis. Collapses when complete.
Inspiration: your Figma "Overview" frame (base), Shopify admin home (setup guide), Stripe home (money summary), Linear inbox (attention list).

### 7.3 List page (Leads, Clients, Devis, Invoices, Projects list)
Header (title + count + primary action) → filter bar → table (desktop) / card list (phone) → pagination. Empty state when no rows; "No results" state (different copy) when filters hide everything.
Inspiration: Stripe Invoices list, Linear issues list, Attio records.

### 7.4 Detail page (Client, Lead, Project)
Breadcrumb + title + status + actions → two columns on desktop: main (tabs: overview, related devis/invoices, files, timeline) and side panel 320px (key-value details, contacts, follow-up date). Phone: side panel moves on top, collapsed.
Inspiration: Stripe customer page, HubSpot/Attio record page, Linear issue side panel.

### 7.5 Editor (Devis, Invoice, Contract)
Full-width, sticky top bar (back, document number, status, autosave "Saved", Preview, primary "Send"). Form left, live A4 preview right. "Draft with AI" button in brand purple at the top of the lines block.
Inspiration: Pennylane and Qonto invoice editors (French conventions), Stripe invoice editor (live preview), Bonsai proposals (packages).

### 7.6 Settings
Left sub-nav (General, Business details, Payment details, Tax, Services, Members, Plan & billing, Account) + 760px content. Each section = card with title, description, fields, Save button bottom-end (disabled until changed). Danger zone = last card, red border.
Inspiration: Linear settings, Vercel settings (section cards with save per card), GitHub danger zone.

### 7.7 Onboarding
Centered 560px, stepper at top, logo top-start, "Skip for now" top-end. One question group per step. Big chips for skills. Ready screen = checklist preview + "Go to my dashboard".
Inspiration: Notion and Linear onboarding (one thing per step), Cal.com (personal link early).

### 7.8 Public client pages
See 6.7. Inspiration: Stripe hosted invoice page (exact model for public invoice), Cal.com booking page (branded by the owner), Tally/Typeform (public form), Bonsai/HoneyBook client proposal view (package choice + accept).

### 7.9 Kanban (Projects)
Columns = stages, 280px wide, horizontal scroll. Card: client avatar, project name, amount, due date chip (amber when < 3 days, red when late). Drag with `@dnd-kit`.
Inspiration: Linear board, Trello simplicity, Notion board.

### 7.10 System states
404 / error / offline: centered, icon, one sentence, one button. Skeletons for every page template. Toasts for results.

---

## 8. Copy and language

- Write from the freelancer's side: "Clients", "Money owed", not "Accounts receivable".
- Buttons = verb + object. Toasts = past tense of the button ("Devis sent").
- Errors say what happened and how to fix it: "This RIP must have 20 digits. You entered 18."
- French: **vous** everywhere (app and client pages). Keep "devis" and "facture" as the French terms; in English UI keep **"Devis"** (local word users know) and use **"Invoice"** for facture. → confirm in section 10.
- Numbers: "3 leads", "1 lead" — handle plurals in i18n, never "lead(s)".
- Dates in sentences: "due in 3 days", "sent on 12/11/2026".

---

## 9. Inspiration board

Where to look and what to take. Add rows as you collect. Screens to browse fast: Mobbin (mobbin.com), Refero (refero.design), Page Flows (pageflows.com).

| App | Look at | Take this | Avoid |
|---|---|---|---|
| Linear | sidebar, lists, settings, keyboard | density, quiet chrome, fast feel, status icons | dark-first look, dev jargon |
| Stripe Dashboard | invoices, customers, hosted invoice page | money formatting, detail page layout, public invoice | heavy data density for beginners |
| Pennylane | devis/facture editor, invoice PDF | French legal mentions, line-item UX, calm green feel | accounting complexity |
| Qonto | onboarding, transfers, settings | clear French copy, trust, step forms | bank-grade navy |
| Bonsai / HoneyBook | proposal → contract → invoice flow, client view | packages, client accepts in one flow | US-only patterns (e-sign) |
| Attio | record pages, lists, sidebar | modern CRM feel, side panel details | too many custom-field options |
| Shopify admin (Polaris) | home setup guide, empty states, settings | checklist onboarding, empty states that teach; Polaris docs as reference for writing component guidelines | |
| Cal.com | public booking page | owner branding, phone-first public page | |
| Tally | form builder, public form | builder simplicity, form feels like a page | |
| Mercury | dashboard, payments | calm money UI, trust | US banking concepts |
| Vercel | settings | one card per setting group with own Save | |
| GoGoPact (competitor) | pricing, devis output | know what Algerian users already see; do better on clarity and invoices | copying |
| BaridiMob / Algérie Poste | payment screens | the words and number formats users already trust (RIP, CCP clé) | their visual style |

Collecting rules: for each find, note the screen, one thing to take, and a screenshot path under `apps/docs/design/inspiration/`.

---

## 10. Open questions

Decide these, then log them in `decisions.md`.

1. **Component base**: shadcn/ui + Radix (recommended) vs. hand-built like today's `ui.tsx`.
2. **Icon set**: Lucide (recommended).
3. **Green value**: confirm `primary-600 #167a45` against the Figma green, or take the exact Figma hex.
4. **Purple for AI**: agree that purple = brand + AI only.
5. **English name for devis**: keep "Devis" or use "Quote".
6. **Auth visual**: the current teal gradient is off-palette; replace with green-family visual or the exported Figma image.
7. **Status for "Viewed" devis**: amber ("waiting for answer") vs. blue.
8. **Money in English UI**: `125 000 DA` (recommended) vs `125,000 DA`.
