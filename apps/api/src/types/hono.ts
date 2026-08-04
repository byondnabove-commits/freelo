// types/hono.ts
import { auth } from "@/auth";
import type { organization, member } from "@freelo/shared/db/schema/auth.js";

export type AppVariables = {
  user: typeof auth.$Infer.Session.user | null;
  session:
    | (typeof auth.$Infer.Session.session & {
        activeOrganizationId?: string | null;
      })
    | null;
};

export type AppEnv = {
  Variables: AppVariables;
};

export type AuthVariables = {
  user: NonNullable<AppVariables["user"]>;
  session: NonNullable<AppVariables["session"]>;
};

export type AuthEnv = {
  Variables: AuthVariables;
};

// Row types inferred from the Drizzle table schemas
export type Organization = typeof organization.$inferSelect;
export type Member = typeof member.$inferSelect;

export type OrgVariables = AuthVariables & {
  organization: Organization;
  member: Member;
  organizationId: string;
};

export type OrgEnv = {
  Variables: OrgVariables;
};
