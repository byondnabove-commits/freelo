import { projectRepository } from "./repository";
import { clientRepository } from "@/modules/clients/repository";
import { ClientNotFoundError } from "@/modules/clients/errors";
import { ProjectNotFoundError } from "./errors";

import type {
  CreateProjectInput,
  UpdateProjectStageInput,
  UpdateProjectInput,
} from "./schema";

export class ProjectService {
  async create(organizationId: string, data: CreateProjectInput) {
    const client = await clientRepository.findById(organizationId, data.clientId);
    if (!client) throw new ClientNotFoundError();

    return projectRepository.create({
      organizationId,
      clientId: data.clientId,
      name: data.name,
      description: data.description ?? null,
      deadline: data.deadline ?? null,
    });
  }

  async list(organizationId: string) {
    return projectRepository.findByOrganizationId(organizationId);
  }

  async getById(organizationId: string, id: string) {
    const project = await projectRepository.findById(organizationId, id);
    if (!project) throw new ProjectNotFoundError();
    return project;
  }

  async updateStage(organizationId: string, id: string, stage: UpdateProjectStageInput["stage"]) {
    const project = await projectRepository.findById(organizationId, id);
    if (!project) throw new ProjectNotFoundError();
    return projectRepository.updateStage(id, stage);
  }

  async update(organizationId: string, id: string, data: UpdateProjectInput) {
    const project = await projectRepository.findById(organizationId, id);
    if (!project) throw new ProjectNotFoundError();
    return projectRepository.update(id, data);
  }

  async delete(organizationId: string, id: string) {
    const project = await projectRepository.findById(organizationId, id);
    if (!project) throw new ProjectNotFoundError();
    await projectRepository.delete(id);
  }
}

export const projectService = new ProjectService();