import type { leads } from "@freelo/shared/db/schema/app.js";

type Lead = typeof leads.$inferSelect;

export function leadNotificationEmail(lead: Lead) {
  return `
    <h2>New lead: ${lead.name}</h2>
    <p><strong>Email:</strong> ${lead.email}</p>
    ${lead.company ? `<p><strong>Company:</strong> ${lead.company}</p>` : ""}
    ${lead.projectType ? `<p><strong>Project type:</strong> ${lead.projectType}</p>` : ""}
    ${lead.budget ? `<p><strong>Budget:</strong> ${lead.budget}</p>` : ""}
    ${lead.timeline ? `<p><strong>Timeline:</strong> ${lead.timeline}</p>` : ""}
    ${lead.description ? `<p><strong>Details:</strong><br/>${lead.description}</p>` : ""}
  `;
}

export function leadConfirmationEmail(lead: Lead) {
  return `
    <h2>Thanks for reaching out, ${lead.name.split(" ")[0]}!</h2>
    <p>We've received your submission and will be in touch shortly.</p>
  `;
}