import { api } from "@/lib/api";
import type { Client } from "@/features/clients/types";

export async function convertLead(leadId: string) {
  return api.post<Client>(`/api/leads/${leadId}/convert`);
}