export class LeadNotFoundError extends Error {
  constructor(message = "Lead not found") {
    super(message);
    this.name = "LeadNotFoundError";
  }
}

export class InvalidLeadDataError extends Error {
  constructor(message = "Lead data is invalid") {
    super(message);
    this.name = "InvalidLeadDataError";
  }
}