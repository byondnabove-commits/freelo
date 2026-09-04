import { api } from "@/lib/api";
import type { OrgPreferences } from "../types";

export async function updateOrgPreferences(data: Partial<OrgPreferences>) {
  return api.patch<OrgPreferences>("/api/settings/preferences", data);
}