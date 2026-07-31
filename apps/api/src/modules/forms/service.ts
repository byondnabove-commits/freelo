import { formRepository } from "./repository";

import {
  FormAlreadyPublishedError,
  FormFieldNotFoundError,
  FormNotFoundError,
  MaxFieldsReachedError,
  InvalidSubmissionError,
} from "./errors";

import { MAX_FORM_FIELDS } from "./constants";

import type {
  CreateFieldInput,
  ReorderFieldsInput,
  UpdateFieldInput,
  UpdateFormInput,
  SubmitFormInput,
} from "./schema";

export class FormService {
  /* -------------------------------------------------------------------------- */
  /*                                    Forms                                   */
  /* -------------------------------------------------------------------------- */

  async getDefaultForm(organizationId: string) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    const fields = await formRepository.findFields(form.id);

    return {
      ...form,
      fields,
    };
  }

  async updateForm(organizationId: string, data: UpdateFormInput) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    return formRepository.update(form.id, data);
  }

  async publish(organizationId: string) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    if (form.state === "published") {
      throw new FormAlreadyPublishedError();
    }

    const fields = await formRepository.findFields(form.id);

    if (fields.length === 0) {
      throw new MaxFieldsReachedError();
    }

    for (const field of fields) {
      if (!field.label.trim()) {
        throw new Error(`Field "${field.label}" requires at least one option.`);
      }

      if (
        ["select", "radio", "checkbox"].includes(field.type) &&
        (!field.fieldOptions ||
          !Array.isArray(field.fieldOptions) ||
          field.fieldOptions.length === 0)
      ) {
        throw new Error(`Field "${field.label}" requires at least one option.`);
      }
    }

    return formRepository.update(form.id, {
      state: "published",
      publishedAt: new Date(),
    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Fields                                   */
  /* -------------------------------------------------------------------------- */

  async getFields(organizationId: string) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    return formRepository.findFields(form.id);
  }

  async addField(organizationId: string, data: CreateFieldInput) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    const fields = await formRepository.findFields(form.id);

    if (fields.length >= MAX_FORM_FIELDS) {
      throw new MaxFieldsReachedError();
    }

    return formRepository.createField({
      formId: form.id,
      position: fields.length,
      ...data,
    });
  }

  async updateField(
    organizationId: string,
    fieldId: string,
    data: UpdateFieldInput,
  ) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    const field = await formRepository.findFieldById(form.id, fieldId);

    if (!field) {
      throw new FormFieldNotFoundError();
    }

    return formRepository.updateField(field.id, data);
  }

  async deleteField(organizationId: string, fieldId: string) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    const field = await formRepository.findFieldById(form.id, fieldId);

    if (!field) {
      throw new FormFieldNotFoundError();
    }

    await formRepository.deleteField(field.id);

    const remainingFields = await formRepository.findFields(form.id);

    for (const [index, remainingField] of remainingFields.entries()) {
      if (remainingField.position !== index) {
        await formRepository.updateFieldPosition(remainingField.id, index);
      }
    }

    return true;
  }

  async reorderFields(organizationId: string, data: ReorderFieldsInput) {
    const form = await formRepository.findDefaultByOrganization(organizationId);

    if (!form) {
      throw new FormNotFoundError();
    }

    for (const field of data.fields) {
      await formRepository.updateFieldPosition(field.id, field.position);
    }

    return formRepository.findFields(form.id);
  }

  async getPublicForm(slug: string) {
    const form = await formRepository.findBySlug(slug);

    if (!form || form.state !== "published") {
      throw new FormNotFoundError();
    }

    const fields = await formRepository.findFields(form.id);

    return {
      id: form.id,
      title: form.title,
      description: form.description,
      successMessage: form.successMessage,
      fields,
    };
  }

  async submit(
    slug: string,
    data: SubmitFormInput,
    metadata: {
      ipAddress?: string | null;
      userAgent?: string | null;
      referrer?: string | null;
    },
  ) {
    const form = await formRepository.findBySlug(slug);

    if (!form || form.state !== "published") {
      throw new FormNotFoundError();
    }

    if (!form.allowMultipleSubmissions && metadata.ipAddress) {
      const alreadySubmitted = await formRepository.hasSubmitted(
        form.id,
        metadata.ipAddress,
      );

      if (alreadySubmitted) {
        throw new InvalidSubmissionError();
      }
    }

    const fields = await formRepository.findFields(form.id);

    const fieldMap = new Map(fields.map((field) => [field.name, field]));

    for (const field of fields) {
      const value = data.answers[field.name];

      if (
        field.required &&
        (value === undefined || value === null || value === "")
      ) {
        throw new InvalidSubmissionError();
      }
    }

    for (const key of Object.keys(data.answers)) {
      if (!fieldMap.has(key)) {
        throw new InvalidSubmissionError();
      }
    }

    const submission = await formRepository.createSubmission({
      organizationId: form.organizationId,
      formId: form.id,
      answers: data.answers,
      ipAddress: metadata.ipAddress ?? null,
      userAgent: metadata.userAgent ?? null,
      referrer: metadata.referrer ?? null,
    });

    return {
      id: submission.id,
      submittedAt: submission.submittedAt,
      successMessage: form.successMessage,
    };
  }
}

export const formService = new FormService();
