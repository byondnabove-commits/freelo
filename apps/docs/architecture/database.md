# FreeLo Database Architecture

## Purpose

This document defines the database architecture for FreeLo and the responsibilities of each entity.

The database is divided into two layers:

1. Authentication Layer
2. Business Layer

Authentication is managed by Better Auth.

Business entities are managed by FreeLo.

---

# Core Principles

## Single Source of Truth

Business state must always live in the database.

The frontend must never be the source of truth for:

* Authentication
* Onboarding completion
* Subscription status
* Permissions
* Workspace ownership
* Team membership

Frontend state is only a cache of backend state.

---

## Organization-Centric Architecture

FreeLo is organization-centric.

All business data belongs to an organization.

Examples:

* Leads
* Clients
* Projects
* Tasks
* Proposals
* Invoices
* Forms
* Services
* AI Preferences
* Notifications

This architecture supports:

* Solo Freelancers
* Studios
* Agencies

without requiring different database structures.

---

# Authentication Layer

Managed by Better Auth.

Authentication answers:

> Who is this user?

---

## user

Represents a human account.

Examples:

* Abdou
* Sarah
* John

Responsibilities:

* Identity
* Authentication
* Email verification ownership

A user may belong to multiple organizations.

---

## session

Represents an authenticated session.

Responsibilities:

* Login state
* Session expiration
* Device tracking
* Active organization tracking

Must never store:

* Onboarding state
* Subscription state
* Business settings

---

## account

Represents authentication providers.

Examples:

* Email & Password
* Google OAuth

Responsibilities:

* Provider linkage
* OAuth credentials

---

## verification

Stores verification records.

Examples:

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
* Workspace identity

An organization does not store:

* Onboarding data
* Subscription data
* AI settings

Those belong to business tables.

---

## member

Connects users to organizations.

Examples:

Abdou → PXLR Studio

Sarah → PXLR Studio

Responsibilities:

* Membership management
* Role assignment

Supported roles:

* owner
* admin
* member

---

## invitation

Represents pending invitations.

Example:

Sarah is invited to join PXLR Studio.

Responsibilities:

* Team onboarding
* Membership invitations

---

# Business Layer

Managed by FreeLo.

Business entities answer:

> How does this organization operate?

---

## organization_profile

Represents the business identity of an organization.

Created during onboarding.

Responsibilities:

* Freelancer profile
* Studio profile
* Business profile
* AI matching context

Fields include:

* Owner Name
* Professional Email
* Timezone
* Currency
* Work Style
* Average Budget

The existence of an Organization Profile indicates onboarding has been completed.

---

## service

Represents a service offered by an organization.

Examples:

* Web Design
* Branding
* Development
* Motion Design
* UI/UX Design

Responsibilities:

* AI matching
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

Subscription state belongs to the organization.

Never to a user.

---

# Forms System

The Forms System powers client intake and AI lead qualification.

---

## forms

Represents an intake form.

Examples:

* Project Inquiry
* Discovery Call Form
* Website Redesign Request
* Branding Questionnaire

Responsibilities:

* Lead capture
* Client onboarding
* AI qualification entry point

An organization may create multiple forms.

---

## form_fields

Represents fields inside a form.

Examples:

* Company Name
* Budget
* Timeline
* Project Description
* Referral Source

Responsibilities:

* Dynamic form building
* Drag-and-drop ordering
* Field configuration

Fields belong to a form.

---

## form_submissions

Represents completed client responses.

Responsibilities:

* Store submitted answers
* Feed AI qualification
* Generate leads

Answers are stored as JSON because forms are dynamic.

Example:

{
"companyName": "Acme",
"budget": "5000-10000",
"timeline": "2 months"
}

---

# CRM System

---

## leads

Represents potential clients.

Sources:

* Form submissions
* Manual creation
* Future integrations

Responsibilities:

* Qualification
* Lead scoring
* Pipeline management

AI qualification compares:

* Organization Profile
* Services
* Average Budget

against:

* Form Submission Answers

to determine lead quality.

---

## clients

Represents approved leads that become clients.

Responsibilities:

* Client management
* Relationship tracking
* Portal access

Clients may own multiple projects.

---

# Project Management

---

## projects

Represents client work.

Responsibilities:

* Delivery management
* Project tracking
* Team collaboration

Projects belong to an organization.

Projects may be linked to a client.

---

## tasks

Represents actionable work.

Responsibilities:

* Execution tracking
* Internal planning
* Progress monitoring

Tasks belong to projects.

---

# Sales System

---

## proposals

Represents proposals sent to clients.

Responsibilities:

* Offer presentation
* Approval tracking
* Client conversion

Future features:

* Proposal analytics
* AI-generated proposals
* Proposal templates

---

## invoices

Represents billing records.

Responsibilities:

* Revenue tracking
* Payment tracking
* Financial reporting

Future features:

* Stripe integration
* Recurring invoices
* Automated reminders

---

# Communication System

---

## messages

Represents communication records.

Responsibilities:

* Internal communication
* Client communication
* Activity history

Messages may later power:

* Client portals
* Team collaboration
* AI summaries

---

## notifications

Represents in-app notifications.

Responsibilities:

* Activity alerts
* System updates
* Workflow notifications

Examples:

* Proposal viewed
* Invoice paid
* New lead received
* Form submitted

---

# Organization Models

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

No database changes are required.

Only permissions, limits, and billing change.

---

# Onboarding Flow

1. User signs up
2. User verifies email
3. Organization is created
4. Organization becomes active
5. Organization Profile is created
6. Services are created
7. Trial Subscription is created
8. User enters dashboard

Result:

User
→ Member
→ Organization
→ Organization Profile
→ Services
→ Subscription

Onboarding completion is determined by the existence of an Organization Profile.

The frontend must never store onboarding completion as the source of truth.

---

# AI Qualification Pipeline

Future FreeLo AI workflows will follow:

Form Submission
→ AI Analysis
→ Service Matching
→ Budget Comparison
→ Lead Score
→ Lead Creation

The AI evaluates:

* Services offered
* Average budget range
* Organization profile
* Client requirements

to determine lead quality and fit.

---

# Architectural Rule

Authentication tables answer:

"Who is this user?"

Business tables answer:

"How does this organization operate?"

These responsibilities must remain separated.

Authentication should never contain business logic.

Business tables should never contain authentication logic.
