# Authentication Architecture

## Overview

FreeLo uses Better Auth as the authentication provider.

Authentication is responsible for:

* User registration
* User login
* Google OAuth login
* Email verification
* Session management
* Organization membership
* Organization invitations

Authentication is NOT responsible for:

* Onboarding progress
* Subscription status
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

as the source of truth for authentication.

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

FreeLo business tables:

* organization_profile
* subscription
* leads
* clients
* projects
* tasks
* proposals
* invoices
* forms

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
→ Redirect To Onboarding

---

## Google OAuth Registration

Google OAuth
→ Create User
→ Create Session
→ Create Organization
→ Create Membership (Owner)
→ Redirect To Onboarding

---

## Login

Login
→ Create Session
→ Load User Context
→ Check Onboarding Status
→ Redirect

Rules:

* If onboarding incomplete → /onboarding
* If onboarding complete → /dashboard

---

# Session Bootstrap

After login, the frontend loads the current user context.

Endpoint:

GET /me

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

This endpoint becomes the primary source of application state after authentication.

---

# Frontend Responsibilities

Frontend guards improve user experience.

Frontend guards do NOT provide security.

Required guards:

## Guest Guard

Allowed:

* /login
* /register

If authenticated:

→ Redirect to dashboard or onboarding

---

## Auth Guard

Requires:

* Valid session

If no session:

→ Redirect to login

---

## Onboarding Guard

Requires:

* organization_profile.completedAt

If onboarding incomplete:

→ Redirect to onboarding

---

# Backend Responsibilities

The backend is responsible for actual security.

Every protected request must validate:

1. Session
2. Organization Membership
3. Onboarding Status
4. Permissions (future)

Frontend checks are never trusted.

---

# Middleware Stack

Request
→ Session Middleware
→ Organization Middleware
→ Onboarding Middleware
→ Permission Middleware
→ Route Handler

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

Adds:

* organization
* member

to request context.

---

# Onboarding Middleware

Purpose:

Prevent access to application features until onboarding is complete.

Protected areas:

* CRM
* Leads
* Projects
* Tasks
* Proposals
* Invoices
* Forms

Allowed:

* /me
* /onboarding

---

# Permissions (Future)

Role Based Access Control (RBAC)

Roles:

* owner
* admin
* manager
* member
* client

Permission examples:

* projects.create
* projects.update
* invoices.send
* members.invite
* billing.manage

Permissions will be enforced by backend middleware.

---

# State Ownership

React Query:

* session
* user
* organization
* profile
* subscription

Zustand:

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
* Always validate organization ownership.
* Always validate session server-side.
* All business queries must be organization-scoped.
* Database is the source of truth.
