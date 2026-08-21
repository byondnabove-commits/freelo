import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { OrgEnv } from "@/types/hono";
import { requireAuth } from "@/middleware/require-auth";
import { requireOrg } from "@/middleware/require-org";

import { leadService } from "./service";
import {
  UpdateLeadStatusSchema,
  ListLeadsQuerySchema,
  UpdateLeadNotesSchema,
} from "./schema";
import { clientService } from "../clients";

export const leadRoutes = new Hono<OrgEnv>();

leadRoutes.use("*", requireAuth);
leadRoutes.use("*", requireOrg);

leadRoutes.get("/", zValidator("query", ListLeadsQuerySchema), async (c) => {
  const { limit, offset } = c.req.valid("query");

  const leads = await leadService.list(c.get("organizationId"), {
    limit,
    offset,
  });

  return c.json({ data: leads });
});

leadRoutes.get("/:leadId", async (c) => {
  const lead = await leadService.getById(
    c.get("organizationId"),
    c.req.param("leadId"),
  );

  return c.json({ data: lead });
});

leadRoutes.patch(
  "/:leadId/status",
  zValidator("json", UpdateLeadStatusSchema),
  async (c) => {
    const lead = await leadService.updateStatus(
      c.get("organizationId"),
      c.req.param("leadId"),
      c.req.valid("json").status,
    );

    return c.json({ data: lead });
  },
);

leadRoutes.patch(
  "/:leadId/notes",
  zValidator("json", UpdateLeadNotesSchema),
  async (c) => {
    const lead = await leadService.updateNotes(
      c.get("organizationId"),
      c.req.param("leadId"),
      c.req.valid("json").notes,
    );
    return c.json({ data: lead });
  },
);

leadRoutes.post("/:leadId/convert", async (c) => {
  const client = await clientService.createFromLead(
    c.get("organizationId"),
    c.req.param("leadId"),
  );
  return c.json({ data: client }, 201);
});

// add alongside existing routes
leadRoutes.delete("/:leadId", async (c) => {
  await leadService.delete(c.get("organizationId"), c.req.param("leadId"));
  return c.json({ success: true });
});
