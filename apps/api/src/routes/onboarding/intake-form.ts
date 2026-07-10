import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { forms, formFields } from "@/db/schema";
import { requireOrg } from "@/middleware/require-org";

import { intakeFormSchema } from "./intake-form.schema";

const intakeForm = new Hono();

const OPTIONAL_FIELDS = [
  {
    key: "companyName",
    type: "text",
    label: "Company/Brand name",
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
  {
    key: "attachments",
    type: "file",
    label: "Attach a brief or inspiration",
    placeholder: null,
  },
  {
    key: "referralSource",
    type: "text",
    label: "How did you find me?",
    placeholder: "Google, Instagram...",
  },
];

const REQUIRED_FIELDS = [
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

intakeForm.put(
  "/",
  requireOrg,
  zValidator("json", intakeFormSchema),
  async (c) => {
    const org = c.get("organization");

    const { intakeFields } = c.req.valid("json");

    await db.transaction(async (tx) => {
      //--------------------------------------------------
      // Find or create the default intake form
      //--------------------------------------------------

      let form = await tx.query.forms.findFirst({
        where: and(
          eq(forms.organizationId, org.id),
          eq(forms.slug, "default-intake")
        ),
      });

      if (!form) {
        const [created] = await tx
          .insert(forms)
          .values({
            organizationId: org.id,
            name: "Client Intake Form",
            description: "Default onboarding intake form",
            slug: "default-intake",
          })
          .returning();

        form = created;
      }

      //--------------------------------------------------
      // Remove existing fields
      //--------------------------------------------------

      await tx
        .delete(formFields)
        .where(eq(formFields.formId, form.id));

      //--------------------------------------------------
      // Always required
      //--------------------------------------------------

      let position = 1;

      await tx.insert(formFields).values(
        REQUIRED_FIELDS.map((field) => ({
          formId: form.id,

          key: field.key,

          type: field.type,

          label: field.label,

          placeholder: field.placeholder,

          required: true,

          position: position++,
        }))
      );

      //--------------------------------------------------
      // Enabled optional fields
      //--------------------------------------------------

      const enabled = OPTIONAL_FIELDS.filter(
        (field) => intakeFields[field.key as keyof typeof intakeFields]
      );

      if (enabled.length > 0) {
        await tx.insert(formFields).values(
          enabled.map((field) => ({
            formId: form!.id,

            key: field.key,

            type: field.type,

            label: field.label,

            placeholder: field.placeholder,

            required: false,

            position: position++,
          }))
        );
      }
    });

    return c.json({
      success: true,
    });
  }
);

export default intakeForm;