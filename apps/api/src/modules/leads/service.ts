// modules/leads/service.ts
import { leadRepository } from "./repository";
import { LEAD_FIELD_NAMES } from "./constants";
import { InvalidLeadDataError, LeadNotFoundError } from "./errors";
import { leadNotificationEmail, leadConfirmationEmail } from "./templates";
import { sendEmail } from "@/services/email";
import { getOrganizationContactEmail } from "@/lib/organization-contact";

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

    // Notifications are a side effect of lead creation, not part of its
    // correctness — a Mailtrap hiccup shouldn't fail the client's form
    // submission. Errors are caught and logged, never rethrown.
    // modules/leads/service.ts — inside the try block

    // modules/leads/service.ts — inside the try block

    try {
      const ownerEmail = await getOrganizationContactEmail(organizationId);

      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `New lead: ${lead.name}`,
          html: leadNotificationEmail(lead),
        });
      }

      // Mailtrap's testing sandbox rate-limits emails sent in rapid
      // succession. A few seconds of headroom avoids "Too many emails
      // per second" on the second send. Not needed on a real sending plan.
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
    if (!lead) throw new LeadNotFoundError();
    return leadRepository.updateStatus(id, status);
  }

  // add inside LeadService, alongside updateStatus
  async updateNotes(organizationId: string, id: string, notes: string | null) {
    const lead = await leadRepository.findById(organizationId, id);
    if (!lead) throw new LeadNotFoundError();
    return leadRepository.update(id, { notes });
  }

  // add inside LeadService
async delete(organizationId: string, id: string) {
  const lead = await leadRepository.findById(organizationId, id);
  if (!lead) throw new LeadNotFoundError();
  await leadRepository.delete(id);
}
}

export const leadService = new LeadService();
