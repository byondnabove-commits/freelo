// features/leads/components/lead-status-badge.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUSES } from "@freelo/shared/db/schema/values.js";
import type { LeadStatus } from "../types";
import { useUpdateLeadStatus } from "../hooks/use-update-lead-status";

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

export function LeadStatusBadge({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const { mutate, isPending } = useUpdateLeadStatus();

  return (
    <Select
      value={status}
      disabled={isPending}
      onValueChange={(next) => mutate({ leadId, status: next as LeadStatus })}
    >
      <SelectTrigger
        className={`h-7 w-[150px] rounded-full border px-3 text-xs font-medium ${STATUS_STYLES[status]}`}
      >
        <SelectValue>{formatStatus(status)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LEAD_STATUSES.map((s) => (
          <SelectItem key={s} value={s} className="text-xs">
            {formatStatus(s)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}