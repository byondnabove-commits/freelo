// features/leads/api/get-leads.ts
import { api } from "@/lib/api";
import type { Lead } from "../types";

export async function getLeads() {
  return api.get<Lead[]>("/api/leads");
}