# Multi-Tenancy Architecture

## Overview

FreeLo is a multi-tenant SaaS application.

Each tenant is represented by an Organization.

All business data belongs to an organization and must never be accessible outside of its organization boundary.

Tenant isolation is enforced at multiple layers:

1. Authentication (Better Auth)
2. Backend Middleware (Hono)
3. Database Queries (Drizzle)
4. PostgreSQL Row Level Security (RLS)

The database acts as the final security boundary.

---

# Core Concepts

## User

Represents an authenticated account.

A user may belong to one or more organizations.

Examples:

* Freelancer
* Agency Owner
* Team Member

User data is managed by Better Auth.

---

## Organization

An organization represents a workspace.

Examples:

* John Doe Freelance
* PXLR Studio
* Creative Agency

All business data belongs to an organization.

---

## Membership

A membership connects a user to an organization.

Examples:

User A
→ Owner
→ PXLR Studio

User B
→ Member
→ PXLR Studio

User C
→ Admin
→ Creative Agency

Memberships are managed by Better Auth.

---

# Tenant Boundary

The organization is the tenant boundary.

Everything below the organization belongs to that tenant.

Organization
├── Organization Profile
├── Subscription
├── Forms
├── Leads
├── Clients
├── Projects
├── Tasks
├── Proposals
├── Invoices
├── Messages
└── Notifications

No business data exists outside an organization.

---

# Organization Ownership Rules

Every business table must contain:

```sql
organization_id UUID NOT NULL
```

Required tables:

* organization_profiles
* subscriptions
* services
* forms
* form_fields
* form_submissions
* leads
* clients
* projects
* tasks
* proposals
* invoices
* messages
* notifications

No exceptions.

---

# Foreign Key Rules

Every organization-owned table must reference:

```sql
organization(id)
```

Example:

```sql
organization_id UUID NOT NULL
REFERENCES organization(id)
ON DELETE CASCADE
```

This guarantees referential integrity.

---

# Source of Organization Context

The client never provides organization_id.

Organization context is derived from:

Session
→ Member
→ Organization

The backend determines the active organization.

Never trust:

* Request body
* Query parameters
* Local storage
* Zustand

For tenant identification.

---

# Backend Middleware

## Session Middleware

Responsibilities:

* Validate session
* Load user
* Load session

Context:

```ts
ctx.set("user", user)
ctx.set("session", session)
```

---

## Organization Middleware

Responsibilities:

* Resolve active organization
* Resolve membership

Context:

```ts
ctx.set("organization", organization)
ctx.set("member", member)
ctx.set("organizationId", organization.id)
```

All business routes require this middleware.

---

## Onboarding Middleware

Responsibilities:

* Verify onboarding completion

Validation:

```ts
organizationProfile.completedAt
```

If onboarding is incomplete:

```json
{
  "code": "ONBOARDING_REQUIRED"
}
```

Return:

```http
403 Forbidden
```

---

## Permission Middleware

Future responsibility:

* RBAC
* Subscription restrictions
* Feature access

Not required for MVP.

---

# Query Rules

Never query organization-owned data without organization scope.

Bad:

```ts
db.query.projects.findMany()
```

Bad:

```ts
db.select().from(projects)
```

Good:

```ts
db.query.projects.findMany({
  where: eq(
    projects.organizationId,
    organizationId
  )
})
```

All business queries must be organization scoped.

---

# PostgreSQL Row Level Security

## Purpose

Row Level Security provides database-level tenant isolation.

Even if application code contains a bug, RLS prevents cross-tenant access.

RLS is the final security layer.

---

# RLS Strategy

The active organization is injected into the database connection.

Example:

```sql
SET app.current_organization_id = 'org-id';
```

Or:

```sql
SELECT set_config(
  'app.current_organization_id',
  'org-id',
  true
);
```

The database session now knows the active organization.

---

# RLS Policies

Example:

Projects table:

```sql
ALTER TABLE projects
ENABLE ROW LEVEL SECURITY;
```

Policy:

```sql
CREATE POLICY project_isolation
ON projects
FOR ALL
USING (
  organization_id =
  current_setting(
    'app.current_organization_id'
  )::uuid
);
```

Now every query automatically respects tenant boundaries.

---

# RLS Coverage

RLS must be enabled on:

* organization_profiles
* subscriptions
* services
* forms
* form_fields
* form_submissions
* leads
* clients
* projects
* tasks
* proposals
* invoices
* messages
* notifications

Authentication tables remain managed by Better Auth.

---

# Security Layers

Layer 1

Frontend Guards

Purpose:

* User Experience

Not security.

---

Layer 2

Backend Middleware

Purpose:

* Authentication
* Organization Resolution
* Onboarding Enforcement

---

Layer 3

Application Queries

Purpose:

* Explicit organization scoping

---

Layer 4

PostgreSQL RLS

Purpose:

* Database-level tenant isolation

Final security boundary.

---

# React Query Conventions

All query keys must be organization-aware.

Bad:

```ts
["projects"]
```

Good:

```ts
["organization", organizationId, "projects"]
```

Examples:

```ts
["organization", organizationId, "clients"]
```

```ts
["organization", organizationId, "tasks"]
```

```ts
["organization", organizationId, "invoices"]
```

This prevents cache pollution between organizations.

---

# Future Role Model

Roles:

owner
admin
member

Permissions will be enforced at the application layer.

RLS handles tenant isolation.

RBAC handles feature access.

These are separate concerns.

---

# Ownership Summary

Better Auth Owns:

* users
* sessions
* accounts
* verification
* organizations
* memberships
* invitations

Database Owns:

* tenant isolation
* organization ownership
* business data

Hono Middleware Owns:

* session validation
* organization resolution
* onboarding enforcement

React Query Owns:

* server cache
* synchronization
* mutations

Zustand Owns:

* sidebar state
* modal state
* drawer state
* theme

Never business data.

---

# Architectural Principles

* Every business record belongs to an organization.
* Every business table contains organization_id.
* Never trust organization identifiers from the client.
* Derive organization context from authenticated membership.
* Always scope queries by organization.
* Use PostgreSQL RLS as the final security boundary.
* Database is the source of truth.
* React Query is the server-state cache.
* Zustand is only for UI state.
