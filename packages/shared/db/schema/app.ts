import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  date,
  jsonb,
  numeric,
  uuid,
  unique,
  index,
} from "drizzle-orm/pg-core";

import {
  leadStatusEnum,
  leadQualificationEnum,
  proposalStatusEnum,
  projectStageEnum,
  taskStatusEnum,
  invoiceStatusEnum,
  subscriptionPlanEnum,
  subscriptionStatusEnum,
  contractStatusEnum,
  annotationStatusEnum,
} from "./enums";

import { organization, user } from "./auth";

// We reference organization from better-auth tables
// better-auth cli will generate those — we just reference by string here

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
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
    status: leadStatusEnum("status").notNull().default("new"),
    qualification: leadQualificationEnum("qualification")
      .notNull()
      .default("unqualified"),
    notes: text("notes"),
    // Nullable: a lead can be created manually (no public form involved),
    // not only via a form submission.
    submissionId: uuid("submission_id").references(() => formSubmissions.id, {
      onDelete: "set null",
    }),
    phone: text("phone"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("leads_organization_id_idx").on(table.organizationId)],
);

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    leadId: uuid("lead_id").references(() => leads.id, {
      onDelete: "set null",
    }),
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
  },
  (table) => [index("clients_organization_id_idx").on(table.organizationId)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    description: text("description"),
    stage: projectStageEnum("stage").notNull().default("inquiry"),
    deadline: date("deadline"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("projects_organization_id_idx").on(table.organizationId)],
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Denormalized from projects so tenant scoping doesn't require a join.
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
      }),
    title: text("title").notNull(),
    status: taskStatusEnum("status").notNull().default("todo"),
    assigneeId: text("assignee_id").references(() => user.id, {
      onDelete: "set null",
    }),
    dueDate: date("due_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("tasks_organization_id_idx").on(table.organizationId),
    index("tasks_project_id_idx").on(table.projectId),
  ],
);

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, {
        onDelete: "cascade",
      }),
    layoutTemplate: text("layout_template").notNull().default("studio"),
    status: proposalStatusEnum("status").notNull().default("draft"),
    content: jsonb("content").notNull().default({}),
    publicToken: text("public_token")
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    sentAt: timestamp("sent_at"),
    viewedAt: timestamp("viewed_at"),
    acceptedAt: timestamp("accepted_at"),
    rejectedAt: timestamp("rejected_at"),
    expiredAt: timestamp("expired_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("proposals_organization_id_idx").on(table.organizationId)],
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    // A client is always required; the project is optional (e.g. retainer
    // invoices that aren't tied to a single project).
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, {
        onDelete: "restrict",
      }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    number: text("number").notNull(),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    // Stored in cents (integer) to match `service.price` and avoid a
    // float/decimal unit mismatch if a service price feeds an invoice total.
    // Line items live in `invoiceLineItems` — see below.
    subtotal: integer("subtotal").notNull().default(0),
    total: integer("total").notNull().default(0),
    dueDate: date("due_date"),
    sentAt: timestamp("sent_at"),
    paidAt: timestamp("paid_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("invoices_organization_id_idx").on(table.organizationId),
    unique("invoices_organization_number_unique").on(
      table.organizationId,
      table.number,
    ),
  ],
);

// `invoices.items` used to be a jsonb array — that's a repeating group
// (1NF violation) hiding inside a single column. Pulling it into its own
// table lets each line item have real types, be queried/reported on
// individually, and be FK'd to the invoice instead of trusted blindly.
export const invoiceLineItems = pgTable(
  "invoice_line_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, {
        onDelete: "cascade",
      }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 })
      .notNull()
      .default("1"),
    // Cents, matching invoices.subtotal/total.
    unitPrice: integer("unit_price").notNull(),
    // quantity * unitPrice, stored (not just computed) so historical
    // invoices don't change if unitPrice conventions shift later.
    amount: integer("amount").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("invoice_line_items_organization_id_idx").on(table.organizationId),
    index("invoice_line_items_invoice_id_idx").on(table.invoiceId),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Denormalized from projects so tenant scoping doesn't require a join.
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, {
        onDelete: "cascade",
      }),
    body: text("body").notNull(),
    senderName: text("sender_name"),
    isFromClient: boolean("is_from_client").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("messages_organization_id_idx").on(table.organizationId),
    index("messages_project_id_idx").on(table.projectId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
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
  },
  (table) => [
    index("notifications_organization_id_idx").on(table.organizationId),
  ],
);

