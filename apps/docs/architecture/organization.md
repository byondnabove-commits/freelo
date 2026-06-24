# Organization Architecture

## Overview

FreeLo is organization-centric.

An Organization is a workspace.

Every user, every piece of business data, and every subscription exists inside the boundary of an organization.

This document defines:

* What an organization is
* What an organization owns
* How organization context is resolved
* How organizations differ by size (Solo, Studio, Agency)

For tenant isolation rules (RLS, middleware, query scoping), see `multi-tenancy.md`.

For billing and plan limits, see `subscriptions.md`.

---

# Core Principles

## The Organization Is The Tenant Boundary

All business data belongs to exactly one organization.

No business record exists outside an organization.

No business record is shared across organizations.

---

## Organization Is Managed By Better Auth

The `organization` table itself, along with memberships and invitations, is owned by Better Auth.

FreeLo adds business context on top of the organization through business tables such as organization profiles, subscriptions, services, forms, projects, and invoices.

```txt
Better Auth owns:
organization
member
invitation

FreeLo owns:
organization_profile
subscription
service
forms
form_fields
form_submissions
leads
clients
projects
tasks
proposals
invoices
messages
notifications
```

See `auth.md` and `database.md` for full table responsibilities.

---

## Database Is The Source Of Truth

The frontend never decides:

* Which organization is active
* Whether onboarding is complete
* What subscription is active
* What permissions a user has

These are always derived from the database.

---

# Organization vs Organization Profile

These are two distinct entities and must never be confused.

---

## organization (Better Auth)

Represents workspace identity.

Responsibilities:

* Workspace existence
* Team container
* Membership boundary
* Workspace name
* Workspace logo

Created automatically during registration.

Example:

```txt
Organization
├── id
├── name
├── slug
└── logo
```

---

## organization_profile (FreeLo)

Represents business configuration.

Responsibilities:

* Owner information
* Business information
* Team information
* Onboarding completion marker

Created only after onboarding is completed.

An organization can exist without an organization profile.

That organization is considered not onboarded.

Example:

```txt
Organization Profile
├── ownerName
├── professionalEmail
├── timezone
├── currency
├── teamCount
├── averageBudget
└── onboardingCompletedAt
```

---

# Organization Lifecycle

```txt
Register
→ Create User
→ Create Organization
→ Create Membership (Owner)
→ Create Default Subscription (Sketchbook)
→ Redirect To Onboarding

Step 1
→ Studio Information
→ Update Organization
→ Store Onboarding Draft

Step 2
→ Services
→ Team Count
→ Average Budget
→ Store Onboarding Draft

Step 3
→ Select Intake Form Fields
→ Create Default Intake Form
→ Create Form Fields

Step 4
→ Create Organization Profile
→ Mark Onboarding Complete
→ Redirect To Dashboard
```

The organization and default subscription are created immediately after registration.

The organization profile is created only after onboarding is completed.

The intake form is created during onboarding after the user selects which fields should be enabled.

An organization can exist without:

* organization_profile
* services
* forms

while onboarding is in progress.

See `onboarding.md` for the full onboarding flow.

---

# Membership

A membership connects a user to an organization.

Example:

```txt
Abdou  → Owner  → PXLR Studio
Sarah  → Member → PXLR Studio
```

Supported roles:

```txt
owner
admin
member
```

A user may belong to multiple organizations.

The active organization is determined by the authenticated session.

---

# Resolving Organization Context

The client never supplies an organization identifier.

Organization context is always derived server-side.

```txt
Session
→ Member
→ Organization
```

This resolution occurs inside Organization Middleware.

The middleware attaches context to downstream handlers:

```ts
ctx.set("organization", organization)
ctx.set("member", member)
ctx.set("organizationId", organization.id)
```

This ensures that all application data remains tenant-scoped.

See `multi-tenancy.md` for middleware and PostgreSQL RLS enforcement.

---

# What An Organization Owns

```txt
Organization
├── Organization Profile
├── Subscription
├── Services
├── Forms
├── Leads
├── Clients
├── Projects
├── Tasks
├── Proposals
├── Invoices
├── Messages
└── Notifications
```

Every business entity belongs to exactly one organization.

Some tables store `organization_id` directly:

```txt
organization_profile
subscription
service
forms
leads
clients
projects
proposals
invoices
notifications
```

Other tables inherit organization ownership through parent relationships:

```txt
tasks
→ projects
→ organization

messages
→ projects
→ organization

form_fields
→ forms
→ organization

form_submissions
→ forms
→ organization
```

---

# Organization Models

FreeLo supports different organization sizes without changing the database schema.

Only limits, usage, and billing change.

The data model remains identical.

---

## Solo Freelancer

```txt
Organization: PXLR Studio
Members:      Abdou
Subscription: Sketchbook
```

---

## Studio

```txt
Organization: PXLR Studio
Members:
- Abdou
- Designer
- Project Manager

Subscription: Studio
```

---

## Agency

```txt
Organization: Creative Labs

Members:
- Multiple Designers
- Multiple Developers
- Project Managers
- Account Managers

Subscription: Studio
```

Agencies use the same Studio plan.

Only usage, limits, and team size increase.

The schema never changes.

---

# Organization Bootstrap

After authentication the application loads organization context through:

```http
GET /api/me
```

Response includes:

```json
{
  "user": {},
  "organization": {},
  "member": {},
  "organizationProfile": {},
  "subscription": {}
}
```

This endpoint becomes the source of truth for:

* Current organization
* Current membership
* Onboarding status
* Subscription status

The frontend must never infer these values itself.

---

# Onboarding Detection

An organization is considered onboarded when:

```txt
organization_profile.onboardingCompletedAt != null
```

Rules:

```txt
organization_profile = null
→ Not Onboarded

organization_profile exists
and onboardingCompletedAt = null
→ Not Onboarded

organization_profile exists
and onboardingCompletedAt != null
→ Onboarded
```

This is the only supported onboarding check.

---

# Architectural Principles

* An organization is the tenant boundary for all business data.
* Better Auth owns workspace identity and membership.
* FreeLo owns business configuration and business data.
* Organization and Organization Profile are separate concerns.
* Organizations are created during registration.
* Organization Profiles are created during onboarding.
* The client never supplies an organization identifier.
* Organization context is always derived from the authenticated session.
* Database is the source of truth.
* Organization size affects limits and billing only.
* The schema remains identical for all organization sizes.
