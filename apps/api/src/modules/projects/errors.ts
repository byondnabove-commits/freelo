export class ProjectNotFoundError extends Error {
  constructor(message = "Project not found") {
    super(message);
    this.name = "ProjectNotFoundError";
  }
}