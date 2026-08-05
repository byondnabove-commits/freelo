import type { LeadStatus, LeadQualification } from "@freelo/shared/db/schema/values.js";

export type Lead = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  company: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
  description: string | null;
  status: LeadStatus;
  qualification: LeadQualification;
  notes: string | null;
  submissionId: string | null;
  phone: string | null;
  createdAt: string;
};

export type { LeadStatus, LeadQualification };