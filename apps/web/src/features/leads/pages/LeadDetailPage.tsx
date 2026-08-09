import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLead } from "../hooks/use-lead";
import { useUpdateLeadNotes } from "../hooks/use-update-lead-notes";
import { useConvertLead } from "../hooks/use-convert-lead";
import { LeadStatusBadge } from "../components/lead-status-badge";
import { NotesEditor } from "../components/notes-editor";

export default function LeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const { data, isPending, isError } = useLead(leadId!);
  const { mutate: saveNotes, isPending: isSaving } = useUpdateLeadNotes(
    leadId!,
  );
  const { mutate: convert, isPending: isConverting } = useConvertLead(leadId!);

  if (isPending)
    return <div className="animate-pulse h-64 rounded-xl bg-slate-50" />;
  if (isError || !data?.data) {
    return <div className="text-muted-foreground">Lead not found.</div>;
  }

  const lead = data.data;
  const alreadyClient = lead.status === "won";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{lead.name}</h1>
          <p className="text-sm text-muted-foreground">{lead.email}</p>
        </div>
        <LeadStatusBadge leadId={lead.id} status={lead.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Company" value={lead.company} />
          <Field label="Phone" value={lead.phone} />
          <Field label="Project type" value={lead.projectType} />
          <Field label="Budget" value={lead.budget} />
          <Field label="Timeline" value={lead.timeline} />
          <div className="col-span-2">
            <Field label="Description" value={lead.description} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* key forces a remount (fresh initial state) if you ever
              navigate lead A -> lead B without unmounting the route */}
          <NotesEditor
            key={lead.id}
            initialNotes={lead.notes}
            onSave={saveNotes}
            isSaving={isSaving}
          />
        </CardContent>
      </Card>

      <Button
        onClick={() => convert()}
        disabled={isConverting || alreadyClient}
      >
        {alreadyClient
          ? "Already converted"
          : isConverting
            ? "Converting..."
            : "Convert to client"}
      </Button>
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
