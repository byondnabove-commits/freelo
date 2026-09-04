import { api } from "@/lib/api";
import type { Client } from "@/features/clients/types";


export interface ConvertLeadProjectInput {
  name: string;
  description?: string | null;
  deadline?: string | null;
}

export interface ConvertLeadResult {
  client: Client;
  project: { id: string; name: string } | null;
}

// project omitted/null → convert to client only (the pre-existing manual
// "Convert to client" button's behavior). project provided → also create a
// starter project, used by the "Won" conversion dialog's primary action.
export async function convertLead(
  leadId: string,
  project?: ConvertLeadProjectInput | null,
) {
  return api.post<ConvertLeadResult>(`/api/leads/${leadId}/convert`, {
    project: project ?? null,
  });
}
