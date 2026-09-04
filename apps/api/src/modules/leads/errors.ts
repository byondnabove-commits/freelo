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

// Thrown if something tries to set status="lost" through the generic
// updateStatus path. Marking a lead lost always requires a reason, so it
// must go through LeadService.markAsLost instead — enforced here, in the
// service layer, not just left to frontend discipline.
export class LostReasonRequiredError extends Error {
  constructor(
    message = "Marking a lead as lost requires a reason — use the dedicated endpoint",
  ) {
    super(message);
    this.name = "LostReasonRequiredError";
  }
}
