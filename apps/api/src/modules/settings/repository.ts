import { eq } from "drizzle-orm";

import { db } from "@/db";
import { organization } from "@freelo/shared/db/schema/auth.js";

export interface OrgPreferences {
  autoConvertLeadsOnWon: boolean;
}

const DEFAULT_PREFERENCES: OrgPreferences = {
  autoConvertLeadsOnWon: false,
};

// organization.metadata is a free-form text column Better Auth exposes for
// exactly this kind of app-specific setting. We treat it as a JSON blob and
// merge into it rather than overwrite it, so if anything else in the app
// ever stores other keys there, this won't clobber them.
function parseMetadata(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export class SettingsRepository {
  async getPreferences(organizationId: string): Promise<OrgPreferences> {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
    });

    if (!org) return DEFAULT_PREFERENCES;

    const metadata = parseMetadata(org.metadata);
    return {
      autoConvertLeadsOnWon: Boolean(metadata.autoConvertLeadsOnWon),
    };
  }

  async updatePreferences(
    organizationId: string,
    updates: Partial<OrgPreferences>,
  ): Promise<OrgPreferences> {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, organizationId),
    });

    const metadata = parseMetadata(org?.metadata ?? null);
    const merged = { ...metadata, ...updates };

    await db
      .update(organization)
      .set({ metadata: JSON.stringify(merged) })
      .where(eq(organization.id, organizationId));

    return {
      autoConvertLeadsOnWon: Boolean(merged.autoConvertLeadsOnWon),
    };
  }
}

export const settingsRepository = new SettingsRepository();