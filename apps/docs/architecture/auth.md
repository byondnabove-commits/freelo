# Authentication Architecture

## Overview

FreeLo uses Better Auth as the authentication provider.

Authentication is responsible for:

* User registration
* User login
* Google OAuth login
* Email verification
* Session management
* Identity management

Workspace access is managed through:

* Organizations
* Memberships
* Invitations

Authentication is NOT responsible for:

* Onboarding progress
* Business configuration
* Business data
* Application permissions

---

# Architecture Principles

## Database is the Source of Truth

Authentication state must always come from the database.

Never use:

* Zustand
* localStorage
* sessionStorage

as the source of truth for:

* Authentication
* Onboarding
* Subscription status
* Organization membership

---

## Better Auth Owns Authentication

Better Auth tables:

* user
* session
* account
* verification
* organization
* member
* invitation

Purpose:

* Identity
* Sessions
* Organizations
* Memberships
* Invitations

---

## FreeLo Owns Business Data

FreeLo tables:

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
* notifications

Authentication data and business data must remain separated.

---

# User Lifecycle

## Credentials Registration

Register
→ Create User
→ Send Verification Email
→ Verify Email
→ Create Session
→ Create Organization
→ Create Membership (Owner)
→ Create Default Subscription (Sketchbook)
→ Redirect To Application

Application Bootstrap
→ GET /me
→ Determine Onboarding Status
→ Redirect To Onboarding Or Dashboard

---

## Google OAuth Registration

Google OAuth
→ Create User
→ Create Session
→ Create Organization
→ Create Membership (Owner)
→ Create Default Subscription (Sketchbook)
→ Redirect To Application

Application Bootstrap
→ GET /me
→ Determine Onboarding Status
→ Redirect To Onboarding Or Dashboard

---

## Login

Login
→ Create Session
→ Redirect To Application

Application Bootstrap
→ GET /me
→ Determine Onboarding Status
→ Redirect To Onboarding Or Dashboard

Rules:

* If onboarding incomplete → /onboarding
* If onboarding complete → /dashboard

The login flow does not determine onboarding status.

GET /me determines onboarding status.

---

# Session Lifecycle

## Session Creation

Sessions are created by:

* Email login
* Google OAuth login
* Email verification (autoSignInAfterVerification)

---

## Session Refresh

Session refresh is handled automatically by Better Auth.

---

## Session Expiration

Expired sessions require re-authentication.

Users are redirected to login.

---

## Session Destruction

Sessions are destroyed when:

* User logs out
* Account is deleted
* Session is revoked

---

# Session Bootstrap

After authentication, the frontend loads application context.

Endpoint:

GET /me

Response:

```json
{
  "user": {},
  "organization": {},
  "member": {},
  "organizationProfile": {},
  "subscription": {}
}
```

GET /me is responsible for:

* Authentication bootstrap
* Organization bootstrap
* Membership bootstrap
* Onboarding status
* Subscription state

GET /me is the primary source of application state after authentication.

The frontend should call GET /me immediately after application startup.

---

# Onboarding Source Of Truth

Onboarding completion is determined by:

organization_profile.completedAt

Rules:

completedAt = null

→ Onboarding Incomplete

completedAt != null

→ Onboarding Complete

The existence of an organization_profile record does not indicate onboarding completion.

---

# Frontend Responsibilities

Frontend guards improve user experience.

Frontend guards do NOT provide security.

---

## Guest Guard

Allowed:

* /login
* /register

If authenticated:

→ Redirect to onboarding or dashboard

---

## Auth Guard

Requires:

* Valid session
* Active organization

If requirements fail:

→ Redirect to login

---

## Onboarding Guard

Requires:

organization_profile.completedAt != null

If onboarding incomplete:

→ Redirect to onboarding

---

# Backend Responsibilities

The backend is responsible for actual security.

Every protected request must validate:

1. Session
2. Organization Membership
3. Onboarding Status
4. Permissions

Frontend checks are never trusted.

---

# Middleware Stack

Request
→ Session Middleware
→ Organization Middleware
→ Onboarding Middleware
→ Permission Middleware
→ Route Handler

Permission Middleware is optional during MVP development.

---

# Session Middleware

Purpose:

Verify authenticated user.

Adds:

* user
* session

to request context.

---

# Organization Middleware

Purpose:

Verify organization membership.

Responsibilities:

* Resolve active organization
* Resolve membership
* Verify membership exists

Adds:

* organization
* member
* organizationId

to request context.

---

# Onboarding Middleware

Purpose:

Prevent access to application features until onboarding is complete.

Protected Areas:

* CRM
* Leads
* Clients
* Projects
* Tasks
* Proposals
* Invoices
* Forms
* Services

Allowed:

* /me
* /onboarding

---

# Permissions (optional for mvp)

FreeLo uses Role Based Access Control (RBAC).

Roles:

* owner
* admin
* member

Permission examples:

* projects.create
* projects.update
* invoices.send
* members.invite
* billing.manage

Permissions are enforced by backend middleware.

---

# State Ownership

## React Query

Owns:

* session
* user
* organization
* member
* organizationProfile
* subscription

React Query manages all server state.

---

## Zustand

Owns:

* sidebar
* modals
* drawers
* command palette
* theme

Never store server state in Zustand.

---

# Security Rules

* Never trust frontend state.
* Never trust route guards.
* Always validate session server-side.
* Always validate organization membership.
* Always validate organization ownership.
* All business queries must be organization scoped.
* Database is the source of truth.
* PostgreSQL RLS is the final security boundary.
