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

The `organization` table itself, along with membership and invitations, is owned by Better Auth.

FreeLo adds business context on top of the organization via `organization_profiles` and other business tables.

```txt
Better Auth owns:
organization
member
invitation

FreeLo owns:
organization_profiles
subscriptions
services
forms
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
* What the organization can access

These are always derived from the database.

---

# Organization vs Organization Profile

These are two distinct entities and must not be confused.

## organization (Better Auth)

Represents workspace identity.

Responsibilities:

* Workspace existence
* Team container
* Membership boundary

Created automatically during registration.

---

## organization_profiles (FreeLo)

Represents the business identity of the organization.

Responsibilities:

* Freelancer / studio profile
* AI matching context
* Onboarding completion marker

Created during onboarding, not at registration.

An organization can exist without an `organization_profiles` record — that organization is simply not yet onboarded.

---

# Organization Lifecycle

```txt
Register
→ Create User
→ Create Organization
→ Create Membership (Owner)
→ Create Default Subscription (Sketchbook, no trial)
→ Seed Default Intake Form
→ Redirect To Onboarding
→ Step 1: Studio Info → Organization Profile
→ Step 2: Services + Work Style → Services + Organization Profile
→ Step 3: Enable/Disable Default Intake Form Fields
→ Step 4: Mark Organization Profile Complete
```

The organization, its default subscription, and its default intake form are all created immediately at registration — before onboarding starts.

The organization profile is filled in, and services are created, during onboarding.

See `onboarding.md` for the full onboarding flow and `subscriptions.md` for subscription plans.

---

# Membership

A membership connects a user to an organization.

Examples:

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

A user may belong to more than one organization.

A session tracks which organization is currently active.

---

# Resolving Organization Context

The client never sends an organization identifier.

Organization context is always derived server-side:

```txt
Session
→ Member
→ Organization
```

This resolution happens in the Organization Middleware, which then attaches context for downstream handlers:

```ts
ctx.set("organization", organization)
ctx.set("member", member)
ctx.set("organizationId", organization.id)
```

See `multi-tenancy.md` for the full middleware stack and RLS enforcement.

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

Every table in this list contains `organization_id` and is scoped by it.

---

# Organization Models

FreeLo supports three organization sizes without requiring different database structures.

Only team size, usage, and billing change — never the schema.

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
Members:      Abdou, Designer, Project Manager
Subscription: Studio
```

---

## Agency

```txt
Organization: Creative Labs
Members:      Multiple team members
Subscription: Studio
```

Agencies use the same Studio plan as smaller studios — there is no separate "Agency" plan. Only team size, usage, and billing scale; the database structure does not change.

---

# Architectural Principles

* An organization is the single tenant boundary for all business data.
* `organization` (identity) and `organization_profiles` (business profile) are separate concerns.
* The organization is created at registration; the profile is created during onboarding.
* The client never supplies an organization identifier.
* Organization context is always derived from the authenticated session and membership.
* Organization size (Solo, Studio, Agency) changes billing and limits only — never the schema.
* Database is the source of truth.