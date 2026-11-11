# Pricing Model — Algeria (DZD)

**Status:** Prices locked by the owner (2026-11-11): **Solo 3,000 DZD/month · Studio 5,000 DZD per member per month.** Competitor reference: GoGoPact charges 4,900 DZD (Standard, max 10 proposals/month) and 8,900 DZD (Pro) per user per month, with no free plan (§8). Costs and margins are estimates built on the assumptions in §1.
**Related:** `00-product-frame.md` §9. The subscriptions spec (Phase 2) turns this into plan limits and code.

---

## 1. Assumptions

| # | Assumption | Value | Note |
|---|---|---|---|
| A1 | Exchange rate used for costs | **1 USD = 280 DZD** | Parallel rate, Nov 2026. FreeLo's costs are in USD. Recheck every quarter. |
| A2 | Fixed infrastructure | $60/month (≈ 16,800 DZD) up to 1,000 workspaces · $150 up to 5,000 · $400 above | VPS, Postgres, backups, object storage, email plan, domain, monitoring |
| A3 | AI (Claude API, Nov 2026) | Haiku 5.5: $0.10 / $0.50 per 1M tokens (in/out) · Sonnet 5.5: $2 / $10 | Haiku for lead summaries, Sonnet for French devis and contract drafts |
| A4 | Storage | $0.015 per GB per month | R2-type object storage |
| A5 | Email | $0.0004 per email | |
| A6 | Server and database share | $0.30 per paid seat · $0.06 per free workspace, per month | |
| A7 | Payment fees + tax reserve | **13% of the price** | About 3% gateway, 10% tax and accounting reserve. **Check both with the gateway and an accountant.** |
| A8 | Not included | Your salary, marketing, company costs | Product margin, not company profit |

---

## 2. AI cost per action

| Action | Model | Tokens (in / out) | Cost per call |
|---|---|---|---|
| Lead summary | Haiku 5.5 | 2,000 / 400 | ≈ 0.1 DZD |
| Devis draft | Sonnet 5.5 | 6,000 / 2,500 | ≈ 10 DZD |
| Contract draft | Sonnet 5.5 | 8,000 / 4,000 | ≈ 16 DZD |

AI is cheap when capped: a heavy user costs about $1 of AI per month. Every paid plan gets a monthly AI quota to prevent abuse.

---

## 3. Plans

| | **Free** | **Solo** | **Studio** |
|---|---|---|---|
| For | Trying FreeLo, very small activity | Solo freelancers | Studios and agencies |
| Price | 0 DZD | **3,000 DZD / month** | **5,000 DZD / member / month** (minimum 2 members) |
| Yearly (2 months free) | — | **30,000 DZD** | **50,000 DZD / member** |
| Members | 1 | 1 | 2 or more, billed per member |
| Active projects | 2 | 20 | Unlimited |
| Published forms | 1 | 5 | Unlimited |
| New leads / month | 20 | 200 | Unlimited |
| Storage | 500 MB | 5 GB | 10 GB per member |
| AI drafts / month (when AI ships) | 0 | 30 + unlimited lead summaries | 50 per member + unlimited summaries |
| "Made with FreeLo" mark | Yes | No | No |
| Team: shared clients, task assignment | — | — | Yes |
| White label, custom domain | — | — | Yes |

- **Reverse trial:** every new workspace gets 30 days of Solo, then drops to Free unless it pays.
- **Minimum 2 members on Studio.** A one-person agency picks Solo. This stops Studio from being "Solo but pricier" and keeps the Solo price meaningful.
- **Downgrade:** nothing is deleted. Items over the limit become read-only.
- Plan names: "Sketchbook" can stay as the marketing name for Solo if you prefer.

---

## 4. Cost and profit per paying seat (monthly)

| | Cost, typical | Cost, heavy | Profit, typical | Profit, heavy |
|---|---|---|---|---|
| **Solo, 3,000 DZD** | 211 DZD | 431 DZD | **2,399 DZD (80%)** | **2,179 DZD (73%)** |
| **Studio member, 5,000 DZD** | 215 DZD | 452 DZD | **4,135 DZD (83%)** | **3,898 DZD (78%)** |
| **Free workspace** | 25 DZD | — | −25 DZD | — |

- "Typical" means 20 lead summaries, 7 devis, 2 contracts, 1–2 GB and 150 emails per month. "Heavy" is about 3 times that.
- A 3-member agency pays 15,000 DZD/month and leaves about 12,400 DZD of profit.
- **Average profit per paying account ≈ 3,900 DZD/month.** This assumes 85% Solo and 15% Studio accounts with 3 members on average.

---

## 5. Growth scenarios

A "workspace" is a free or paid signup. Conversion is the share of workspaces that pay. Fixed infrastructure grows as in A2.