export const organizationProfile = pgTable("organization_profile", {
  id: uuid("id").primaryKey().defaultRandom(),

  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),

  // =========================
  // Step 1 - Studio
  // =========================

  logo: text("logo"),

  studioName: text("studio_name").notNull(),

  ownerName: text("owner_name").notNull(),

  professionalEmail: text("professional_email").notNull(),

  timezone: text("timezone").notNull(),

  currency: text("currency").notNull(),

  // =========================
  // Step 2 - Business
  // =========================

  serviceCategories: text("service_categories").array().notNull().default([]),

  teamSize: text("team_size"),

  averageBudget: text("average_budget"),

  // =========================
  // Brand kit (W10)
  // =========================

  brandColors: jsonb("brand_colors").notNull().default({}),

  brandFont: text("brand_font"),

  bio: text("bio"),

  signature: text("signature"),

  // =========================
  // Step 4 - Completion
  // =========================

  onboardingCompletedAt: timestamp("onboarding_completed_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
});

export const service = pgTable(
  "service",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    description: text("description"),

    // Stored in cents (integer), matching invoices.subtotal/total.
    price: integer("price"),

    currency: text("currency"),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
  },
  (table) => [index("service_organization_id_idx").on(table.organizationId)],
);

export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .notNull()
    .unique()
    .references(() => organization.id, {
      onDelete: "cascade",
    }),
  plan: subscriptionPlanEnum("plan").notNull().default("sketchbook"),
  status: subscriptionStatusEnum("status").notNull().default("active"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const forms = pgTable(
  "forms",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    name: text("name").notNull(),

    description: text("description"),

    // Globally unique (not per-org): the public route is /f/[slug] with no
    // org identifier in the path, so two orgs can't share a slug.
    slug: text("slug").notNull().unique(),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at")
      .notNull()
      .$onUpdate(() => new Date())
      .defaultNow(),
  },
  (table) => [index("forms_organization_id_idx").on(table.organizationId)],
);

export const formFields = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, {
      onDelete: "cascade",
    }),

  key: text("key").notNull(),

  type: text("type").notNull(),

  label: text("label").notNull(),

  placeholder: text("placeholder"),

  required: boolean("required").notNull().default(false),

  options: jsonb("options"),

  position: integer("position").notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, {
      onDelete: "cascade",
    }),

  submittedAt: timestamp("submitted_at").notNull().defaultNow(),

  answers: jsonb("answers").notNull().default({}),

  ipAddress: text("ip_address"),

  userAgent: text("user_agent"),

  referrer: text("referrer"),
});

// =========================
// Contracts (Phase 5, W13)
// =========================

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id, {
        onDelete: "cascade",
      }),
    content: jsonb("content").notNull().default({}),
    status: contractStatusEnum("status").notNull().default("draft"),
    publicToken: text("public_token")
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    signedAt: timestamp("signed_at"),
    signerName: text("signer_name"),
    signerEmail: text("signer_email"),
    pdfUrl: text("pdf_url"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("contracts_organization_id_idx").on(table.organizationId),
    index("contracts_proposal_id_idx").on(table.proposalId),
  ],
);

// =========================
// Files (W8, W15)
// =========================

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade",
    }),
    key: text("key").notNull(), // storage path, e.g. S3/R2 object key
    fileName: text("file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    size: integer("size").notNull(),
    uploadedBy: text("uploaded_by").references(() => user.id, {
      onDelete: "set null",
    }),
    isClientVisible: boolean("is_client_visible").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("files_organization_id_idx").on(table.organizationId),
    index("files_project_id_idx").on(table.projectId),
  ],
);

// =========================
// Annotations / design approvals (W16)
// =========================

export const annotations = pgTable(
  "annotations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),
    fileId: uuid("file_id")
      .notNull()
      .references(() => files.id, {
        onDelete: "cascade",
      }),
    // Percentage-based position (0-100) so pins stay correctly placed
    // regardless of the rendered image size.
    x: numeric("x", { precision: 5, scale: 2 }).notNull(),
    y: numeric("y", { precision: 5, scale: 2 }).notNull(),
    comment: text("comment").notNull(),
    status: annotationStatusEnum("status").notNull().default("open"),
    authorName: text("author_name"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("annotations_organization_id_idx").on(table.organizationId),
    index("annotations_file_id_idx").on(table.fileId),
  ],
);
