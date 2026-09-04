import { and, desc, eq, ne } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";
import type { DbOrTx } from "@/db/types";
import { leads } from "@freelo/shared/db/schema/app.js";
import type {
  LeadStatus,
  LeadLostReason,
} from "@freelo/shared/db/schema/values.js";

type NewLead = InferInsertModel<typeof leads>;
type LeadUpdate = Partial<Omit<NewLead, "id" | "organizationId" | "createdAt">>;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  // When false/omitted, lost leads are excluded — same "archived" pattern
  // used elsewhere, applied here at the query level so nowhere can
  // accidentally forget to filter them.
  includeLost?: boolean;
}

export class LeadRepository {
  async create(data: NewLead) {
    const [lead] = await db.insert(leads).values(data).returning();
    return lead;
  }

  async findById(organizationId: string, id: string, tx: DbOrTx = db) {
    return tx.query.leads.findFirst({
      where: and(eq(leads.id, id), eq(leads.organizationId, organizationId)),
    });
  }

  async findByOrganizationId(
    organizationId: string,
    { limit, offset, includeLost = false }: PaginationOptions = {},
  ) {
    return db.query.leads.findMany({
      where: includeLost
        ? eq(leads.organizationId, organizationId)
        : and(
            eq(leads.organizationId, organizationId),
            ne(leads.status, "lost"),
          ),
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

  async updateStatus(id: string, status: LeadStatus, tx: DbOrTx = db) {
    const [lead] = await tx
      .update(leads)
      .set({ status })
      .where(eq(leads.id, id))
      .returning();

    return lead;
  }

  // Always sets status and lostReason together — these two fields only
  // ever make sense as a pair, so there's no path that sets one without
  // the other.
  async markAsLost(id: string, reason: LeadLostReason) {
    const [lead] = await db
      .update(leads)
      .set({ status: "lost", lostReason: reason })
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
