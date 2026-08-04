export const DEFAULT_FORM_TITLE = "Client Intake Form";

export const DEFAULT_SUCCESS_MESSAGE =
  "Thank you! Your submission has been received.";

export const MAX_FORM_FIELDS = 100;

export const MAX_FIELD_LABEL_LENGTH = 100;

export const MAX_FIELD_PLACEHOLDER_LENGTH = 150;

export const MAX_FIELD_HELP_TEXT_LENGTH = 300;

export const MAX_FORM_TITLE_LENGTH = 100;

export const MAX_FORM_DESCRIPTION_LENGTH = 1000;

// Maps form-field `name` values → lead table columns. This is the
// contract between however the intake form is authored and what the
// leads table expects. If your default form's field names differ,
// update the values here — not the service logic.
export const LEAD_FIELD_NAMES = {
  name: "name",
  email: "email",
  phone: "phone",
  company: "company",
  projectType: "project_type",
  budget: "budget",
  timeline: "timeline",
  description: "description",
} as const;
