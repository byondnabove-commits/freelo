# FreeLo Authentication & Onboarding Hardening Plan

## Goal

Build a production-ready authentication, organization, and onboarding
foundation that will not require major architectural changes as FreeLo
grows.

------------------------------------------------------------------------

# Guiding Principles

## Better Auth owns

-   Authentication
-   Sessions
-   Users
-   Organizations
-   Members
-   Invitations
-   Roles

## FreeLo owns

-   Organization Profile
-   Onboarding
-   Subscription
-   Services
-   Forms
-   CRM
-   Projects
-   Business rules

------------------------------------------------------------------------

# Phase 1 --- Data Integrity

-   [ ] One `organization_profile` per organization.
-   [ ] Transactional onboarding.
-   [ ] Foreign keys everywhere.
-   [ ] `ON DELETE CASCADE` where appropriate.
-   [ ] No orphaned records.
-   [ ] Business constraints enforced in the database.

------------------------------------------------------------------------

# Phase 2 --- Authorization

-   [ ] Never trust organization IDs from the client.
-   [ ] Resolve organization from User → Member → Organization.
-   [ ] Verify membership on every protected endpoint.
-   [ ] Prepare permission layer (Owner/Admin/Member/Client).

------------------------------------------------------------------------

# Phase 3 --- Onboarding

-   [ ] Prevent duplicate onboarding.
-   [ ] Make onboarding idempotent.
-   [ ] Reject or safely handle repeated submissions.
-   [ ] Protect against double-clicks.
-   [ ] Handle network retries safely.
-   [ ] Validate organization ownership.
-   [ ] Consider onboarding state (`NOT_STARTED`, `IN_PROGRESS`,
    `COMPLETED`) instead of a simple boolean.

------------------------------------------------------------------------

# Phase 4 --- Session Recovery

-   [ ] Recover the organization automatically if `activeOrganizationId`
    is missing and the user belongs to exactly one organization.
-   [ ] Keep this logic entirely on the backend.
-   [ ] `/api/me` remains the application's bootstrap endpoint.

------------------------------------------------------------------------

# Phase 5 --- Multi-tenancy

-   [ ] Every query must be tenant-scoped.
-   [ ] Prevent cross-tenant access.
-   [ ] Never expose another organization's data.

------------------------------------------------------------------------

# Phase 6 --- Security

## Rate Limiting

-   [ ] Login
-   [ ] Signup
-   [ ] Forgot Password
-   [ ] Verify Email
-   [ ] Reset Password
-   [ ] `/api/onboarding`
-   [ ] `/api/me`
-   [ ] CRUD endpoints

## Brute-force Protection

-   [ ] Track failed logins.
-   [ ] Lock abusive login attempts temporarily.
-   [ ] Consider IP + email combination.

## CSRF & Cookies

-   [ ] Verify SameSite policy.
-   [ ] Verify Secure cookies in production.
-   [ ] Review CSRF protection strategy.

## Security Headers

-   [ ] Review CSP.
-   [ ] HSTS.
-   [ ] X-Frame-Options.
-   [ ] Referrer-Policy.
-   [ ] X-Content-Type-Options.

## Validation

-   [ ] Validate every body.
-   [ ] Validate every param.
-   [ ] Validate every query.

------------------------------------------------------------------------

# Phase 7 --- API Design

`GET /api/me` is the single bootstrap endpoint.

Suggested response:

-   user
-   organization
-   organizationProfile
-   subscription
-   isOnboarded
-   permissions
-   featureFlags
-   requiresOrganizationSelection

The frontend should never derive business rules.

------------------------------------------------------------------------

# Phase 8 --- Error Handling

-   [ ] Business error codes.
-   [ ] Consistent API error format.
-   [ ] Request IDs in responses.

Examples: - NO_ORGANIZATION - MULTIPLE_ORGANIZATIONS -
ONBOARDING_ALREADY_COMPLETED - PROFILE_NOT_FOUND - SUBSCRIPTION_REQUIRED

------------------------------------------------------------------------

# Phase 9 --- Observability & Auditing

-   [ ] Structured logs.
-   [ ] Audit login events.
-   [ ] Audit onboarding completion.
-   [ ] Audit organization creation.
-   [ ] Audit password changes.
-   [ ] Include request ID, user ID, organization ID and duration in
    logs.

------------------------------------------------------------------------

# Phase 10 --- Testing

## Authentication

-   [ ] Signup
-   [ ] Login
-   [ ] Logout
-   [ ] Email verification
-   [ ] Password reset

## Organization

-   [ ] Create organization
-   [ ] Session recovery
-   [ ] Single membership
-   [ ] Multiple memberships
-   [ ] Deleted organization
-   [ ] Deleted member

## Onboarding

-   [ ] First onboarding
-   [ ] Duplicate onboarding
-   [ ] Refresh during onboarding
-   [ ] Network timeout
-   [ ] Transaction rollback
-   [ ] Double-click Finish

## Authorization

-   [ ] Tenant isolation
-   [ ] User A cannot access User B's resources

------------------------------------------------------------------------

# Phase 11 --- Future-proofing

-   [ ] Feature flags.
-   [ ] API versioning.
-   [ ] Background jobs for emails/PDFs.
-   [ ] Idempotency keys for create endpoints.
-   [ ] Soft deletes where appropriate.

------------------------------------------------------------------------

# Definition of Done

-   [ ] `/api/me` is the bootstrap endpoint.
-   [ ] Backend owns all business rules.
-   [ ] Frontend consumes `isOnboarded`.
-   [ ] Transactions protect all writes.
-   [ ] Every query is tenant-scoped.
-   [ ] Duplicate onboarding is impossible.
-   [ ] Session recovery works.
-   [ ] Rate limiting is configured.
-   [ ] Brute-force protection exists.
-   [ ] Security headers reviewed.
-   [ ] Input validation exists everywhere.
-   [ ] Structured logging and audit logs implemented.
-   [ ] Core auth/onboarding integration tests pass.
-   [ ] Authentication and onboarding are considered stable and frozen
    before building the rest of FreeLo.
