// features/leads/api/update-lead-status.ts
import { api } from "@/lib/api";
import type { Lead, LeadStatus } from "../types";

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  return api.patch<Lead>(`/api/leads/${leadId}/status`, { status });
}