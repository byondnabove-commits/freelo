import { z } from "zod";

import { FIELD_TYPES, FORM_STATES } from "@freelo/shared/db/schema/values.js";

import {
  MAX_FORM_DESCRIPTION_LENGTH,
  MAX_FORM_FIELDS,
  MAX_FORM_TITLE_LENGTH,
  MAX_FIELD_HELP_TEXT_LENGTH,
  MAX_FIELD_LABEL_LENGTH,
  MAX_FIELD_PLACEHOLDER_LENGTH,
} from "./constants";

/* -------------------------------------------------------------------------- */
/*                                  Form                                      */
/* -------------------------------------------------------------------------- */

export const UpdateFormSchema = z.object({
  title: z.string().trim().min(1).max(MAX_FORM_TITLE_LENGTH),

  description: z.string().trim().max(MAX_FORM_DESCRIPTION_LENGTH).nullable(),

  successMessage: z.string().trim().min(1).max(500),

  allowMultipleSubmissions: z.boolean(),
});

/* -------------------------------------------------------------------------- */
/*                                  Fields                                    */
/* -------------------------------------------------------------------------- */

export const ValidationRulesSchema = z.object({
  required: z.boolean().optional(),

  minLength: z.number().int().positive().optional(),

  maxLength: z.number().int().positive().optional(),

  min: z.number().optional(),

  max: z.number().optional(),

  pattern: z.string().optional(),
});

export const FieldOptionSchema = z.object({
  label: z.string().trim().min(1),

  value: z.string().trim().min(1),
});

export const CreateFieldSchema = z.object({
  name: z.string().trim().min(1),

  type: z.enum(FIELD_TYPES),

  label: z.string().trim().min(1).max(MAX_FIELD_LABEL_LENGTH),

  placeholder: z
    .string()
    .trim()
    .max(MAX_FIELD_PLACEHOLDER_LENGTH)
    .nullable()
    .optional(),

  helpText: z
    .string()
    .trim()
    .max(MAX_FIELD_HELP_TEXT_LENGTH)
    .nullable()
    .optional(),

  required: z.boolean().default(false),

  validation: ValidationRulesSchema.nullable().optional(),

  fieldOptions: z.array(FieldOptionSchema).nullable().optional(),
});

export const UpdateFieldSchema = CreateFieldSchema.partial();

export const ReorderFieldsSchema = z.object({
  fields: z
    .array(
      z.object({
        id: z.uuid(),

        position: z.number().int().min(0),
      }),
    )
    .max(MAX_FORM_FIELDS),
});

/* -------------------------------------------------------------------------- */
/*                                Publishing                                  */
/* -------------------------------------------------------------------------- */

export const PublishFormSchema = z.object({
  state: z.enum(FORM_STATES),
});

/* -------------------------------------------------------------------------- */
/*                               Public Submit                                */
/* -------------------------------------------------------------------------- */

export const SubmitFormSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  // Generated once by the frontend when the form loads, sent with every
  // submit attempt for that page load — including retries/double-clicks.
  // See FormService.submit for how this is enforced.
  idempotencyKey: z.uuid(),
});

export type UpdateFormInput = z.infer<typeof UpdateFormSchema>;

export type CreateFieldInput = z.infer<typeof CreateFieldSchema>;

export type UpdateFieldInput = z.infer<typeof UpdateFieldSchema>;

export type ReorderFieldsInput = z.infer<typeof ReorderFieldsSchema>;

export type SubmitFormInput = z.infer<typeof SubmitFormSchema>;
