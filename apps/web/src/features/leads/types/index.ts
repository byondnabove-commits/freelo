import type {
  LeadStatus,
  LeadQualification,
} from "@freelo/shared/db/schema/values.js";

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
  // Real conversion signal — null until a client row actually exists for
  // this lead. Only present on the GET /:leadId response (LeadService.getById),
  // not on list responses.
  convertedClient: { id: string; name: string } | null;
};

export type { LeadStatus, LeadQualification };
