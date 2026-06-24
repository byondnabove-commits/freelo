# Onboarding Architecture

## Overview

Onboarding transforms an authenticated user into an active FreeLo workspace.

A user is considered onboarded when:

organization_profile.completedAt is not null.

---

# Goals

The onboarding flow collects:

* Studio information
* Services offered and work style
* Intake form field configuration

The onboarding flow prepares the organization for first use.

---

# Source of Truth

Onboarding status is stored in the database.

Never store onboarding status in:

* Zustand
* localStorage
* sessionStorage

The database is the source of truth.

---

# Completion Rule

A user is considered onboarded when:

```ts
organizationProfile.completedAt !== null
```

No additional onboarding flags are required.

---

# User Journey

Register
→ Verify Email
→ Login
→ Redirect To Onboarding
→ Complete Steps
→ Complete Onboarding
→ Dashboard

---

# Step 1 – Studio

Collect:

* Logo
* Owner Name
* Professional Email
* Timezone
* Currency
* Work Style
* Average Budget

Persist immediately to `organization_profiles`.

Do not wait until the final step.

---

# Step 2 – Your Work

Collect:

* Services offered (multi-select, e.g. Brand Identity, Web Design, Development, UI/UX Design, Motion & Video, Photography, Copywriting, Social Media, Other)
* Team count (single-select: Solo, Small Team, Subcontract Occasionally)
* Average project budget (single-select range, e.g. Under $1,000 up to $15,000+)

Selected services are created as `services` records, owned by the organization.

Team count and average budget are persisted to `organization_profiles`.

Persist immediately. Do not store draft selections in Zustand.

Services chosen here are a starting point — the user can add, edit, or remove services later through the standalone Services feature.

---

# Step 3 – Intake Form

Every organization is seeded with one default intake form (and its default fields) automatically when the organization is created — see `organization.md`.

This step does **not** build a form from scratch. It lets the user toggle which of the seeded default fields are enabled for their live form (e.g. turning off "Attach a brief" or "How did you find me?" if not needed).

Required fields (e.g. Full name, Email address) cannot be disabled.

This step only sets which fields are active — it is initial configuration, not form building.

Full drag-and-drop form customization — adding new fields, reordering, deleting, creating additional forms — happens later through the standalone Forms feature, which uses dnd-kit and is a separate, more powerful editor than this toggle list.

---

# Step 4 – Ready

User clicks:

Finish the Setup

System:

```ts
completedAt = new Date()
```

Onboarding is now complete.

---

# Persistence Strategy

Every step saves directly to the database.

Benefits:

* Browser refresh safe
* Browser crash safe
* Device switch safe
* Resume onboarding later

---

# Resuming Onboarding

When a user returns:

Load:

organization_profile

Determine current onboarding step.

Resume from last completed step.

---

# Dashboard Access Rule

Dashboard access requires:

```ts
organizationProfile.completedAt !== null
```

If false:

Redirect to onboarding.

---

# Backend Enforcement

Protected routes must verify onboarding completion.

Example:

* projects
* clients
* leads
* tasks
* invoices
* forms

If onboarding incomplete:

403 Forbidden

Response:

```json
{
  "code": "ONBOARDING_REQUIRED"
}
```

---

# Frontend Enforcement

The frontend should redirect incomplete users to onboarding.

This improves user experience.

The backend remains responsible for security.

---

# State Ownership

React Query:

* onboarding data
* organization profile

Zustand:

* onboarding UI state only

Examples:

* active step
* step animations
* temporary UI interactions

Business data must remain in the database.

---

# Future Expansion

The onboarding flow may later include:

* Team invitations
* Calendar integration
* CRM import
* AI configuration

The onboarding completion rule should remain:

organization_profile.completedAt