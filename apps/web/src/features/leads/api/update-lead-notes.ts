import { api } from "@/lib/api";
import type { Lead } from "../types";

export async function updateLeadNotes(leadId: string, notes: string | null) {
  return api.patch<Lead>(`/api/leads/${leadId}/notes`, { notes });
}