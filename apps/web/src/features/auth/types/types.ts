import { authClient } from "../../../lib/auth-client";

export type MeResponse = {
  user: typeof authClient.$Infer.Session.user;

  session: {
    id: string;
    expiresAt: string;
    activeOrganizationId: string | null;
  };

  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;

  member: {
    id: string;
    role: string;
    organizationId: string;
    userId: string;
  } | null;

  organizationProfile: {
    id: string;
    onboardingCompletedAt: string | null;
  } | null;

  subscription: {
    id: string;
    plan: string;
    status: string;
  } | null;

  onboarding: {
    completed: boolean;

    studio: {
      completed: boolean;
    };

    business: {
      completed: boolean;
    };

    intakeForm: {
      completed: boolean;
    };

    nextStep: "studio" | "business" | "intake-form" | "review" | "dashboard";
  };

  requiresOrganizationSelection?: boolean;
};
