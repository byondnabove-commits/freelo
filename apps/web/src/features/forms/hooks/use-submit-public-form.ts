// modules/forms/hooks/use-submit-public-form.ts
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { submitPublicForm } from "../api/submit-public-form";
import { ApiError } from "@/lib/api";
import type { FormAnswers } from "../types";

interface SubmitVariables {
  answers: FormAnswers;
  idempotencyKey: string;
}

export function useSubmitPublicForm(slug: string) {
  return useMutation({
    mutationFn: ({ answers, idempotencyKey }: SubmitVariables) =>
      submitPublicForm(slug, answers, idempotencyKey),
    onError: (err) => {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.";
      toast.error(message);
    },
  });
}
