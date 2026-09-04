import { and, desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";
import type { DbOrTx } from "@/db/types";
import { clients } from "@freelo/shared/db/schema/app.js";

type NewClient = InferInsertModel<typeof clients>;
type ClientUpdate = Partial<Omit<NewClient, "id" | "organizationId" | "createdAt">>;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export class ClientRepository {
  async create(data: NewClient, tx: DbOrTx = db) {
    const [client] = await tx.insert(clients).values(data).returning();
    return client;
  }

  async findById(organizationId: string, id: string) {
    return db.query.clients.findFirst({
      where: and(eq(clients.id, id), eq(clients.organizationId, organizationId)),
    });
  }

  // tx added: called both standalone (e.g. LeadService.getById's
  // convertedClient check) and inside the conversion transaction (the
  // double-conversion guard) — must see uncommitted writes in the latter case.
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
    { limit, offset }: PaginationOptions = {},
  ) {
    return db.query.clients.findMany({
      where: eq(clients.organizationId, organizationId),
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

  async delete(id: string) {
    const deleted = await db
      .delete(clients)
      .where(eq(clients.id, id))
      .returning({ id: clients.id });
    return deleted.length > 0;
  }
}

export const clientRepository = new ClientRepository();