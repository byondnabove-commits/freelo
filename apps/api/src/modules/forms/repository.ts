import { and, asc, count, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { db } from "@/db";

import {
  forms,
  formFields,
  formSubmissions,
} from "@freelo/shared/db/schema/app.js";

type NewForm = InferInsertModel<typeof forms>;
type NewFormField = InferInsertModel<typeof formFields>;
type NewSubmission = InferInsertModel<typeof formSubmissions>;

type FormUpdate = Partial<
  Omit<NewForm, "id" | "organizationId" | "createdAt">
>;

type FormFieldUpdate = Partial<
  Omit<NewFormField, "id" | "formId" | "createdAt">
>;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export class FormRepository {
  /* -------------------------------------------------------------------------- */
  /*                                    Forms                                   */
  /* -------------------------------------------------------------------------- */

  async findById(organizationId: string, id: string) {
    return db.query.forms.findFirst({
      where: and(
        eq(forms.id, id),
        eq(forms.organizationId, organizationId),
      ),
    });
  }

  async findBySlug(slug: string) {
    return db.query.forms.findFirst({
      where: eq(forms.slug, slug),
    });
  }

  async existsBySlug(slug: string) {
    const [row] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.slug, slug))
      .limit(1);

    return !!row;
  }

  async findByOrganizationId(
    organizationId: string,
    { limit, offset }: PaginationOptions = {},
  ) {
    return db.query.forms.findMany({
      where: eq(forms.organizationId, organizationId),
      orderBy: asc(forms.createdAt),
      limit,
      offset,
    });
  }

  async findDefaultByOrganization(organizationId: string) {
    return db.query.forms.findFirst({
      where: eq(forms.organizationId, organizationId),
      orderBy: asc(forms.createdAt),
    });
  }

  async create(data: NewForm) {
    const [form] = await db
      .insert(forms)
      .values(data)
      .returning();

    return form;
  }

  async update(id: string, data: FormUpdate) {
    const [form] = await db
      .update(forms)
      .set(data)
      .where(eq(forms.id, id))
      .returning();

    return form;
  }

  async delete(id: string) {
    const deleted = await db
      .delete(forms)
      .where(eq(forms.id, id))
      .returning({
        id: forms.id,
      });

    return deleted.length > 0;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Fields                                   */
  /* -------------------------------------------------------------------------- */

  async findFields(formId: string) {
    return db.query.formFields.findMany({
      where: eq(formFields.formId, formId),
      orderBy: asc(formFields.position),
    });
  }

  async findFieldById(formId: string, fieldId: string) {
    return db.query.formFields.findFirst({
      where: and(
        eq(formFields.id, fieldId),
        eq(formFields.formId, formId),
      ),
    });
  }

  async createField(data: NewFormField) {
    const [field] = await db
      .insert(formFields)
      .values(data)
      .returning();

    return field;
  }

  async updateField(
    id: string,
    data: FormFieldUpdate,
  ) {
    const [field] = await db
      .update(formFields)
      .set(data)
      .where(eq(formFields.id, id))
      .returning();

    return field;
  }

  async updateFieldPosition(
    id: string,
    position: number,
  ) {
    const [field] = await db
      .update(formFields)
      .set({ position })
      .where(eq(formFields.id, id))
      .returning();

    return field;
  }

  async deleteField(id: string) {
    const deleted = await db
      .delete(formFields)
      .where(eq(formFields.id, id))
      .returning({
        id: formFields.id,
      });

    return deleted.length > 0;
  }

  /* -------------------------------------------------------------------------- */
  /*                                Submissions                                 */
  /* -------------------------------------------------------------------------- */

  async createSubmission(data: NewSubmission) {
    const [submission] = await db
      .insert(formSubmissions)
      .values(data)
      .returning();

    return submission;
  }

  async findSubmission(
    organizationId: string,
    submissionId: string,
  ) {
    return db.query.formSubmissions.findFirst({
      where: and(
        eq(formSubmissions.id, submissionId),
        eq(formSubmissions.organizationId, organizationId),
      ),
    });
  }

  async findSubmissions(
    organizationId: string,
    formId: string,
    { limit, offset }: PaginationOptions = {},
  ) {
    return db.query.formSubmissions.findMany({
      where: and(
        eq(formSubmissions.organizationId, organizationId),
        eq(formSubmissions.formId, formId),
      ),
      orderBy: asc(formSubmissions.submittedAt),
      limit,
      offset,
    });
  }

  async countSubmissions(
    organizationId: string,
    formId: string,
  ) {
    const [result] = await db
      .select({
        count: count(),
      })
      .from(formSubmissions)
      .where(
        and(
          eq(formSubmissions.organizationId, organizationId),
          eq(formSubmissions.formId, formId),
        ),
      );

    return result.count;
  }

  async hasSubmitted(
    formId: string,
    ipAddress: string,
  ) {
    const [row] = await db
      .select({
        id: formSubmissions.id,
      })
      .from(formSubmissions)
      .where(
        and(
          eq(formSubmissions.formId, formId),
          eq(formSubmissions.ipAddress, ipAddress),
        ),
      )
      .limit(1);

    return !!row;
  }
}

export const formRepository = new FormRepository();