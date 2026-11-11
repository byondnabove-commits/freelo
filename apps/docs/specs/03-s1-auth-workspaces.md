# 03 — S1: Auth & Workspaces

**Status:** Draft (2026-11-11). Slice S1 of the rebuild (`02-architecture.md` §19).
**Builds on:** S0 foundation (schema for Better Auth tables, error format, worker email queue, i18n).
**Done when:** a person signs up in French or English, verifies their email, creates a workspace, and lands in an empty app shell. Every auth email goes through the queue in their language. A second person can be invited and join.

---

## 1. Purpose

Give every later slice a trustworthy answer to two questions: **who is calling** (user) and **for which workspace** (organization + role). Nothing business-specific happens here. The onboarding questions (studio, legal identity...) are S2.

---

## 2. User stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| U1 | visitor | sign up with email + password, or with Google | I can try FreeLo |
| U2 | new user | confirm my email by clicking a link | my account is secured and emails reach me |
| U3 | user | sign in, stay signed in for a week, sign out | I don't log in every day |
| U4 | user | reset a forgotten password | I'm never locked out |
| U5 | verified user without a workspace | create my workspace by giving it a name | I can start working |
| U6 | user in several workspaces | switch between them | I can work for my studio and for myself |
| U7 | workspace owner | invite someone by email, and remove a member | my studio works together |
| U8 | invited person | accept an invitation (signing up if needed) | I join my team's workspace |
| U9 | member | leave a workspace | I control where I belong |
| U10 | user | choose French or English | the app and my emails are in my language |

---

## 3. Flows

### 3.1 Sign up (email)
1. `/signup`: full name, email, password, language (pre-filled from the current UI language).
2. Better Auth creates the user (unverified), and the verification email is **enqueued** (never sent inside the request).
3. Screen: "Vérifiez votre boîte mail", with "Renvoyer l'email" (rate-limited: 1 per 60 s, 5 per hour).
4. Clicking the link verifies the email and signs the user in automatically.
5. No workspace yet, so the user is sent to `/onboarding`, whose step 1 creates the workspace (S2, `04-s2-onboarding-settings.md`).

### 3.2 Sign up / sign in with Google
- Google accounts are treated as verified.
- If an email/password account already exists with the same verified email, Google is **linked** to it (Google is a trusted provider). It never creates a duplicate user.
- The language defaults to the UI language at that moment.

### 3.3 Sign in
- Email + password. An unverified email gets `EMAIL_NOT_VERIFIED`, with a button to resend the link.
- Wrong credentials always give the same generic message, so the form never reveals whether an email exists.
- After sign-in, the user goes to the last active workspace, or to `/onboarding` if they have none, or to the workspace picker if they have several and no active one.

### 3.4 Forgot / reset password
- `/forgot-password` always answers "if this email exists, a link was sent" (no account enumeration).
- The link is valid for 1 hour and works once. Resetting signs out all other sessions.

### 3.5 Create workspace
- The screen is **onboarding step 1** (S2). S1 builds the endpoint and a minimal screen, which S2 turns into the onboarding: one field, the business name (2–80 characters).
- One transaction creates: `organization` (slug generated from the name + a short random suffix), `member` (role `owner`), and `activity_events` `workspace.created`. Then the session's active workspace is set to it.
- The user continues to onboarding step 2 (S2). In S1 alone, they land on `/app`.
- A user may create several workspaces (for example their own solo workspace plus a studio).

### 3.6 Switch workspace
- A switcher in the app shell lists the user's memberships. Selecting one sets `session.activeOrganizationId` and reloads app data.

### 3.7 Invite a member (owner only)
1. The owner enters an email and a role (`member` by default).
2. An invitation is created (valid 7 days) and the invitation email is enqueued, in the **workspace's** language (S2 adds that setting; S1 uses the inviter's language).
3. The link opens `/invitations/:id`:
   - Signed in with the invited email: "Rejoindre <workspace>" button → becomes a member.
   - Signed in with another email: an explanation and a sign-out button.
   - Not signed in: sign in or sign up, prefilled with the invited email, then back to the invitation.
4. The owner can cancel a pending invitation and resend it.

### 3.8 Remove / leave
- The owner removes a member: their access ends immediately, and their sessions lose that active workspace.
- A member leaves a workspace. **The last owner cannot leave or be removed.** Transferring ownership is out of scope (§10).

---

## 4. Rules and edge cases

