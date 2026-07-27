import { relations } from "drizzle-orm";

import { organization, user } from "./auth";

import {
  leads,
  clients,
  projects,
  tasks,
  proposals,
  invoices,
  invoiceLineItems,
  messages,
  notifications,
  organizationProfile,
  service,
  subscription,
  forms,
  formFields,
  formSubmissions,
  contracts,
  files,
  annotations,
} from "./app";

// NOTE: `organization` and `user` already have their own `relations()`
// definitions in auth.ts (organizationRelations, userRelations), which we
// are intentionally leaving untouched. Every relation below is declared
// from the *app.ts* side of the relationship instead — e.g. `leads` points
// at `organization`, rather than `organization` pointing at `leads`.
//
// Practical effect: `db.query.leads.findMany({ with: { organization: true } })`
// works, but `db.query.organization.findMany({ with: { leads: true } })`
// does not, unless organizationRelations/userRelations in auth.ts are
// extended to include these. Same goes for `user` (tasks.assignee,
// files.uploadedByUser work; user.assignedTasks does not).

export const leadsRelations = relations(leads, ({ one, many }) => ({
  organization: one(organization, {
    fields: [leads.organizationId],
    references: [organization.id],
  }),
  submission: one(formSubmissions, {
    fields: [leads.submissionId],
    references: [formSubmissions.id],
  }),
  clients: many(clients),
  proposals: many(proposals),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  organization: one(organization, {
    fields: [clients.organizationId],
    references: [organization.id],
  }),
  lead: one(leads, {
    fields: [clients.leadId],
    references: [leads.id],
  }),
  projects: many(projects),
  invoices: many(invoices),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organization, {
    fields: [projects.organizationId],
    references: [organization.id],
  }),
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  tasks: many(tasks),
  messages: many(messages),
  invoices: many(invoices),
  files: many(files),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  organization: one(organization, {
    fields: [tasks.organizationId],
    references: [organization.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(user, {
    fields: [tasks.assigneeId],
    references: [user.id],
  }),
}));

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  organization: one(organization, {
    fields: [proposals.organizationId],
    references: [organization.id],
  }),
  lead: one(leads, {
    fields: [proposals.leadId],
    references: [leads.id],
  }),
  contracts: many(contracts),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organization, {
    fields: [invoices.organizationId],
    references: [organization.id],
  }),
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(
  invoiceLineItems,
  ({ one }) => ({
    organization: one(organization, {
      fields: [invoiceLineItems.organizationId],
      references: [organization.id],
    }),
    invoice: one(invoices, {
      fields: [invoiceLineItems.invoiceId],
      references: [invoices.id],
    }),
  }),
);

export const messagesRelations = relations(messages, ({ one }) => ({
  organization: one(organization, {
    fields: [messages.organizationId],
    references: [organization.id],
  }),
  project: one(projects, {
    fields: [messages.projectId],
    references: [projects.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  organization: one(organization, {
    fields: [notifications.organizationId],
    references: [organization.id],
  }),
}));

export const organizationProfileRelations = relations(
  organizationProfile,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationProfile.organizationId],
      references: [organization.id],
    }),
  }),
);

export const serviceRelations = relations(service, ({ one }) => ({
  organization: one(organization, {
    fields: [service.organizationId],
    references: [organization.id],
  }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  organization: one(organization, {
    fields: [subscription.organizationId],
    references: [organization.id],
  }),
}));

export const formsRelations = relations(forms, ({ one, many }) => ({
  organization: one(organization, {
    fields: [forms.organizationId],
    references: [organization.id],
  }),
  fields: many(formFields),
  submissions: many(formSubmissions),
}));

export const formFieldsRelations = relations(formFields, ({ one }) => ({
  form: one(forms, {
    fields: [formFields.formId],
    references: [forms.id],
  }),
}));

export const formSubmissionsRelations = relations(
  formSubmissions,
  ({ one, many }) => ({
    form: one(forms, {
      fields: [formSubmissions.formId],
      references: [forms.id],
    }),
    leads: many(leads),
  }),
);

export const contractsRelations = relations(contracts, ({ one }) => ({
  organization: one(organization, {
    fields: [contracts.organizationId],
    references: [organization.id],
  }),
  proposal: one(proposals, {
    fields: [contracts.proposalId],
    references: [proposals.id],
  }),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  organization: one(organization, {
    fields: [files.organizationId],
    references: [organization.id],
  }),
  project: one(projects, {
    fields: [files.projectId],
    references: [projects.id],
  }),
  uploadedByUser: one(user, {
    fields: [files.uploadedBy],
    references: [user.id],
  }),
  annotations: many(annotations),
}));

export const annotationsRelations = relations(annotations, ({ one }) => ({
  organization: one(organization, {
    fields: [annotations.organizationId],
    references: [organization.id],
  }),
  file: one(files, {
    fields: [annotations.fileId],
    references: [files.id],
  }),
}));