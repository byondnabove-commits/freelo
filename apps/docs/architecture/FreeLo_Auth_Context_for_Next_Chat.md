# FreeLo Auth & Onboarding Continuation Context

## Current Status

The auth/onboarding flow works end-to-end and now survives logout/login
thanks to backend organization resolution instead of relying solely on
`activeOrganizationId`.

### Working

-   Better Auth authentication
-   Signup / Login / Logout
-   Organization creation
-   Onboarding
-   `/api/me` bootstrap endpoint
-   Backend-computed `isOnboarded`
-   Route guards
-   Session recovery for users with exactly one organization

## Architecture

### Better Auth owns

-   Users
-   Sessions
-   Organizations
-   Members
-   Invitations
-   Roles

### FreeLo owns

-   organization_profile
-   subscriptions
-   services
-   forms
-   CRM
-   projects
-   onboarding
-   business rules

Frontend must never derive business rules.

`GET /api/me` is the bootstrap endpoint.

------------------------------------------------------------------------

## Organization Resolution

Current strategy:

1.  Try `session.activeOrganizationId`
2.  If missing:
    -   resolve memberships

    -   0 memberships =\> no organization

    -   1 membership =\> use it

    -   1 memberships =\> future organization selector

------------------------------------------------------------------------

## Remaining Critical Work

### Security

-   Remove session token leak from `/api/me`
-   Global `secureHeaders()`
-   Endpoint-specific rate limiting
-   Brute-force protection
-   Review CSRF strategy
-   Verify secure cookies

### Onboarding

-   Make onboarding idempotent
-   Prevent duplicate services
-   Prevent duplicate forms
-   Handle retries safely
-   Return business errors instead of generic 500s

### Shared Organization Resolver

Extract shared resolver used by: - `/api/me` - `requireOrg` - future
protected routes

### Database

-   Add missing foreign keys
-   Review adding `organizationId` to tasks/messages/formSubmissions
-   Add indexes and constraints

### API

-   Standardize business error codes
-   Add request IDs
-   Structured logging
-   Audit logging

### Tests

-   Signup
-   Login
-   Logout
-   Organization creation
-   Session recovery
-   Duplicate onboarding
-   Tenant isolation
-   Authorization

------------------------------------------------------------------------

## Claude Review (Accepted)

1.  Session token leak
2.  Onboarding not idempotent
3.  Duplicate organization resolution logic
4.  Missing foreign keys
5.  Missing orgId on some tables
6.  OrganizationGuard inconsistency
7.  secureHeaders not global
8.  Missing rate limiting
9.  Missing structured logging
10. Missing DB constraints

------------------------------------------------------------------------

## Goal

Finish and freeze the authentication, organization, onboarding, and
security foundation before implementing CRM, Projects, Forms, Invoices,
and the rest of FreeLo.
