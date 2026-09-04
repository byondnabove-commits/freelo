import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { OrgEnv } from "@/types/hono";
import { requireAuth } from "@/middleware/require-auth";
import { requireOrg } from "@/middleware/require-org";

import { settingsService } from "./service";
import { UpdateOrgPreferencesSchema } from "./schema";

export const settingsRoutes = new Hono<OrgEnv>();

settingsRoutes.use("*", requireAuth);
settingsRoutes.use("*", requireOrg);

settingsRoutes.get("/preferences", async (c) => {
  const preferences = await settingsService.getPreferences(c.get("organizationId"));
  return c.json({ data: preferences });
});

settingsRoutes.patch(
  "/preferences",
  zValidator("json", UpdateOrgPreferencesSchema.partial()),
  async (c) => {
    const preferences = await settingsService.updatePreferences(
      c.get("organizationId"),
      c.req.valid("json"),
    );
    return c.json({ data: preferences });
  },
);