// modules/leads/service.ts
import { leadRepository } from "./repository";
import { clientRepository } from "@/modules/clients/repository";
import { LEAD_FIELD_NAMES } from "./constants";
import {
  InvalidLeadDataError,
  LeadNotFoundError,
  LostReasonRequiredError,
} from "./errors";
import { leadNotificationEmail, leadConfirmationEmail } from "./templates";
import { sendEmail } from "@/services/email";
import { getOrganizationContactEmail } from "@/lib/organization-contact";

import type {
  LeadStatus,
  LeadLostReason,
} from "@freelo/shared/db/schema/values.js";

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
  async createFromSubmission(input: CreateFromSubmissionInput) {
    const { answers, organizationId, submissionId } = input;

    const name = asString(answers[LEAD_FIELD_NAMES.name]);
    const email = asString(answers[LEAD_FIELD_NAMES.email]);

    if (!name || !email) {
      throw new InvalidLeadDataError(
        `Submission is missing required "${LEAD_FIELD_NAMES.name}" or "${LEAD_FIELD_NAMES.email}" to create a lead.`,
      );
    }

    const lead = await leadRepository.create({
      organizationId,
      submissionId,
      name,
      email,
      phone: null,
      company: asString(answers[LEAD_FIELD_NAMES.company]) ?? null,
      projectType: asString(answers[LEAD_FIELD_NAMES.projectType]) ?? null,
      budget: asString(answers[LEAD_FIELD_NAMES.budget]) ?? null,
      timeline: asString(answers[LEAD_FIELD_NAMES.timeline]) ?? null,
      description: asString(answers[LEAD_FIELD_NAMES.description]) ?? null,
    });

    try {
      const ownerEmail = await getOrganizationContactEmail(organizationId);

      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `New lead: ${lead.name}`,
          html: leadNotificationEmail(lead),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 10000));

      await sendEmail({
        to: lead.email,
        subject: "We received your submission",
        html: leadConfirmationEmail(lead),
      });
    } catch (err) {
      console.error("[leads] Failed to send notification emails:", err);
    }

    return lead;
  }

  async getById(organizationId: string, id: string) {
    const lead = await leadRepository.findById(organizationId, id);
    if (!lead) throw new LeadNotFoundError();

    const client = await clientRepository.findByLeadId(id);

    return {
      ...lead,
      convertedClient: client ? { id: client.id, name: client.name } : null,
    };
  }

  async list(
    organizationId: string,
    options?: { limit?: number; offset?: number; includeLost?: boolean },
  ) {
    return leadRepository.findByOrganizationId(organizationId, options);
  }

  async updateStatus(organizationId: string, id: string, status: LeadStatus) {
    // "lost" always requires a reason — enforced here, not just by
    // frontend discipline, so no caller of this service can accidentally
    // skip it.
    if (status === "lost") {
      throw new LostReasonRequiredError();
    }

    const lead = await leadRepository.findById(organizationId, id);
    if (!lead) throw new LeadNotFoundError();
    return leadRepository.updateStatus(id, status);
  }

  async markAsLost(organizationId: string, id: string, reason: LeadLostReason) {
    const lead = await leadRepository.findById(organizationId, id);
    if (!lead) throw new LeadNotFoundError();
    return leadRepository.markAsLost(id, reason);
  }

  async updateNotes(organizationId: string, id: string, notes: string | null) {
    const lead = await leadRepository.findById(organizationId, id);
    if (!lead) throw new LeadNotFoundError();
    return leadRepository.update(id, { notes });
  }

  async delete(organizationId: string, id: string) {
    const lead = await leadRepository.findById(organizationId, id);
    if (!lead) throw new LeadNotFoundError();
    await leadRepository.delete(id);
  }
}

export const leadService = new LeadService();
