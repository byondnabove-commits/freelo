# Database Architecture

## Purpose

This document defines the database structure for FreeLo and the responsibilities of each entity.

The database is divided into two layers:

1. Authentication Layer
2. Business Layer

Authentication is handled by Better Auth.

Business entities are owned by FreeLo.

---

# Core Principles

## Single Source of Truth

Business data must live in the database.

The frontend must not be the source of truth for:

* Authentication
* Subscription status
* Onboarding completion
* Permissions
* Workspace ownership

---

## Organizations Own Data

FreeLo is organization-centric.

All business data belongs to an organization.

Examples:

* Projects
* Leads
* Clients
* Contracts
* Forms
* AI Settings
* Team Members

This allows support for:

* Solo freelancers
* Studios
* Agencies

using the same architecture.

---

# Authentication Layer

Managed by Better Auth.

## user

Represents a human account.

Examples:

* Abdou
* Sarah
* John

Responsibilities:

* Identity
* Authentication
* Email verification

A user may belong to one or more organizations.

---

## session

Represents an authenticated login session.

Responsibilities:

* Login state
* Session expiration
* Device tracking

Must never be used as onboarding state.

Must never be used as subscription state.

---

## account

OAuth and credentials provider linkage.

Examples:

* Google
* Email / Password

---

## verification

Stores:

* Email verification tokens
* Password reset tokens

---

## organization

Represents a workspace.

Examples:

* PXLR Studio
* Acme Design
* Creative Labs

Responsibilities:

* Data ownership boundary
* Team container

An organization does not store onboarding data.

An organization does not store subscription data.

---

## member

Connects users to organizations.

Examples:

Abdou → PXLR Studio

Sarah → PXLR Studio

Responsibilities:

* Organization membership
* Role assignment

Roles:

* owner
* admin
* member

---

## invitation

Stores pending invitations.

Example:

Sarah is invited to join PXLR Studio.

---

# Business Layer

Managed by FreeLo.

## organization_profile

Represents the business identity of an organization.

Created during onboarding.

Responsibilities:

* Business profile
* Freelancer profile
* Studio profile

Fields include:

* Owner Name
* Professional Email
* Timezone
* Currency
* Work Style
* Average Budget

The existence of an organization profile indicates onboarding has been completed.

---

## service

Represents a service offered by an organization.

Examples:

* Web Design
* Branding
* Development
* Motion Design

Services are used by:

* AI Matching
* Proposal generation
* Lead qualification
* Analytics

An organization may have many services.

---

## subscription

Represents the billing relationship.

Plans:

* solo
* studio
* agency

Statuses:

* trialing
* active
* canceled
* past_due

Responsibilities:

* Feature access
* Team limits
* Usage limits

Subscription state must never be stored on the user.

Subscription state belongs to the organization.

---

# Organization Model

## Solo Freelancer

Organization:

* PXLR Studio

Members:

* Abdou

Subscription:

* Solo

---

## Studio

Organization:

* PXLR Studio

Members:

* Abdou
* Designer
* Project Manager

Subscription:

* Studio

---

## Agency

Organization:

* Creative Labs

Members:

* Multiple team members

Subscription:

* Agency

No additional database structure is required.

Only limits and permissions change.

---

# Onboarding Flow

1. User signs up
2. User verifies email
3. Organization is created
4. Organization Profile is created
5. Services are created
6. Subscription trial is created
7. User enters dashboard

Result:

User
→ Member
→ Organization
→ OrganizationProfile
→ Subscription

---

# Future Tables

These tables are expected in future releases.

## projects

Stores project records.

Owned by an organization.

---

## clients

Stores client records.

Owned by an organization.

---

## leads

Stores lead records.

Owned by an organization.

---

## contracts

Stores contracts.

Owned by an organization.

---

## forms

Stores intake forms.

Owned by an organization.

---

## ai_preferences

Stores AI behavior and matching settings.

Owned by an organization.

---

## notifications

Stores in-app notifications.

Owned by an organization.

---

# Architectural Rule

Authentication tables answer:

"Who is this user?"

Business tables answer:

"How does this organization operate?"

These responsibilities must remain separated.
