// apps/api/src/lib/organization-contact.ts
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { organizationProfile } from "@freelo/shared/db/schema/app.js";

export async function getOrganizationContactEmail(organizationId: string) {
  const profile = await db.query.organizationProfile.findFirst({
    where: eq(organizationProfile.organizationId, organizationId),
  });

  return profile?.professionalEmail ?? null;
}