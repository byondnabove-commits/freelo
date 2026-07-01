import { authClient } from "../../../lib/auth-client";

export type MeResponse = {
  user: typeof authClient.$Infer.Session.user;

  session: typeof authClient.$Infer.Session.session;

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

  isOnboarded: boolean;

  requiresOrganizationSelection?: boolean;
};