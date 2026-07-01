// routes/onboarding.ts
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { organizationProfile, service, forms, formFields } from "@/db/schema";
import { requireAuth } from "@/middleware/require-auth";
import { requireOrg } from "@/middleware/require-org";
import type { AppEnv } from "@/types/hono";

const onboardingPayloadSchema = z.object({
  fullName: z.string().min(2),
  timezone: z.string(),
  professionalEmail: z.string().email(),
  currency: z.string(),
  logoUrl: z.string().optional(),
  services: z.array(z.string()).min(1),
  workStyle: z.enum(["solo", "team", "subcontract"]),
  averageBudget: z.enum(["under-1k", "1k-5k", "5k-15k", "15k-plus"]),
  intakeFields: z.object({
    companyName: z.boolean(),
    projectType: z.boolean(),
    budgetRange: z.boolean(),
    preferredTimeline: z.boolean(),
    projectDescription: z.boolean(),
    websiteUrl: z.boolean(),
    attachments: z.boolean(),
    referralSource: z.boolean(),
  }),
});

// Definition for every optional intake field: DB field type, label, placeholder
const OPTIONAL_FIELD_DEFS = {
  companyName: { type: "text", label: "Company/Brand name", placeholder: "Acme Inc." },
  projectType: { type: "text", label: "Project type", placeholder: "Branding, web design, development..." },
  budgetRange: { type: "text", label: "Budget range", placeholder: "$1,000 - $5,000" },
  preferredTimeline: { type: "text", label: "Preferred timeline", placeholder: "When do you need this done?" },
  projectDescription: { type: "textarea", label: "Project description", placeholder: "Tell me about your project" },
  websiteUrl: { type: "url", label: "Website URL", placeholder: "https://" },
  attachments: { type: "file", label: "Attach a brief or inspiration", placeholder: null },
  referralSource: { type: "text", label: "How did you find me?", placeholder: null },
} as const;

const route = new Hono<AppEnv>();

route.post("/", requireAuth, requireOrg, async (c) => {
  const parsed = onboardingPayloadSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: { code: "VALIDATION", message: parsed.error.message } }, 400);
  }
  const data = parsed.data;
  const organizationId = c.get("organizationId");
  const org = c.get("organization"); // has .slug from requireOrg

  const result = await db.transaction(async (tx) => {
    // 1. Upsert organization_profile
    const [existingProfile] = await tx
      .select()
      .from(organizationProfile)
      .where(eq(organizationProfile.organizationId, organizationId))
      .limit(1);

    const profileValues = {
      organizationId,
      logo: data.logoUrl ?? null,
      ownerName: data.fullName,
      professionalEmail: data.professionalEmail,
      timezone: data.timezone,
      currency: data.currency,
      teamCount: data.workStyle, // column is text, holds "solo"/"team"/"subcontract"
      averageBudget: data.averageBudget,
      onboardingCompletedAt: new Date(),
    };

    const [profile] = existingProfile
      ? await tx
          .update(organizationProfile)
          .set(profileValues)
          .where(eq(organizationProfile.organizationId, organizationId))
          .returning()
      : await tx.insert(organizationProfile).values(profileValues).returning();

    // 2. Insert services (skip if this org already has some, e.g. re-submitting onboarding)
    if (data.services.length > 0) {
      await tx.insert(service).values(
        data.services.map((name) => ({ organizationId, name })),
      );
    }

    // 3. Seed a default intake form
    const [defaultForm] = await tx
      .insert(forms)
      .values({
        organizationId,
        name: "Client Intake Form",
        description: "Default intake form — edit anytime",
        slug: `intake-${org.slug}`,
        isActive: true,
      })
      .returning();

    // Always-mandatory fields first, then toggled-on optional fields, in fixed order
    const mandatoryFields = [
      { type: "text", label: "Full name", placeholder: null, required: true },
      { type: "email", label: "Email address", placeholder: null, required: true },
    ];

    const optionalFields = (Object.keys(OPTIONAL_FIELD_DEFS) as Array<keyof typeof OPTIONAL_FIELD_DEFS>)
      .filter((key) => data.intakeFields[key])
      .map((key) => ({ ...OPTIONAL_FIELD_DEFS[key], required: false }));

    const allFields = [...mandatoryFields, ...optionalFields];

    if (allFields.length > 0) {
      await tx.insert(formFields).values(
        allFields.map((f, i) => ({
          formId: defaultForm.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          required: f.required,
          options: null,
          position: i,
        })),
      );
    }

    return { profile, form: defaultForm };
  });

  return c.json({ data: result });
});

export default route;