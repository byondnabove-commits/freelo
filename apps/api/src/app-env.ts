import type { Role } from "@freelo/contracts/auth";
import type { RequestIdVariables } from "hono/request-id";

import type { AuthSession } from "./auth";

// Hono context variables. organizationId / role / memberId are set only after requireOrg.
export type AppEnv = {
  Variables: RequestIdVariables & {
    user: AuthSession["user"] | null;
    session: AuthSession["session"] | null;
    organizationId: string;
    role: Role;
    memberId: string;
  };
};