| Workspaces | At 3% conversion: paying / monthly profit | At 5% conversion: paying / monthly profit |
|---|---|---|
| 100 | 3 / **−7,500 DZD** | 5 / **+300 DZD** |
| 300 | 9 / **+11,000 DZD** | 15 / **+34,600 DZD** |
| 1,000 | 30 / **+75,900 DZD** | 50 / **+154,400 DZD** |
| 2,000 | 60 / **+143,500 DZD** | 100 / **+300,500 DZD** |
| 3,000 | 90 / **+236,200 DZD** | 150 / **+471,700 DZD** |
| 5,000 | 150 / **+421,700 DZD** | 250 / **+814,200 DZD** |
| 10,000 | 300 / **+815,500 DZD** | 500 / **+1,600,500 DZD** |

Reference points: freemium SaaS usually converts 2–5%. Reverse trials tend to convert at the higher end, because users have already used the paid features.

---

## 6. Milestones

The number to track is **paying accounts**, plus **active** workspaces. Total signups only show reach. Free users count as proof only if they are active.

**Active workspace** = a workspace that, in the last 30 days, sent at least one devis or facture, or moved a project forward. Signups that never send anything do not count.

| # | Milestone | Target | What it proves | Monthly result |
|---|---|---|---|---|
| **M0 — Private beta** (before launch) | 20 hand-picked freelancers, free | 10 active weekly. 5 complete a full cycle: lead, devis, project, facture, payment recorded. | The core flow works and is worth using | Cost only |
| **M1 — Public launch** (months 0–3) | **300 workspaces** | 100 active, **10 paying** | People pay. Infrastructure is covered. | ≈ +11,000 to +35,000 DZD |
| **M2 — Full salary** (months 6–12) | **1,000 workspaces** | 350 active, **50 paying** (5%) | It replaces a senior developer's salary | ≈ +150,000 DZD |
| **M3 — Hire one person** (months 12–24) | **2,000 workspaces** | 100 paying | Room to pay a support or marketing hire | ≈ +300,000 DZD |
| **M4 — Real business** (months 24–36) | **3,000–5,000 workspaces** | 150–250 paying | A small team, then expansion beyond Algeria | ≈ +470,000 to +810,000 DZD |

**The milestone to aim for first is M2: 1,000 workspaces and 50 paying accounts.** At 3,000 DZD for Solo, that alone replaces a salary.

Leading indicators to watch every week from M0:
- **Activation:** the share of new workspaces that send a first devis within 14 days. Target ≥ 40%.
- **Trial-to-paid:** the share of workspaces still paying after the 30-day trial. Target ≥ 5%.
- **Monthly churn of paying accounts:** target ≤ 5%.
- **Active free workspaces:** these are the proof of usage and the source of referrals through the "Made with FreeLo" mark.

---

## 7. Open questions

1. **How FreeLo collects its own payments at launch:** manual BaridiMob/CCP plus admin activation, or a gateway (Chargily or SATIM) from day one.
2. **Your legal status for FreeLo** (auto-entrepreneur, SARL...). It decides the tax reserve in A7.
3. **AI timing:** costs above include AI. Shipping AI in v1.2 roughly halves early costs.
4. **Solo limits** (20 active projects, 200 leads): high enough not to annoy real solo users, low enough that an agency cannot hide on Solo. Revisit after M1 with real usage data.

---

## 8. Competitor: GoGoPact (gogopact.com, read 2026-11-11)

| | GoGoPact | FreeLo |
|---|---|---|
| Focus | AI proposals, devis and contracts to **win deals** (sales) | The **whole business**: intake, devis, project, facture, payments |
| Target | Agencies (solo founders on the entry tier) | Solo freelancers first, then studios |
| Entry price | 4,900 DZD/user/month, max 2 seats and 10 proposals/month | **3,000 DZD/month**, 20 active projects |
| Team price | 8,900 DZD/user/month (Pro) | **5,000 DZD/member/month** |
| Free plan / trial | Not stated | **Free plan + 30-day reverse trial** |
| AI | Core: proposals, contracts, partial revisions, voice assistant | Planned for v1.2 (to reconsider, see the product frame) |
| Signature | Online acceptance with signature capture; contracts "based on the Algerian Civil Code" | No e-signature: print, sign and stamp. Signed scan uploaded. |
| Client payments | SlickPay (DZD) or card | Offline, recorded. Online gateway later. |
| Factures, NIF/NIS, TVA | **Not mentioned** | **Core: compliant factures, payment tracking** |
| Intake forms | Not mentioned | Built |
| Projects | AI project plan + client tracking link | Projects, tasks, kanban, files; portal in v1.1 |
| Languages | FR / EN / AR (RTL) | FR / EN; AR later |
| Proposal tracking | Views, time per page, client questions | Not planned yet |

**What it means for FreeLo:**
- FreeLo is cheaper at every tier and is the only one with a free plan.
- GoGoPact owns "AI proposals". FreeLo should own **"from the inquiry to the money"**: compliant factures, payment tracking and intake forms, which GoGoPact does not show.
- Gaps to close or decide on: AI devis drafts (cheap to build, ≈ 10 DZD per draft), online acceptance of a devis, Arabic, proposal view tracking.
- SlickPay is a second local gateway option alongside Chargily, for both FreeLo's subscriptions and clients' payments.
