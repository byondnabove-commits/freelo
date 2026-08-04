import { leadRepository } from "./repository";
import { LEAD_FIELD_NAMES } from "./constants";
import { InvalidLeadDataError, LeadNotFoundError } from "./errors";

import type { LeadStatus } from "@freelo/shared/db/schema/values.js";

type CreateFromSubmissionInput = {
  submissionId: string;
  organizationId: string;
  answers: Record<string, unknown>;
};

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return undefined;
}

export class LeadService {
  /**
   * Creates a lead directly from a form submission's answers.
   * Called synchronously from FormService.submit() — if this throws,
   * the whole submission request fails. `leads.name` and `leads.email`
   * are NOT NULL, so a submission that doesn't map to both is treated
   * as invalid lead data rather than silently skipped.
   */
  async createFromSubmission(input: CreateFromSubmissionInput) {
    const { answers, organizationId, submissionId } = input;

    const name = asString(answers[LEAD_FIELD_NAMES.name]);
    const email = asString(answers[LEAD_FIELD_NAMES.email]);

    if (!name || !email) {
      throw new InvalidLeadDataError(
        `Submission is missing required "${LEAD_FIELD_NAMES.name}" or "${LEAD_FIELD_NAMES.email}" to create a lead.`,
      );
    }

    return leadRepository.create({
      organizationId,
      submissionId,
      name,
      email,
      phone: null, // no phone field on current default intake form
      company: asString(answers[LEAD_FIELD_NAMES.company]) ?? null,
      projectType: asString(answers[LEAD_FIELD_NAMES.projectType]) ?? null,
      budget: asString(answers[LEAD_FIELD_NAMES.budget]) ?? null,
      timeline: asString(answers[LEAD_FIELD_NAMES.timeline]) ?? null,
      description: asString(answers[LEAD_FIELD_NAMES.description]) ?? null,
    });
  }

  async getById(organizationId: string, id: string) {
    const lead = await leadRepository.findById(organizationId, id);

    if (!lead) {
      throw new LeadNotFoundError();
    }

    return lead;
  }

  async list(
    organizationId: string,
    options?: { limit?: number; offset?: number },
  ) {
    return leadRepository.findByOrganizationId(organizationId, options);
  }

  async updateStatus(organizationId: string, id: string, status: LeadStatus) {
    const lead = await leadRepository.findById(organizationId, id);

    if (!lead) {
      throw new LeadNotFoundError();
    }

    return leadRepository.updateStatus(id, status);
  }
}

export const leadService = new LeadService();
