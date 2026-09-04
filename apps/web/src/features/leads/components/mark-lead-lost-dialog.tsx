import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LEAD_LOST_REASONS } from "@freelo/shared/db/schema/values.js";
import type { Lead, LeadLostReason } from "../types";

const LOST_REASON_LABELS: Record<LeadLostReason, string> = {
  budget_too_low: "Budget too low",
  chose_other_freelancer: "Chose another freelancer/agency",
  timeline_mismatch: "Timeline mismatch",
  went_unresponsive: "Went unresponsive",
  not_right_fit: "Not the right fit",
  other: "Other",
};

interface MarkLeadLostDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: LeadLostReason) => void;
  isSubmitting: boolean;
}

export function MarkLeadLostDialog({
  lead,
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: MarkLeadLostDialogProps) {
  // No default selection — the freelancer must actively pick a reason,
  // not just accept whatever happens to be first in the list.
  const [reason, setReason] = useState<LeadLostReason | "">("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark this deal as lost?</DialogTitle>
          <DialogDescription>
            Tracking why {lead.name} didn't convert helps you spot patterns later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="lost-reason">Reason</Label>
          <Select value={reason} onValueChange={(v) => setReason(v as LeadLostReason)}>
            <SelectTrigger id="lost-reason">
              <SelectValue placeholder="Select a reason..." />
            </SelectTrigger>
            <SelectContent>
              {LEAD_LOST_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {LOST_REASON_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => reason && onConfirm(reason)}
            disabled={isSubmitting || !reason}
          >
            {isSubmitting ? "Saving..." : "Mark as lost"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}