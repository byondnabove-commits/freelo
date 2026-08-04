import { api } from "@/lib/api";
import type { FormWithFields } from "../types";

export async function getDefaultForm() {
  return api.get<FormWithFields>("/api/forms");
}
