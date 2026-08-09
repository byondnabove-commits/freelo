export class ClientNotFoundError extends Error {
  constructor(message = "Client not found") {
    super(message);
    this.name = "ClientNotFoundError";
  }
}

export class LeadAlreadyConvertedError extends Error {
  constructor(message = "This lead has already been converted to a client") {
    super(message);
    this.name = "LeadAlreadyConvertedError";
  }
}