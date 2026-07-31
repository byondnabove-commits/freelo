import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import type { OrgEnv } from "@/types/hono";
import { requireOrg } from "@/middleware/require-org";

import { formService } from "./service";

import {
  UpdateFormSchema,
  CreateFieldSchema,
  UpdateFieldSchema,
  ReorderFieldsSchema,
  SubmitFormSchema,
} from "./schema";

export const formRoutes = new Hono<OrgEnv>();

/* -------------------------------------------------------------------------- */
/*                                    Forms                                   */
/* -------------------------------------------------------------------------- */

formRoutes.get("/", requireOrg, async (c) => {
  const form = await formService.getDefaultForm(
    c.get("organizationId"),
  );

  return c.json({ data: form });
});

formRoutes.patch(
  "/",
  requireOrg,
  zValidator("json", UpdateFormSchema),
  async (c) => {
    const form = await formService.updateForm(
      c.get("organizationId"),
      c.req.valid("json"),
    );

    return c.json({ data: form });
  },
);

formRoutes.post(
  "/publish",
  requireOrg,
  async (c) => {
    const form = await formService.publish(
      c.get("organizationId"),
    );

    return c.json({ data: form });
  },
);

/* -------------------------------------------------------------------------- */
/*                                   Fields                                   */
/* -------------------------------------------------------------------------- */

formRoutes.get(
  "/fields",
  requireOrg,
  async (c) => {
    const fields = await formService.getFields(
      c.get("organizationId"),
    );

    return c.json({ data: fields });
  },
);

formRoutes.post(
  "/fields",
  requireOrg,
  zValidator("json", CreateFieldSchema),
  async (c) => {
    const field = await formService.addField(
      c.get("organizationId"),
      c.req.valid("json"),
    );

    return c.json({ data: field }, 201);
  },
);

formRoutes.patch(
  "/fields/:fieldId",
  requireOrg,
  zValidator("json", UpdateFieldSchema),
  async (c) => {
    const field = await formService.updateField(
      c.get("organizationId"),
      c.req.param("fieldId"),
      c.req.valid("json"),
    );

    return c.json({ data: field });
  },
);

formRoutes.delete(
  "/fields/:fieldId",
  requireOrg,
  async (c) => {
    await formService.deleteField(
      c.get("organizationId"),
      c.req.param("fieldId"),
    );

    return c.json({ success: true });
  },
);

formRoutes.patch(
  "/fields/reorder",
  requireOrg,
  zValidator("json", ReorderFieldsSchema),
  async (c) => {
    const fields = await formService.reorderFields(
      c.get("organizationId"),
      c.req.valid("json"),
    );

    return c.json({ data: fields });
  },
);

/* -------------------------------------------------------------------------- */
/*                                   Public                                   */
/* -------------------------------------------------------------------------- */

formRoutes.get(
  "/public/:slug",
  async (c) => {
    const form = await formService.getPublicForm(
      c.req.param("slug"),
    );

    return c.json({ data: form });
  },
);

formRoutes.post(
  "/public/:slug/submit",
  zValidator("json", SubmitFormSchema),
  async (c) => {
    const submission = await formService.submit(
      c.req.param("slug"),
      c.req.valid("json"),
      {
        ipAddress:
          c.req.header("x-forwarded-for") ??
          c.req.header("cf-connecting-ip") ??
          null,

        userAgent:
          c.req.header("user-agent") ?? null,

        referrer:
          c.req.header("referer") ?? null,
      },
    );

    return c.json({ data: submission }, 201);
  },
);