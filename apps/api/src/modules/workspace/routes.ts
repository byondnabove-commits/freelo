import {
  createWorkspaceSchema,
  inviteMemberSchema,
  setActiveWorkspaceSchema,
} from "@freelo/contracts/auth";
import { Hono } from "hono";

import type { AppEnv } from "../../app-env";
import { validate } from "../../lib/validate";
import { requireAuth, requireOrg, requirePermission } from "../../middleware/auth";
import { rateLimit } from "../../middleware/rate-limit";
import { workspaceService } from "./service";

// Non-null after requireAuth.
const who = (c: { get(key: "user"): AppEnv["Variables"]["user"]; get(key: "session"): AppEnv["Variables"]["session"] }) => ({
  user: c.get("user")!,
  session: c.get("session")!,
});

/** Routes for the signed-in user (no active workspace needed). requireAuth is per route so
 *  unknown /api/v1 paths still answer 404, not 401. */
export const meRoutes = new Hono<AppEnv>()
  .get("/me", requireAuth, async (c) => {
    const { user, session } = who(c);
    return c.json({ data: await workspaceService.me(user, session) });
  })
  .post("/workspaces", requireAuth, validate("json", createWorkspaceSchema), async (c) => {
    const { user, session } = who(c);
    const created = await workspaceService.create(user, session.id, c.req.valid("json").name);
    return c.json({ data: created }, 201);
  })
  .post("/workspaces/active", requireAuth, validate("json", setActiveWorkspaceSchema), async (c) => {
    const { user, session } = who(c);
    await workspaceService.setActive(user.id, session.id, c.req.valid("json").organizationId);
    return c.json({ data: { ok: true } });
  })
  .post("/invitations/:id/accept", requireAuth, async (c) => {
    const { user, session } = who(c);
    return c.json({ data: await workspaceService.acceptInvitation(user, session.id, c.req.param("id")) });
  });

/** Routes acting on the active workspace. */
export const workspaceRoutes = new Hono<AppEnv>()
  .use(requireAuth, requireOrg)
  .get("/members", async (c) => c.json({ data: await workspaceService.listMembers(c.get("organizationId")) }))
  .post(
    "/invitations",
    requirePermission("members.invite"),
    rateLimit<AppEnv>(20, 60 * 60 * 1000, (c) => `invite:${c.get("organizationId")}`),
    validate("json", inviteMemberSchema),
    async (c) => {
      const created = await workspaceService.invite(c.get("organizationId"), c.get("user")!, c.req.valid("json"));
      return c.json({ data: created }, 201);
    },
  )
  .delete("/invitations/:id", requirePermission("members.invite"), async (c) => {
    await workspaceService.cancelInvitation(c.get("organizationId"), c.req.param("id"));
    return c.json({ data: { ok: true } });
  })
  .post(
    "/invitations/:id/resend",
    requirePermission("members.invite"),
    rateLimit<AppEnv>(20, 60 * 60 * 1000, (c) => `invite:${c.get("organizationId")}`),
    async (c) => {
      await workspaceService.resendInvitation(c.get("organizationId"), c.req.param("id"), c.get("user")!);
      return c.json({ data: { ok: true } });
    },
  )
  .delete("/members/:memberId", requirePermission("members.remove"), async (c) => {
    await workspaceService.removeMember(c.get("organizationId"), c.get("user")!.id, c.req.param("memberId"));
    return c.json({ data: { ok: true } });
  })
  .post("/leave", async (c) => {
    const { user, session } = who(c);
    await workspaceService.leave(c.get("organizationId"), user.id, session.id);
    return c.json({ data: { ok: true } });
  });

/** No session needed: shown on the invitation page before sign-in. */
export const publicInvitationRoutes = new Hono<AppEnv>().get("/:id", async (c) =>
  c.json({ data: await workspaceService.getInvitation(c.req.param("id")) }),
);
