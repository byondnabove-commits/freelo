import { api } from "@/lib/api";
import type { Lead, LeadLostReason } from "../types";

export async function markLeadLost(leadId: string, reason: LeadLostReason) {
  return api.patch<Lead>(`/api/leads/${leadId}/lost`, { reason });
}