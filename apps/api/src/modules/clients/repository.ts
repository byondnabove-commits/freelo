import { and, desc, eq, isNull } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";
import type { DbOrTx } from "@/db/types";
import { clients } from "@freelo/shared/db/schema/app.js";

type NewClient = InferInsertModel<typeof clients>;
type ClientUpdate = Partial<
  Omit<NewClient, "id" | "organizationId" | "createdAt">
>;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  // When false/omitted, archived clients are excluded — same pattern as
  // leads hiding closed ones by default.
  includeArchived?: boolean;
}

export class ClientRepository {
  async create(data: NewClient, tx: DbOrTx = db) {
    const [client] = await tx.insert(clients).values(data).returning();
    return client;
  }

  // Deliberately NOT filtered by archivedAt — needs to find an archived
  // client too (e.g. visiting their page directly to restore them).
  async findById(organizationId: string, id: string) {
    return db.query.clients.findFirst({
      where: and(
        eq(clients.id, id),
        eq(clients.organizationId, organizationId),
      ),
    });
  }

  async findByLeadId(leadId: string, tx: DbOrTx = db) {
    return tx.query.clients.findFirst({
      where: eq(clients.leadId, leadId),
    });
  }

  async findByPortalToken(token: string) {
    return db.query.clients.findFirst({
      where: eq(clients.portalToken, token),
    });
  }

  async findByOrganizationId(
    organizationId: string,
    { limit, offset, includeArchived = false }: PaginationOptions = {},
  ) {
    return db.query.clients.findMany({
      where: includeArchived
        ? eq(clients.organizationId, organizationId)
        : and(
            eq(clients.organizationId, organizationId),
            isNull(clients.archivedAt),
          ),
      orderBy: desc(clients.createdAt),
      limit,
      offset,
    });
  }

  async update(id: string, data: ClientUpdate) {
    const [client] = await db
      .update(clients)
      .set(data)
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async archive(id: string) {
    const [client] = await db
      .update(clients)
      .set({ archivedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async restore(id: string) {
    const [client] = await db
      .update(clients)
      .set({ archivedAt: null })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async delete(id: string) {
    const deleted = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning({ id: clients.id });
    return deleted.length > 0;
  }
}

export const clientRepository = new ClientRepository();
