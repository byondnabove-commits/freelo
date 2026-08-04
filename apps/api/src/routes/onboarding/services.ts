import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { organizationProfile } from "@freelo/shared/db/schema/app.js";
import { requireOrg } from "@/middleware/require-org";

import { servicesSchema } from "./services.schema";

const services = new Hono();

services.put(
  "/",
  requireOrg,
  zValidator("json", servicesSchema),
  async (c) => {
    const org = c.get("organization");

    const {
      serviceCategories,
      teamSize,
      averageBudget,
    } = c.req.valid("json");

    await db
      .update(organizationProfile)
      .set({
        serviceCategories,
        teamSize,
        averageBudget,
        updatedAt: new Date(),
      })
      .where(eq(organizationProfile.organizationId, org.id));

    return c.json({
      success: true,
    });
  }
);

export default services;