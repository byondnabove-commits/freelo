/**
 * Shared enum values.
 *
 * Frontend:
 * import { LEAD_STATUSES } from "@freelo/shared/db/schema/values";
 *
 * Backend:
 * import { LEAD_STATUSES } from "./values";
 *
 * Database:
 * import { LEAD_STATUSES } from "./values";
 * pgEnum("lead_status", LEAD_STATUSES);
 */

// ================================
// Leads
// ================================

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "negotiating",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_QUALIFICATIONS = ["unqualified", "qualified"] as const;

export type LeadQualification = (typeof LEAD_QUALIFICATIONS)[number];

// Required whenever a lead's status is set to "lost" — see
// LeadService.markAsLost. Never set on any other status.
export const LEAD_LOST_REASONS = [
  "budget_too_low",
  "chose_other_freelancer",
  "timeline_mismatch",
  "went_unresponsive",
  "not_right_fit",
  "other",
] as const;

export type LeadLostReason = (typeof LEAD_LOST_REASONS)[number];

// ================================
// Projects
// ================================

export const PROJECT_STAGES = [
  "planning",
  "active",
  "review",
  "completed",
  "cancelled",
] as const;

export type ProjectStage = (typeof PROJECT_STAGES)[number];

// ================================
// Tasks
// ================================

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

// ================================
// Proposals
// ================================

export const PROPOSAL_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

// ================================
// Invoices
// ================================

export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

// ================================
// Subscription
// ================================

export const SUBSCRIPTION_PLANS = ["sketchbook", "studio"] as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "active",
  "cancelled",
  "past_due",
] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// ================================
// Contracts
// ================================

export const CONTRACT_STATUSES = [
  "draft",
  "sent",
  "signed",
  "declined",
] as const;

export type ContractStatus = (typeof CONTRACT_STATUSES)[number];

// ================================
// Annotations
// ================================

export const ANNOTATION_STATUSES = [
  "open",
  "approved",
  "changes_requested",
] as const;

export type AnnotationStatus = (typeof ANNOTATION_STATUSES)[number];

// ================================
// Forms
// ================================

export const FORM_STATES = [
  "draft",
  "published",
] as const;

export type FormState = (typeof FORM_STATES)[number];

export const FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "phone",
  "url",
  "number",
  "date",
  "select",
  "radio",
  "checkbox",
  "file"
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];