| Case | Behaviour |
|---|---|
| Email case | Emails are stored and compared lowercased and trimmed |
| Password | Minimum 10 characters, maximum 128. Checked against known breached passwords (see §11, O2). No forced complexity rules (current NIST guidance). |
| Session | 7 days, renewed when used after 1 day. Cookie `HttpOnly`, `Secure` in production, `SameSite=Lax`. |
| Session with no active workspace | Exactly one membership: set it automatically. Several: `409 ORGANIZATION_SELECTION_REQUIRED` → picker. None: `403 NO_ACTIVE_ORGANIZATION` → `/onboarding`. |
| Active workspace no longer valid (removed) | Treated like "no active workspace" |
| Invitation for an existing member | Rejected with `CONFLICT` |
| Expired or cancelled invitation | Page explains and offers to contact the inviter |
| Invitation accepted by a different email | Refused. The invited email must match the signed-in user. |
| Unverified email tries to accept an invitation | Must verify first (the invitation link proves the email, but Better Auth keeps one rule: verified accounts only) |
| Deleted user account | Out of scope in S1 (§10). Member rows cascade when it exists. |

---

## 5. Permissions and tenancy

| Action | owner | member |
|---|---|---|
| Use the workspace (all daily work, from later slices) | ✓ | ✓ |
| Invite, cancel an invitation, remove a member | ✓ | — |
| Rename the workspace (and later: settings, billing) | ✓ | — |
| Leave the workspace | ✓ (unless the last owner) | ✓ |

- Roles are `owner | member` only. Better Auth's default `admin` role is not used.
- Middleware chain for business routes: `requireAuth → requireOrg → (requireRole("owner"))`. `requireOrg` reads the active workspace **from the session only**, never from the request, and checks the membership in the database on every request.
- Permission checks are pure functions in `@freelo/domain/permissions` (`can(role, action)`) so the web app hides the same buttons the API refuses.

---

## 6. Emails (FR/EN, through the `email` queue)

| Email | Trigger | Language |
|---|---|---|
| Verify your email | Sign-up, resend | User's language |
| Reset your password | Forgot password | User's language |
| Password changed | Successful reset or change | User's language |
| Invitation to join <workspace> | Invite, resend | Inviter's language (S1), workspace's language (S2+) |

- Templates live in a new `packages/templates` (`email/*.ts`): plain typed functions returning `{ subject, html, text }`, with one shared branded layout. No React on the server.
- Sender `FreeLo <noreply@…>`. Invitation emails set `reply-to` to the inviter's email.
- Links point to `WEB_URL`, never to the API host.

---

## 7. Data model changes

| Table | Change |
|---|---|
| `user` | Add `locale` (`en` \| `fr`, default `en`), declared as a Better Auth additional field |
| `member` | `role` limited to `owner` \| `member` (check constraint). Unique `(organization_id, user_id)`. |
| `invitation` | Unique pending invitation per `(organization_id, lower(email))` |
| `organization` | Unchanged. `metadata` stays unused (settings get real columns in S2). |
| `activity_events` | New types: `workspace.created`, `member.invited`, `member.joined`, `member.removed`, `member.left` |

All in one new migration (`0001`).

---

## 8. API contract

**Better Auth** is mounted at `/api/auth/*` and serves the standard endpoints (sign-up, sign-in, sign-out, Google OAuth, verify email, forgot/reset password, organization and invitation endpoints). The web app calls them with the Better Auth client. FreeLo adds only what needs its own rules:

| Method + path | Auth | Purpose | Notes |
|---|---|---|---|
| `GET /api/v1/me` | session | Current user, memberships (workspace id, name, role) and the active workspace | Drives routing after sign-in |
| `POST /api/v1/workspaces` | session, verified | Create a workspace (§3.5) | Body `{ name }`. Returns the workspace. One transaction + activity event. |
| `POST /api/v1/workspaces/active` | session | Switch the active workspace | Body `{ organizationId }`. Must be a membership. |
| `GET /api/v1/workspace/members` | org | Members and pending invitations | |
| `POST /api/v1/workspace/invitations` | owner | Invite | Body `{ email, role }`. Activity `member.invited`. |
| `DELETE /api/v1/workspace/invitations/:id` | owner | Cancel | |
| `POST /api/v1/workspace/invitations/:id/resend` | owner | Resend | Rate-limited |
| `DELETE /api/v1/workspace/members/:memberId` | owner | Remove | Refuses the last owner. Activity `member.removed`. |
| `POST /api/v1/workspace/leave` | org | Leave | Refuses the last owner. Activity `member.left`. |

