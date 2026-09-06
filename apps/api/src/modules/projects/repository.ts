import { and, eq, asc, count } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";
import type { DbOrTx } from "@/db/types";
import { projects } from "@freelo/shared/db/schema/app.js";

type NewProject = InferInsertModel<typeof projects>;
type ProjectUpdate = Partial<Omit<NewProject, "id" | "organizationId" | "createdAt">>;

export class ProjectRepository {
  async create(data: NewProject, tx: DbOrTx = db) {
    const [project] = await tx.insert(projects).values(data).returning();
    return project;
  }

  async findById(organizationId: string, id: string) {
    return db.query.projects.findFirst({
      where: and(eq(projects.id, id), eq(projects.organizationId, organizationId)),
    });
  }

  async findByOrganizationId(organizationId: string) {
    return db.query.projects.findMany({
      where: eq(projects.organizationId, organizationId),
      orderBy: asc(projects.createdAt),
    });
  }

  // Used by ClientService.delete to decide hard-delete vs. archive — a
  // lightweight count, not the full row list (that's a separate concern,
  // for whenever the client detail page's "Projects" section gets built).
  async countByClientId(clientId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(projects)
      .where(eq(projects.clientId, clientId));

    return result.count;
  }

  async updateStage(id: string, stage: NewProject["stage"]) {
    const [project] = await db
      .update(projects)
      .set({ stage })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async update(id: string, data: ProjectUpdate) {
    const [project] = await db
      .update(projects)
      .set(data)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async delete(id: string) {
    const deleted = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    return deleted.length > 0;
  }
}

export const projectRepository = new ProjectRepository();