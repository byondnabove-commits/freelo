# Subscription Architecture

## Overview

FreeLo uses a subscription-based pricing model.

The goal is:

* Keep the product simple to understand.
* Avoid feature-gating core functionality.
* Upgrade users based on growth, not frustration.
* Separate subscriptions from permissions.

---

# Pricing Philosophy

Every paying customer should receive the complete FreeLo experience.

Core business functionality should never be locked behind higher tiers.

Examples of core functionality:

* CRM
* Leads
* Projects
* Tasks
* Proposals
* Invoices
* Forms
* Client Portal
* AI Lead Qualification
* AI Proposal Generation
* AI Contract Generation

Users should upgrade because they need more capacity, not because essential functionality is missing.

---

# Plans

## Sketchbook

Target Audience:

* Freelancers
* Consultants
* Solo Designers
* Solo Developers

Price:

$29/month

Capabilities:

* CRM
* Leads
* Projects
* Tasks
* Proposals
* Invoices
* Forms
* Client Portal
* AI Lead Qualification
* AI Proposal Generation
* AI Contract Generation
* Project Communication

Limits:

* 1 Team Member
* 10 Active Projects
* 100 Leads / Month
* 5 GB Storage

---

## Studio

Target Audience:

* Design Studios
* Agencies
* Growing Teams

Price:

$79/month

Capabilities:

Everything included in Sketchbook.

Additional Capabilities:

* Team Collaboration
* White Label Client Portal
* Custom Domain
* Priority Support
* Early Access Features

Limits:

* Up To 5 Team Members
* Unlimited Projects
* Unlimited Leads
* 50 GB Storage

---

# Subscription Model

Organizations own subscriptions.

Users do not own subscriptions.

Relationship:

Organization
→ Subscription

There is no trial. Every organization receives a Sketchbook subscription with `ACTIVE` status the moment the organization is created — before onboarding even starts. Upgrading to Studio happens later through `POST /subscription/checkout`.

Subscription Enforcement

Subscription limits are enforced
at the application layer.

Examples:

- Team member limits
- Active project limits
- Storage limits

RLS handles isolation.

Subscription middleware handles limits.

Subscription controls:

* Limits
* Capabilities
* Billing

Permissions are controlled separately through RBAC.

---

# Subscription Table

```ts
subscription
```

Fields:

```ts
id

organizationId

plan

status

stripeCustomerId

stripeSubscriptionId

currentPeriodStart

currentPeriodEnd

createdAt

updatedAt
```

---

# Plan Enum

```ts
enum Plan {
  SKETCHBOOK,
  STUDIO
}
```

---

# Subscription Status

```ts
enum SubscriptionStatus {
  ACTIVE,
  PAST_DUE,
  CANCELED
}
```

---

# Capabilities

Capabilities should be defined in a centralized configuration.

Example:

```ts
const capabilities = {
  SKETCHBOOK: {
    members: 1,
    activeProjects: 10,
    leadsPerMonth: 100,
    storageGb: 5,
    customDomain: false,
    whiteLabelPortal: false,
  },

  STUDIO: {
    members: 5,
    activeProjects: Infinity,
    leadsPerMonth: Infinity,
    storageGb: 50,
    customDomain: true,
    whiteLabelPortal: true,
  }
}
```

Business logic should use capabilities rather than plan names.

Bad:

```ts
if (plan === "STUDIO")
```

Good:

```ts
if (capabilities.customDomain)
```

---

# Permissions vs Subscriptions

Subscriptions answer:

"What can this organization use?"

Permissions answer:

"What can this member do?"

Examples:

Subscription:

* Team member limit
* Active project limit
* Custom domain availability

Permissions:

* Create project
* Delete invoice
* Invite member
* Manage billing

These systems must remain independent.

---

# Upgrade Triggers

Primary upgrade triggers:

1. Additional Team Members
2. Active Project Limits
3. White Label Portal
4. Custom Domain
5. Storage Limits
6. Future AI Usage Limits

Core functionality must remain available on all plans.

---

# Future Expansion

Potential future additions:

* Enterprise Plan
* Additional Team Member Packs
* Additional Storage Packs
* Additional AI Credits
* Dedicated Support

The core philosophy should remain unchanged:

Same product.
Different scale.