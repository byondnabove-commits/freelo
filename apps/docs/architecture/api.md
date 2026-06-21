# API Architecture

## Overview

This document defines how the FreeLo frontend communicates with the backend.

The API acts as the contract between:

* React Frontend
* Hono Backend

The API is responsible for:

* Authentication bootstrap
* Organization context
* Onboarding
* CRM operations
* Project management
* Billing
* AI workflows

The API is not responsible for:

* UI state
* Routing
* Client-side caching

---

# Core Principles

## Database Is The Source Of Truth

The API always returns data from the database.

The frontend never becomes the source of truth for:

* Authentication
* Onboarding
* Subscriptions
* Permissions
* Organization membership

Frontend state is only a cache.

---

## Organization Scoped

FreeLo is organization-centric.

Every business endpoint operates inside an organization.

The frontend never sends:

```json
{
  "organizationId": "..."
}
```

The backend derives organization context from:

Session
→ Membership
→ Organization

---

## REST Style

FreeLo uses resource-based routes.

Examples:

```txt
GET    /projects
GET    /projects/:id

POST   /projects

PATCH  /projects/:id

DELETE /projects/:id
```

---

# API Response Format

## Success Response

Single Resource

```json
{
  "data": {}
}
```

---

Collection

```json
{
  "data": []
}
```

---

## Error Response

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found"
  }
}
```

---

# Status Codes

## Success

```txt
200 OK
201 Created
204 No Content
```

---

## Client Errors

```txt
400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error
```

---

## Server Errors

```txt
500 Internal Server Error
```

---

# Pagination

List endpoints should support pagination.

Example:

```txt
GET /projects?page=1&limit=20
```

Response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# Authentication

Authentication is handled by Better Auth.

FreeLo uses session-based authentication.

Protected endpoints require a valid session.

---

# Bootstrap Endpoint

## GET /me

Purpose:

Load application context after login.

Response:

```json
{
  "user": {},
  "organization": {},
  "member": {},
  "profile": {},
  "subscription": {}
}
```

Frontend uses this endpoint to determine:

* Authentication status
* Active organization
* Onboarding status
* Subscription state

This is the most important endpoint in the application.

---

# Route Groups

## Public Routes

No authentication required.

Examples:

```txt
POST /public/forms/:slug/submit
```

---

## Authenticated Routes

Require valid session.

Examples:

```txt
GET /me

GET /notifications

GET /subscription
```

---

## Onboarded Routes

Require:

* Session
* Organization
* Completed onboarding

Examples:

```txt
/projects

/clients

/leads

/forms

/services

/tasks

/proposals

