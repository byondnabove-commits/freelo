import { api } from "@/lib/api";
import type { Lead } from "../types";

export async function getLead(leadId: string) {
  return api.get<Lead>(`/api/leads/${leadId}`);
}