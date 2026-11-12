import { z } from "zod";

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const ROLES = ["owner", "member"] as const;
export type Role = (typeof ROLES)[number];

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

export const workspaceNameSchema = z.string().trim().min(2).max(80);

export const createWorkspaceSchema = z.object({ name: workspaceNameSchema });
export const setActiveWorkspaceSchema = z.object({ organizationId: z.string().min(1) });
export const inviteMemberSchema = z.object({
  email: z.email().trim().toLowerCase(),
  role: z.enum(ROLES).default("member"),
});

/** Response of GET /api/v1/me. */
export type Me = {
  user: { id: string; name: string; email: string; locale: Locale; emailVerified: boolean };
  memberships: { organizationId: string; name: string; role: Role }[];
  activeOrganizationId: string | null;
  /** Onboarding of the active workspace. `completed` is always true for non-owners: members are never blocked. */
  onboarding: { completed: boolean; step: number } | null;
};
