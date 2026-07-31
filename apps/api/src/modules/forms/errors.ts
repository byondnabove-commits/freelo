export class FormNotFoundError extends Error {
  constructor(message = "Form not found") {
    super(message);
    this.name = "FormNotFoundError";
  }
}

export class DuplicateSlugError extends Error {
  constructor(message = "Slug already exists") {
    super(message);
    this.name = "DuplicateSlugError";
  }
}

export class FormAlreadyPublishedError extends Error {
  constructor(message = "Form is already published") {
    super(message);
    this.name = "FormAlreadyPublishedError";
  }
}

export class FormFieldNotFoundError extends Error {
  constructor(message = "Form field not found") {
    super(message);
    this.name = "FormFieldNotFoundError";
  }
}

export class MaxFieldsReachedError extends Error {
  constructor(message = "Maximum number of fields reached") {
    super(message);
    this.name = "MaxFieldsReachedError";
  }
}

export class InvalidSubmissionError extends Error {
  constructor(message = "Submission is invalid") {
    super(message);
    this.name = "InvalidSubmissionError";
  }
}