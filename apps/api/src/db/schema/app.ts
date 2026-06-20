import {
  pgTable,
  text,
  timestamp,
  boolean,
  date,
  jsonb,
  numeric,
  uuid,
} from "drizzle-orm/pg-core";

import { organization } from "./auth";

// We reference organization from better-auth tables
// better-auth cli will generate those — we just reference by string here
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  projectType: text("project_type"),
  budget: text("budget"),
  timeline: text("timeline"),
  description: text("description"),
  status: text("status").notNull().default("new"),
  score: text("score").notNull().default("unqualified"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  leadId: text("lead_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  portalToken: text("portal_token")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  clientId: text("client_id"),
  name: text("name").notNull(),
  description: text("description"),
  stage: text("stage").notNull().default("inquiry"),
  deadline: date("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  title: text("title").notNull(),
  status: text("status").notNull().default("todo"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  projectId: uuid("project_id").notNull(),
  clientId: uuid("client_id"),
  layoutTemplate: text("layout_template").notNull().default("studio"),
  status: text("status").notNull().default("draft"),
  content: jsonb("content").notNull().default({}),
  publicToken: text("public_token")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  oorgId: uuid("org_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  projectId: uuid("project_id"),
  clientId: uuid("client_id"),
  number: text("number").notNull(),
  status: text("status").notNull().default("draft"),
  items: jsonb("items").notNull().default([]),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull().default("0"),
  dueDate: date("due_date"),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull(),
  body: text("body").notNull(),
  senderName: text("sender_name"),
  isFromClient: boolean("is_from_client").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const organizationProfile = pgTable("organization_profile", {
  id: uuid("id").primaryKey().defaultRandom(),

  organizationId: uuid("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),

  ownerName: text("owner_name").notNull(),
  professionalEmail: text("professional_email").notNull(),
  timezone: text("timezone").notNull(),
  currency: text("currency").notNull(),
  workStyle: text("work_style").notNull(),
  averageBudget: text("average_budget").notNull(),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const service = pgTable("service", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  plan: text("plan").notNull().default("solo"),
  status: text("status").notNull().default("trialing"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
