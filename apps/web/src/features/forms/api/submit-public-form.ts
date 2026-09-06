// modules/forms/api/submit-public-form.ts
import { api } from "@/lib/api";
import type { FormAnswers } from "../types";

type SubmitResponse = {
  id: string;
  submittedAt: string;
  successMessage: string;
};

export async function submitPublicForm(
  slug: string,
  answers: FormAnswers,
  idempotencyKey: string,
) {
  return api.post<SubmitResponse>(`/api/forms/public/${slug}/submit`, {
    answers,
    idempotencyKey,
  });
}
