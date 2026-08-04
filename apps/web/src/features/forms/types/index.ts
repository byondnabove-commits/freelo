// features/forms/types/index.ts
import type { FieldType, FormState } from "@freelo/shared/db/schema/values.js";

export type FieldOption = { label: string; value: string };

export type ValidationRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
};

export type FormField = {
  id: string;
  formId: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  position: number;
  validation: ValidationRules | null;
  fieldOptions: FieldOption[] | null;
};

/**
 * Public-facing shape — returned by GET /forms/public/:slug.
 * Deliberately excludes org-internal fields (state, slug, org id, etc).
 */
export type PublicForm = {
  id: string;
  title: string;
  description: string | null;
  successMessage: string;
  fields: FormField[];
};

/**
 * Admin/authenticated shape — returned by GET /forms (default form).
 * Includes the full row plus its fields, since the service layer
 * (`getDefaultForm`) spreads `...form` and appends `fields`.
 */
export type FormWithFields = {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  slug: string;
  state: FormState;
  successMessage: string;
  allowMultipleSubmissions: boolean;
  publishedAt: string | null;
  createdAt: string;
  fields: FormField[];
};

export type FormAnswers = Record<string, unknown>;
