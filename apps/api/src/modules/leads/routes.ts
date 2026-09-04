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
  ConvertLeadSchema,
  MarkLeadLostSchema,
} from "./schema";
import { clientService } from "../clients";

export const leadRoutes = new Hono<OrgEnv>();

leadRoutes.use("*", requireAuth);
leadRoutes.use("*", requireOrg);

leadRoutes.get("/", zValidator("query", ListLeadsQuerySchema), async (c) => {
  const { limit, offset, includeLost } = c.req.valid("query");

  const leads = await leadService.list(c.get("organizationId"), {
    limit,
    offset,
    includeLost,
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

// Dedicated endpoint — status="lost" is rejected on the generic /status
// route above (LostReasonRequiredError) precisely so this one can't be
// bypassed.
leadRoutes.patch(
  "/:leadId/lost",
  zValidator("json", MarkLeadLostSchema),
  async (c) => {
    const lead = await leadService.markAsLost(
      c.get("organizationId"),
      c.req.param("leadId"),
      c.req.valid("json").reason,
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

leadRoutes.post(
  "/:leadId/convert",
  zValidator("json", ConvertLeadSchema),
  async (c) => {
    const { project } = c.req.valid("json");
    const result = await clientService.createFromLead(
      c.get("organizationId"),
      c.req.param("leadId"),
      project,
    );
    return c.json({ data: result }, 201);
  },
);

leadRoutes.delete("/:leadId", async (c) => {
  await leadService.delete(c.get("organizationId"), c.req.param("leadId"));
  return c.json({ success: true });
});
