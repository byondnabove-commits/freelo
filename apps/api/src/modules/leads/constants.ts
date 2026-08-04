// Maps form-field `name` values → lead table columns. This is the
// contract between however the intake form is authored and what the
// leads table expects. If your default form's field names differ,
// update the values here — not the service logic.
export const LEAD_FIELD_NAMES = {
  name: "fullName",
  email: "email",
  company: "companyName",
  projectType: "projectType",
  budget: "budgetRange",
  timeline: "preferredTimeline",
  description: "projectDescription",
} as const;