import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { forms, formFields } from "@freelo/shared/db/schema/app.js";
import { requireOrg } from "@/middleware/require-org";

import { intakeFormSchema } from "./intake-form.schema";

import type { FieldType } from "@freelo/shared/db/schema/values.js";

const intakeForm = new Hono();

type OnboardingField = {
  key: string;
  type: FieldType;
  label: string;
  placeholder: string | null;
};

const REQUIRED_FIELDS: OnboardingField[] = [
  {
    key: "fullName",
    type: "text",
    label: "Full name",
    placeholder: "John Doe",
  },
  {
    key: "email",
    type: "email",
    label: "Email address",
    placeholder: "john@example.com",
  },
];

const OPTIONAL_FIELDS: OnboardingField[] = [
  {
    key: "companyName",
    type: "text",
    label: "Company / Brand name",
    placeholder: "Your company or brand",
  },
  {
    key: "projectType",
    type: "text",
    label: "Project type",
    placeholder: "Branding, Web Design...",
  },
  {
    key: "budgetRange",
    type: "text",
    label: "Budget range",
    placeholder: "Estimated budget",
  },
  {
    key: "preferredTimeline",
    type: "text",
    label: "Preferred timeline",
    placeholder: "When do you need it?",
  },
  {
    key: "projectDescription",
    type: "textarea",
    label: "Project description",
    placeholder: "Tell us about your project...",
  },
  {
    key: "websiteUrl",
    type: "url",
    label: "Website URL",
    placeholder: "https://",
  },

  // Change back to "file" once FIELD_TYPES supports it
  {
    key: "attachments",
    type: "text",
    label: "Attach a brief or inspiration",
    placeholder: "Attachment link",
  },

  {
    key: "referralSource",
    type: "text",
    label: "How did you find me?",
    placeholder: "Google, Instagram...",
  },
];

intakeForm.put(
  "/",
  requireOrg,
  zValidator("json", intakeFormSchema),
  async (c) => {
    const org = c.get("organization");

    const { intakeFields } = c.req.valid("json");

    await db.transaction(async (tx) => {
      let form = await tx.query.forms.findFirst({
        where: and(
          eq(forms.organizationId, org.id),
          eq(forms.slug, "default-intake"),
        ),
      });

      if (!form) {
        const [created] = await tx
          .insert(forms)
          .values({
            organizationId: org.id,
            title: "Client Intake Form",
            description: "Default onboarding intake form",
            slug: "default-intake",
          })
          .returning();

        form = created;
      }

      await tx.delete(formFields).where(eq(formFields.formId, form.id));

      let position = 0;

      await tx.insert(formFields).values(
        REQUIRED_FIELDS.map((field) => ({
          formId: form.id,
          name: field.key,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          helpText: null,
          required: true,
          validation: null,
          fieldOptions: null,
          position: position++,
        })),
      );

      const enabled = OPTIONAL_FIELDS.filter(
        (field) => intakeFields[field.key as keyof typeof intakeFields],
      );

      if (enabled.length > 0) {
        await tx.insert(formFields).values(
          enabled.map((field) => ({
            formId: form.id,
            name: field.key,
            type: field.type,
            label: field.label,
            placeholder: field.placeholder,
            helpText: null,
            required: false,
            validation: null,
            fieldOptions: null,
            position: position++,
          })),
        );
      }
    });

    return c.json({
      success: true,
    });
  },
);

export default intakeForm;
