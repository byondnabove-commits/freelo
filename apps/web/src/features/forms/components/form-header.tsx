// features/forms/components/form-header.tsx
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { FormWithFields } from "../types";
import { usePublishForm } from "../hooks/use-publish-form";

type Props = {
  form: FormWithFields;
};

export function FormHeader({ form }: Props) {
  const [copied, setCopied] = useState(false);
  const { mutate: publish, isPending: isPublishing } = usePublishForm();

  const publicUrl = `${window.location.origin}/f/${form.slug}`;
  const isPublished = form.state === "published";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail silently on insecure contexts; URL is
      // still visible as text either way.
    }
  }

  function handlePublish() {
    publish(undefined, {
      onSuccess: () => toast.success("Form published!"),
      onError: () => toast.error("Failed to publish form."),
    });
  }

  return (
    <div className="rounded-2xl border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{form.title}</h1>

          {isPublished ? (
            <button
              onClick={handleCopy}
              className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {publicUrl}
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              /f/{form.slug} · publish to get a shareable link
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full border px-3 py-1 text-xs">
            {form.state}
          </span>

          {!isPublished && (
            <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? "Publishing..." : "Publish"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        {form.fields.length} fields
      </div>
    </div>
  );
}