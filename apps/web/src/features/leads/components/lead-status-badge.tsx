import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES } from "@freelo/shared/db/schema/values.js";
import type { Lead, LeadStatus } from "../types";
import { useUpdateLeadStatus } from "../hooks/use-update-lead-status";
import { useConvertLead } from "../hooks/use-convert-lead";
import type { ConvertLeadProjectInput } from "../api/convert-lead";
import { useOrgPreferences } from "@/features/settings/hooks/use-org-preferences";
import { useUpdateOrgPreferences } from "@/features/settings/hooks/use-update-org-preferences";
import { ConvertLeadDialog } from "./convert-lead-dialog";
import {
  buildDefaultProjectName,
  guessDeadlineFromTimeline,
} from "../lib/project-template";
import { toast } from "sonner";

const STATUS_STYLES: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  qualified: "bg-violet-50 text-violet-700 border-violet-200",
  proposal_sent: "bg-cyan-50 text-cyan-700 border-cyan-200",
  negotiating: "bg-orange-50 text-orange-700 border-orange-200",
  won: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost: "bg-slate-100 text-slate-500 border-slate-200",
};

function formatStatus(status: LeadStatus) {
  return status
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

interface LeadStatusBadgeProps {
  lead: Lead;
  // See useConvertLead for the reasoning — off by default (table row
  // context), LeadDetailPage passes true explicitly.
  navigateOnConvert?: boolean;
}

export function LeadStatusBadge({
  lead,
  navigateOnConvert = false,
}: LeadStatusBadgeProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateLeadStatus();
  const { mutate: convert, isPending: isConverting } = useConvertLead(lead.id, {
    navigateOnConvert,
  });
  const { data: preferencesRes } = useOrgPreferences();
  const { mutate: updatePreferences } = useUpdateOrgPreferences();

  const isPending = isUpdatingStatus || isConverting;

  function handleValueChange(next: LeadStatus) {
    const transitioningToWon = next === "won" && lead.status !== "won";
    const notYetConverted = !lead.convertedClient;

    if (transitioningToWon && notYetConverted) {
      if (preferencesRes?.data.autoConvertLeadsOnWon) {
        // Silent path: same template logic the dialog pre-fills, just
        // applied without asking. The mutation's own onSuccess toast
        // covers user feedback — no need to duplicate it here.
        convert({
          name: buildDefaultProjectName(lead),
          description: lead.description,
          deadline: guessDeadlineFromTimeline(lead.timeline),
        });
        return;
      }

      setDialogOpen(true);
      return;
    }

    updateStatus({ leadId: lead.id, status: next });
  }

  // Dismissing the dialog without clicking a button (outside click, Escape)
  // intentionally does nothing — no status change, no conversion. The
  // Select's value is driven by `lead.status` from the query cache, which
  // hasn't changed, so it naturally reverts to showing the original status
  // with no extra code needed here.

  function handleSkip(alwaysAuto: boolean) {
    updateStatus({ leadId: lead.id, status: "won" });
    if (alwaysAuto) {
      updatePreferences(
        { autoConvertLeadsOnWon: true },
        {
          onSuccess: () =>
            toast.success("Won deals will convert automatically from now on."),
        },
      );
    }
    setDialogOpen(false);
  }

  function handleConvert(
    project: ConvertLeadProjectInput,
    alwaysAuto: boolean,
  ) {
    convert(project);
    if (alwaysAuto) {
      updatePreferences(
        { autoConvertLeadsOnWon: true },
        {
          onSuccess: () =>
            toast.success("Won deals will convert automatically from now on."),
        },
      );
    }
    setDialogOpen(false);
  }

  return (
    <>
      <Select
        value={lead.status}
        disabled={isPending}
        onValueChange={handleValueChange}
      >
        <SelectTrigger
          className={`h-7 w-[150px] rounded-full border px-3 text-xs font-medium ${STATUS_STYLES[lead.status]}`}
        >
          <SelectValue>{formatStatus(lead.status)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LEAD_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {formatStatus(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConvertLeadDialog
        lead={lead}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSkip={handleSkip}
        onConvert={handleConvert}
        isSubmitting={isConverting}
      />
    </>
  );
}
