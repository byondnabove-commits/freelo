# Onboarding Architecture

## Overview

Onboarding transforms an authenticated user into an active FreeLo workspace.

A user is considered onboarded when:

organization_profile.completedAt is not null.

---

# Goals

The onboarding flow collects:

* Studio information
* Business profile
* Qualification information
* Default workspace configuration

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

# Step 1 – Studio Setup

Collect:

* Studio Name
* Country
* Timezone
* Currency

Persist immediately.

Do not wait until the final step.

---

# Step 2 – Business Profile

Collect:

* Industry
* Team Size
* Average Project Value

Persist immediately.

Do not store draft data in Zustand.

---

# Step 3 – Intake Form Setup

Create initial lead qualification form.

Creates:

* forms
* form_fields

records.

This is product setup, not profile setup.

---

# Step 4 – Completion

User clicks:

Explore Dashboard

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

* Subscription setup
* Team invitations
* Calendar integration
* CRM import
* AI configuration

The onboarding completion rule should remain:

organization_profile.completedAt
