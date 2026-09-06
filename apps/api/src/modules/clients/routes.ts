import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { OrgEnv } from "@/types/hono";
import { requireAuth } from "@/middleware/require-auth";
import { requireOrg } from "@/middleware/require-org";

import { clientService } from "./service";
import { UpdateClientSchema, ListClientsQuerySchema } from "./schema";

export const clientRoutes = new Hono<OrgEnv>();

clientRoutes.use("*", requireAuth);
clientRoutes.use("*", requireOrg);

clientRoutes.get(
  "/",
  zValidator("query", ListClientsQuerySchema),
  async (c) => {
    const { limit, offset, includeArchived } = c.req.valid("query");
    const clients = await clientService.list(c.get("organizationId"), {
      limit,
      offset,
      includeArchived,
    });
    return c.json({ data: clients });
  },
);

clientRoutes.get("/:clientId", async (c) => {
  const client = await clientService.getById(
    c.get("organizationId"),
    c.req.param("clientId"),
  );
  return c.json({ data: client });
});

clientRoutes.patch(
  "/:clientId",
  zValidator("json", UpdateClientSchema),
  async (c) => {
    const client = await clientService.update(
      c.get("organizationId"),
      c.req.param("clientId"),
      c.req.valid("json"),
    );
    return c.json({ data: client });
  },
);

// Response shape: { data: { action: "deleted" } } or
// { data: { action: "archived", projectCount } } — the frontend needs to
// branch on `action` to show the right toast/UI, since this one endpoint
// now covers both outcomes.
clientRoutes.delete("/:clientId", async (c) => {
  const result = await clientService.delete(
    c.get("organizationId"),
    c.req.param("clientId"),
  );
  return c.json({ data: result });
});

clientRoutes.post("/:clientId/restore", async (c) => {
  const client = await clientService.restore(
    c.get("organizationId"),
    c.req.param("clientId"),
  );
  return c.json({ data: client });
});
