import { Hono } from "hono";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { organizationProfile } from "@freelo/shared/db/schema/app.js";
import { requireOrg } from "@/middleware/require-org";

const complete = new Hono();

complete.post("/", requireOrg, async (c) => {
  const org = c.get("organization");

  await db
    .update(organizationProfile)
    .set({
      onboardingCompletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(organizationProfile.organizationId, org.id));

  return c.json({
    success: true,
  });
});

export default complete;