/invoices
```

---

# Onboarding API

All onboarding endpoints live under `/onboarding/*` and are reachable before onboarding is complete (see `auth.md` Onboarding Middleware).

Onboarding writes never go through the generic `/services` or `/forms` endpoints — those require completed onboarding. Instead, each step has its own dedicated endpoint below. Services and form fields touched here are real `services` / `forms` / `form_fields` records; the dedicated routes are just the onboarding-safe way to write them before the org is fully onboarded.

## GET /onboarding

Returns full onboarding state, including data needed to render every step without calling other resource endpoints.

Response:

```json
{
  "currentStep": 2,
  "completed": false,
  "profile": {},
  "work": {
    "services": [],
    "workStyle": "",
    "averageBudget": ""
  },
  "intakeForm": {
    "fields": []
  }
}
```

---

## PATCH /onboarding/profile

Step 1 — Studio.

Updates Studio Name, Country, Timezone, Currency on `organization_profiles`.

---

## PATCH /onboarding/work

Step 2 — Your Work.

Updates selected services (creates/updates `services` records), work style, and average budget on `organization_profiles`.

---

## PATCH /onboarding/intake-form

Step 3 — Intake Form.

Toggles which fields of the seeded default intake form are enabled (updates `form_fields` on the organization's default form). Does not create new fields or new forms — see Forms API for full form building.

---

## POST /onboarding/complete

Step 4 — Ready.

Marks onboarding as completed.

Response:

```json
{
  "success": true
}
```

---

# Services API

## GET /services

Returns all services offered by the organization.

---

## POST /services

Creates a service.

---

## PATCH /services/:id

Updates a service.

---

## DELETE /services/:id

Deletes a service.

---

# Forms API

## GET /forms

Returns organization forms.

---

## GET /forms/:id

Returns form details.

---

## POST /forms

Creates a form.

---

## PATCH /forms/:id

Updates a form.

---

## DELETE /forms/:id

Deletes a form.

---

# Public Form Submission

## POST /public/forms/:slug/submit

Creates a form submission.

Triggers:

* Form Submission Creation
* AI Qualification Pipeline
* Lead Creation

Response:

```json
{
  "submissionId": ""
}
```

---

# Leads API

## GET /leads

Returns organization leads.

---

## GET /leads/:id

Returns lead details.

---

## POST /leads

Creates a lead.

---

## PATCH /leads/:id

Updates a lead.

---

## DELETE /leads/:id

Deletes a lead.

---

## POST /leads/:id/convert

Converts lead into client.

---

# Clients API

## GET /clients

Returns organization clients.

---

## GET /clients/:id

Returns client details.

---

## POST /clients

Creates a client.

---

## PATCH /clients/:id

Updates a client.

---

## DELETE /clients/:id

Deletes a client.

---

# Projects API

## GET /projects

Returns organization projects.

---

## GET /projects/:id

Returns project details.

Response:

```json
{
  "data": {
    "project": {},
    "client": {},
    "tasks": []
  }
}
```

---

## POST /projects

Creates a project.

---

## PATCH /projects/:id

Updates a project.

---

## DELETE /projects/:id

Deletes a project.

---

# Tasks API

## GET /tasks

Returns tasks.

---

## POST /tasks

Creates a task.

---

## PATCH /tasks/:id

Updates a task.

---

## PATCH /tasks/:id/status

Updates task status.

---

## DELETE /tasks/:id

Deletes a task.

---

# Proposals API

## GET /proposals

Returns proposals.

---

## GET /proposals/:id

Returns proposal details.

---

## POST /proposals

Creates a proposal.

---

## PATCH /proposals/:id

Updates a proposal.

---

## DELETE /proposals/:id

Deletes a proposal.

---

## POST /proposals/:id/send

Sends proposal to client.

---

## POST /proposals/:id/approve

Client approval endpoint.

---

# Invoices API

## GET /invoices

Returns invoices.

---

## GET /invoices/:id

Returns invoice details.

---

## POST /invoices

Creates invoice.

---

## PATCH /invoices/:id

Updates invoice.

---

## DELETE /invoices/:id

Deletes invoice.

---

## POST /invoices/:id/send

Sends invoice.

---

## POST /invoices/:id/pay

Marks invoice as paid.

---

# Notifications API

## GET /notifications

Returns notifications.

---

## PATCH /notifications/:id/read

Marks notification as read.

---

# Subscription API

## GET /subscription

Returns active subscription.

Response:

```json
{
  "plan": "SKETCHBOOK",
  "status": "ACTIVE",
  "limits": {}
}
```

---

## POST /subscription/checkout

Creates checkout session.

---

## POST /subscription/portal

Opens billing portal.

---

# Frontend Integration

FreeLo uses TanStack Query for all server state.

Example:

```ts
useQuery({
  queryKey: ["organization", organizationId, "projects"],
  queryFn: getProjects,
})
```

The frontend never accesses the database directly.

The frontend only communicates through API endpoints.

---

# Query Key Conventions

All query keys must be resource-based.

Examples:

```ts
["me"]

["projects"]

["project", projectId]

["clients"]

["client", clientId]

["forms"]

["form", formId]
```

For organization-scoped resources:

```ts
["organization", organizationId, "projects"]
```

may be used when necessary.

---

# Architectural Principles

* API is the contract between frontend and backend.
* Database is the source of truth.
* Every business endpoint is organization scoped.
* Frontend never sends organization identifiers.
* Authentication is handled by Better Auth.
* TanStack Query manages server state.
* Zustand manages UI state only.
* API responses follow a consistent format.
* API errors follow a consistent format.
* Multi-tenancy is enforced by middleware and PostgreSQL RLS.
* The frontend never accesses the database directly.