// features/leads/api/delete-lead.ts
import { api } from "@/lib/api";

export async function deleteLead(leadId: string) {
  return api.delete<{ success: boolean }>(`/api/leads/${leadId}`);
}