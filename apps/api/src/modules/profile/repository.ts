import type { ServiceInput } from "@freelo/contracts/onboarding";
import { and, asc, eq, isNull, schema, type DbOrTx } from "@freelo/db";

const { organizationProfile, services, files } = schema;

type ProfileUpdate = Partial<Omit<typeof organizationProfile.$inferInsert, "organizationId" | "createdAt">>;

export const profileRepository = {
  async get(db: DbOrTx, organizationId: string) {
    const [row] = await db
      .select()
      .from(organizationProfile)
      .where(eq(organizationProfile.organizationId, organizationId))
      .limit(1);
    return row ?? null;
  },

  async update(db: DbOrTx, organizationId: string, set: ProfileUpdate) {
    await db.update(organizationProfile).set(set).where(eq(organizationProfile.organizationId, organizationId));
  },

  listServices(db: DbOrTx, organizationId: string) {
    return db
      .select({ id: services.id, name: services.name, price: services.price, unit: services.unit })
      .from(services)
      .where(and(eq(services.organizationId, organizationId), isNull(services.archivedAt)))
      .orderBy(asc(services.position));
  },

  /** Onboarding only: no document references services yet, so replacing is a hard delete. */
  async replaceServices(tx: DbOrTx, organizationId: string, list: ServiceInput[]) {
    await tx.delete(services).where(eq(services.organizationId, organizationId));
    if (list.length) {
      await tx.insert(services).values(list.map((s, position) => ({ ...s, position, organizationId })));
    }
  },

  async insertFile(
    tx: DbOrTx,
    organizationId: string,
    file: { id: string; kind: "logo"; storageKey: string; mimeType: string; sizeBytes: number; uploadedBy: string },
  ) {
    await tx.insert(files).values({ ...file, organizationId });
  },

  async getFile(db: DbOrTx, organizationId: string, id: string) {
    const [row] = await db
      .select()
      .from(files)
      .where(and(eq(files.organizationId, organizationId), eq(files.id, id)))
      .limit(1);
    return row ?? null;
  },

  async deleteFile(db: DbOrTx, organizationId: string, id: string) {
    await db.delete(files).where(and(eq(files.organizationId, organizationId), eq(files.id, id)));
  },
};