Invitation **acceptance** uses Better Auth's endpoint, with an `afterAcceptInvitation` hook that records `member.joined`.

New error codes in `@freelo/contracts/errors`: `EMAIL_NOT_VERIFIED`, `ORGANIZATION_SELECTION_REQUIRED`, `LAST_OWNER`.

**Rate limits (per IP):** sign-in 10/min, sign-up 5/min, forgot password 3/min, resend verification 1/min and 5/hour, invitations 20/hour per workspace. Better Auth's built-in limiter covers its own routes; ours covers `/api/v1/*`.

---

## 9. Web screens

| Route | Screen |
|---|---|
| `/signup`, `/login` | Forms with a Google button, language switch, links between them |
| `/verify-email` | "Check your inbox" + resend; the email link lands here too and shows success or expiry |
| `/forgot-password`, `/reset-password` | |
| `/onboarding` | Create a workspace (step 1 of the S2 onboarding) |
| `/workspace/select` | Picker when several workspaces and none active |
| `/invitations/:id` | Accept an invitation (§3.7) |
| `/app` | App shell: sidebar placeholder, workspace switcher, user menu (language, sign out) |
| `/app/settings/members` | Members and invitations (owner actions hidden from members) |

- Guards: `GuestOnly` (auth pages), `RequireAuth`, `RequireWorkspace`. They read `GET /api/v1/me` through TanStack Query.
- UI: shadcn/ui components are added now (button, input, label, card, form, dropdown, dialog, toast), ported from the old app where useful.
- Every string goes through i18n (FR and EN files stay key-identical, enforced by the existing test).

---

## 10. Non-goals (S1)

- Onboarding questions, legal identity, branding: **S2**.
- Plan limits on invitations and seats, trial start: **S11** (the code paths exist, the limits are not enforced yet).
- Ownership transfer, more roles, per-member permissions.
- Deleting a user account or a workspace (needed before the public launch for law 18-07; tracked for S2 settings).
- Two-factor authentication, active session list, magic-link sign-in for freelancers.
- Client access (clients never sign in; share links are S6).

---

## 11. Open decisions

| # | Question | Recommendation |
|---|---|---|
| O1 | Invitations in S1, or later? The product frame put team features in v1.2, but the locked pricing sells Studio (min. 2 members) at launch. | **Build invitations in S1.** Better Auth makes them cheap, and the Studio plan needs them at launch. Update the frame's §10 accordingly. |
| O2 | Breached-password check | **Yes**, through Better Auth's Have I Been Pwned plugin. Only the first 5 characters of the password's SHA-1 hash leave the server (k-anonymity), never the password. |
| O3 | Google sign-in at launch | **Yes.** It needs a Google Cloud OAuth app with the production domain, set up before the beta. Development uses a test OAuth app. |
| O4 | URL paths in French (`/connexion`) or English (`/login`) | **English paths, translated UI.** Paths are not user-facing copy, and one set keeps routing simple. |

---

## 12. Acceptance criteria

1. Email sign-up → verification email in Mailpit (in the chosen language) → link signs in → `/onboarding`.
2. Creating a workspace writes `organization`, an `owner` member and a `workspace.created` event in one transaction (an injected failure leaves nothing behind).
3. `GET /api/v1/me` returns memberships and the active workspace. Business routes reject a missing session (401), no workspace (403), several and none selected (409).
4. A user can never act on a workspace they are not a member of, even by forging an id (integration test).
5. Invite → email → accept with the matching email → member appears for the owner. Accepting with another email is refused.
6. The last owner can neither leave nor be removed (`LAST_OWNER`).
7. Forgot password never reveals whether an email exists. A reset link works once and signs out other sessions.
8. Rate limits return `429 RATE_LIMITED` on sign-in, sign-up and resend.
9. No auth email is sent inside an HTTP request: all go through the `email` queue (checked by a test that the request path only enqueues).
10. Tenancy guard, typecheck, unit and integration tests pass in CI.

---

## 13. Tests to write

- **domain:** `can(role, action)` table.
- **api integration (real Postgres):** create workspace (transaction + event), `requireOrg` outcomes (none / one / several / removed), member removal and last-owner rule, invitation conflicts and email mismatch, `/me` shape.
- **api request tests:** rate-limit responses, error codes.
- **templates:** each email renders in FR and EN with no missing keys, and links use `WEB_URL`.
- **worker:** unchanged (email sender already covered).
- **web:** i18n key parity (existing). An end-to-end golden path (Playwright) arrives with S2, once onboarding exists.
