import { BUDGET_BRACKETS, SERVICE_UNITS, TEAM_SIZES } from "@freelo/contracts/onboarding";
import { bigint, boolean, index, integer, jsonb, pgTable, smallint, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { organization, user } from "./auth";
import { createdAt, id, organizationId, updatedAt } from "./columns";

const ms = { withTimezone: true, precision: 3 } as const;

// 1:1 with organization (04-s2 §7). Created with the workspace.
export const organizationProfile = pgTable("organization_profile", {
  organizationId: text()
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  logoFileId: uuid(),
  documentLocale: text({ enum: ["en", "fr"] }).notNull().default("en"),
  timezone: text().notNull().default("Africa/Algiers"),
  currency: text().notNull().default("DZD"),
  teamSize: text({ enum: TEAM_SIZES }),
  typicalBudget: text({ enum: BUDGET_BRACKETS }),
  // Business details (asked just in time, 04-s2 §6).
  legalName: text(),
  legalForm: text(),
  nif: text(),
  nis: text(),
  rcNumber: text(),
  aeCardNumber: text(),
  articleImposition: text(),
  address: text(),
  wilaya: text(),
  businessPhone: text(),
  businessEmail: text(),
  paymentMethods: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  paymentNote: text(),
  tvaSubject: boolean(),
  tvaDefaultRateBp: integer(),
  tvaExemptionMention: text(),
  onboardingStep: smallint().notNull().default(0),
  onboardingCompletedAt: timestamp(ms),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const services = pgTable(
  "services",
  {
    id: id(),
    organizationId: organizationId(),
    name: text().notNull(),
    description: text(),
    // Centimes; null = "price on request".
    price: bigint({ mode: "number" }),
    unit: text({ enum: SERVICE_UNITS }).notNull().default("project"),
    position: integer().notNull().default(0),
    archivedAt: timestamp(ms),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("services_org_position_idx").on(t.organizationId, t.position)],
);

export const files = pgTable(
  "files",
  {
    id: id(),
    organizationId: organizationId(),
    kind: text({ enum: ["logo"] }).notNull(),
    storageKey: text().notNull().unique(),
    mimeType: text().notNull(),
    sizeBytes: integer().notNull(),
    uploadedBy: text().references(() => user.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("files_org_idx").on(t.organizationId)],
);
