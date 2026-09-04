import { and, desc, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";
import type { DbOrTx } from "@/db/types";
import { leads } from "@freelo/shared/db/schema/app.js";
import type { LeadStatus } from "@freelo/shared/db/schema/values.js";

type NewLead = InferInsertModel<typeof leads>;
type LeadUpdate = Partial<Omit<NewLead, "id" | "organizationId" | "createdAt">>;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export class LeadRepository {
  async create(data: NewLead) {
    const [lead] = await db.insert(leads).values(data).returning();
    return lead;
  }

  // tx added: this is called from inside ClientService.createFromLead's
  // transaction, so it needs to see the client-creation transaction's
  // uncommitted state (and roll back with it on failure).
  async findById(organizationId: string, id: string, tx: DbOrTx = db) {
    return tx.query.leads.findFirst({
      where: and(eq(leads.id, id), eq(leads.organizationId, organizationId)),
    });
  }

  async findByOrganizationId(
    organizationId: string,
    { limit, offset }: PaginationOptions = {},
  ) {
    return db.query.leads.findMany({
      where: eq(leads.organizationId, organizationId),
      orderBy: desc(leads.createdAt),
      limit,
      offset,
    });
  }

  async findBySubmissionId(submissionId: string) {
    return db.query.leads.findFirst({
      where: eq(leads.submissionId, submissionId),
    });
  }

  // tx added: same reason as findById above — this is the write that marks
  // a lead "won" as part of the conversion transaction.
  async updateStatus(id: string, status: LeadStatus, tx: DbOrTx = db) {
    const [lead] = await tx
      .update(leads)
      .set({ status })
      .where(eq(leads.id, id))
      .returning();

    return lead;
  }

  async update(id: string, data: LeadUpdate) {
    const [lead] = await db
      .update(leads)
      .set(data)
      .where(eq(leads.id, id))
      .returning();

    return lead;
  }

  async delete(id: string) {
    const deleted = await db
      .delete(leads)
      .where(eq(leads.id, id))
      .returning({ id: leads.id });

    return deleted.length > 0;
  }
}

export const leadRepository = new LeadRepository();