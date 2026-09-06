import { db } from "@/db";
import { clientRepository } from "./repository";
import { leadRepository } from "@/modules/leads/repository";
import { LeadNotFoundError } from "@/modules/leads/errors";
import { projectRepository } from "@/modules/projects/repository";
import { ClientNotFoundError, LeadAlreadyConvertedError } from "./errors";
import type { UpdateClientInput } from "./schema";

type ConvertLeadProjectInput = {
  name: string;
  description?: string | null;
  deadline?: string | null;
};

export class ClientService {
  async createFromLead(
    organizationId: string,
    leadId: string,
    project?: ConvertLeadProjectInput | null,
  ) {
    return db.transaction(async (tx) => {
      const lead = await leadRepository.findById(organizationId, leadId, tx);
      if (!lead) {
        throw new LeadNotFoundError();
      }

      const existing = await clientRepository.findByLeadId(leadId, tx);
      if (existing) {
        throw new LeadAlreadyConvertedError();
      }

      const client = await clientRepository.create(
        {
          organizationId,
          leadId: lead.id,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          phone: lead.phone,
        },
        tx,
      );

      let createdProject = null;
      if (project) {
        createdProject = await projectRepository.create(
          {
            organizationId,
            clientId: client.id,
            name: project.name,
            description: project.description ?? null,
            deadline: project.deadline ?? null,
          },
          tx,
        );
      }

      await leadRepository.updateStatus(lead.id, "won", tx);

      return { client, project: createdProject };
    });
  }

  async getById(organizationId: string, id: string) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) throw new ClientNotFoundError();
    return client;
  }

  async list(
    organizationId: string,
    options?: { limit?: number; offset?: number; includeArchived?: boolean },
  ) {
    return clientRepository.findByOrganizationId(organizationId, options);
  }

  async update(organizationId: string, id: string, data: UpdateClientInput) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) throw new ClientNotFoundError();
    return clientRepository.update(id, data);
  }

  async getByPortalToken(token: string) {
    const client = await clientRepository.findByPortalToken(token);
    if (!client) throw new ClientNotFoundError();
    return client;
  }

  // "Delete" a client with zero projects still really deletes. A client
  // with existing projects is archived instead — no cascade option
  // exposed here at all, so a delete can never silently wipe project
  // history. The caller (frontend) doesn't have to decide which happens;
  // the response tells it which one did, for showing the right toast.
  async delete(organizationId: string, id: string) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) throw new ClientNotFoundError();

    const projectCount = await projectRepository.countByClientId(id);

    if (projectCount === 0) {
      await clientRepository.delete(id);
      return { action: "deleted" as const };
    }

    await clientRepository.archive(id);
    return { action: "archived" as const, projectCount };
  }

  async restore(organizationId: string, id: string) {
    const client = await clientRepository.findById(organizationId, id);
    if (!client) throw new ClientNotFoundError();
    return clientRepository.restore(id);
  }
}

export const clientService = new ClientService();
