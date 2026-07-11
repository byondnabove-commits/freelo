# FreeLo -- Onboarding Architecture Continuation

## Current Status

- Better Auth integration complete.
- `/api/me` returns only public session data.
- Shared `getOrganizationContext()` helper implemented.
- `requireOrg` and `/api/me` now share one organization resolution
    source of truth.

## New Direction

The old single `/api/onboarding` endpoint is being replaced with
step-based persistence.

    src/routes/onboarding/
    ├── index.ts          (already created)
    ├── studio.ts
    ├── services.ts
    ├── intake-form.ts
    └── complete.ts

### Endpoint responsibilities

#### POST /api/onboarding/studio

- Upsert `organization_profile`
- Safe to call multiple times

#### PUT /api/onboarding/services

- Delete existing services
- Insert submitted services
- Database must exactly match the submitted selection

#### PUT /api/onboarding/intake-form

- Find or create the default intake form
- Synchronize optional fields
- Required fields always exist
- Idempotent

#### POST /api/onboarding/complete

Only sets:

    organizationProfile.onboardingCompletedAt = new Date()

## Onboarding Flow

    Register
    ↓
    Create Organization (Better Auth)
    ↓
    Step 1 → POST /studio
    ↓
    Step 2 → PUT /services
    ↓
    Step 3 → PUT /intake-form
    ↓
    Step 4 (Review)
    ↓
    POST /complete
    ↓
    Dashboard

## Important Decisions

- Do **not** store `currentStep` in the database.
- Derive progress from persisted business data.

Derived progression:

    No profile
    → Studio

    Profile exists + no services
    → Services

    Services exist + no intake form
    → Intake Form

    Intake form exists + completedAt == null
    → Review

    completedAt != null
    → Completed

Step 4 is a review screen, not a persistence step.

While onboarding is incomplete: - Studio = upsert. - Services =
replace. - Intake form = synchronize.

After onboarding is complete, editing belongs in dedicated product
features (Settings, Services, Forms), not the onboarding flow.

## Next Implementation Order

1. studio.ts
2. services.ts
3. intake-form.ts
4. complete.ts

Keep the implementation simple (no repositories/services unless
duplication actually appears).
