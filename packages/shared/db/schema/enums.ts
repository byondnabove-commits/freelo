import { pgEnum } from "drizzle-orm/pg-core";

import {
  LEAD_STATUSES,
  LEAD_QUALIFICATIONS,
  PROJECT_STAGES,
  TASK_STATUSES,
  PROPOSAL_STATUSES,
  INVOICE_STATUSES,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  CONTRACT_STATUSES,
  ANNOTATION_STATUSES,
} from "./values";

export const leadStatusEnum = pgEnum("lead_status", LEAD_STATUSES);

export const leadQualificationEnum = pgEnum(
  "lead_qualification",
  LEAD_QUALIFICATIONS,
);

export const proposalStatusEnum = pgEnum("proposal_status", PROPOSAL_STATUSES);

export const projectStageEnum = pgEnum("project_stage", PROJECT_STAGES);

export const taskStatusEnum = pgEnum("task_status", TASK_STATUSES);

export const invoiceStatusEnum = pgEnum("invoice_status", INVOICE_STATUSES);

export const subscriptionPlanEnum = pgEnum(
  "subscription_plan",
  SUBSCRIPTION_PLANS,
);

export const subscriptionStatusEnum = pgEnum(
  "subscription_status",
  SUBSCRIPTION_STATUSES,
);

export const contractStatusEnum = pgEnum("contract_status", CONTRACT_STATUSES);

export const annotationStatusEnum = pgEnum(
  "annotation_status",
  ANNOTATION_STATUSES,
);
