// modules/forms/pages/PublicFormPage.tsx
import { useState } from "react";
import { useParams } from "react-router-dom"; // adjust if you use a different router
import { CheckCircle2 } from "lucide-react";
import { usePublicForm } from "../hooks/use-public-form";
import { useSubmitPublicForm } from "../hooks/use-submit-public-form";
import { FormRenderer } from "../components/renderer/FormRenderer";
import type { FormAnswers } from "../types";

export default function PublicFormPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isPending, isError } = usePublicForm(slug!);
  const { mutate, isPending: isSubmitting } = useSubmitPublicForm(slug!);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isPending) {
    return (
      <PageShell>
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-10 w-full rounded bg-slate-100" />
          <div className="h-10 w-full rounded bg-slate-100" />
        </div>
      </PageShell>
    );
  }

  if (isError || !data?.data) {
    return (
      <PageShell>
        <div className="text-center">
          <h1 className="text-xl font-semibold">Form not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This form may have been unpublished or the link is incorrect.
          </p>
        </div>
      </PageShell>
    );
  }

  const form = data.data;

  if (successMessage) {
    return (
      <PageShell>
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
          <h1 className="mt-3 text-xl font-semibold">Thanks!</h1>
          <p className="mt-2 text-sm text-muted-foreground">{successMessage}</p>
        </div>
      </PageShell>
    );
  }

  function handleSubmit(answers: FormAnswers) {
    mutate(answers, {
      onSuccess: (res) => setSuccessMessage(res.data.successMessage),
    });
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-semibold">{form.title}</h1>

      {form.description && (
        <p className="mt-2 text-sm text-muted-foreground">{form.description}</p>
      )}

      <div className="mt-6">
        <FormRenderer
          fields={form.fields}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-lg rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}