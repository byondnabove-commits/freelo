import { useState } from "react";
import { useParams } from "react-router-dom";
import { Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClient } from "../hooks/use-client";
import { useUpdateClient } from "../hooks/use-update-client";
import { NotesEditor } from "@/features/leads/components/notes-editor";

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { data, isPending, isError } = useClient(clientId!);
  const { mutate: save, isPending: isSaving } = useUpdateClient(clientId!);
  const [copied, setCopied] = useState(false);

  if (isPending)
    return <div className="animate-pulse h-64 rounded-xl bg-slate-50" />;
  if (isError || !data?.data) {
    return <div className="text-muted-foreground">Client not found.</div>;
  }

  const client = data.data;
  const portalUrl = `${window.location.origin}/portal/${client.portalToken}`;

  async function handleCopyPortalLink() {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard can fail silently on insecure contexts
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <p className="text-sm text-muted-foreground">{client.email}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Company" value={client.company} />
          <Field label="Phone" value={client.phone} />
          <Field
            label="Client since"
            value={new Date(client.createdAt).toLocaleDateString()}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Client portal</CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={handleCopyPortalLink}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {portalUrl}
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesEditor
            key={client.id}
            initialNotes={client.notes}
            onSave={(notes) => save({ notes })}
            isSaving={isSaving}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p>{value ?? "—"}</p>
    </div>
  );
}
