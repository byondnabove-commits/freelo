import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db";
import { organizationProfile } from "@/db/schema";
import { requireOrg } from "@/middleware/require-org";

import { studioSchema } from "./schema";

const studio = new Hono();

studio.post(
  "/",
  requireOrg,
  zValidator("json", studioSchema),
  async (c) => {
    const org = c.get("organization");

    const {
      logo,
      studioName,
      ownerName,
      timezone,
      professionalEmail,
      currency,
    } = c.req.valid("json");

    await db
      .insert(organizationProfile)
      .values({
        organizationId: org.id,

        logo: logo ?? null,

        studioName,

        ownerName,

        timezone,

        professionalEmail: professionalEmail.toLowerCase(),

        currency,
      })
      .onConflictDoUpdate({
        target: organizationProfile.organizationId,
        set: {
          logo: logo ?? organizationProfile.logo,

          studioName,

          ownerName,

          timezone,

          professionalEmail: professionalEmail.toLowerCase(),

          currency,

          updatedAt: new Date(),
        },
      });

    return c.json({
      success: true,
    });
  }
);

export default studio;