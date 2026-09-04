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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Lead } from "../../../types";
import type { ConvertLeadProjectInput } from "../api/convert-lead";
import { buildDefaultProjectName, guessDeadlineFromTimeline } from "../lib/project-template";

interface ConvertLeadDialogProps {
  lead: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSkip: (alwaysAuto: boolean) => void;
  onConvert: (project: ConvertLeadProjectInput, alwaysAuto: boolean) => void;
  isSubmitting: boolean;
}

export function ConvertLeadDialog({
  lead,
  open,
  onOpenChange,
  onSkip,
  onConvert,
  isSubmitting,
}: ConvertLeadDialogProps) {
  const [name, setName] = useState(() => buildDefaultProjectName(lead));
  const [deadline, setDeadline] = useState<string | null>(() =>
    guessDeadlineFromTimeline(lead.timeline),
  );
  const [description, setDescription] = useState(lead.description ?? "");
  const [alwaysAuto, setAlwaysAuto] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mark this deal as won?</DialogTitle>
          <DialogDescription>
            Review the deal, then decide whether to convert {lead.name} to a client now.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm">
          <SummaryField label="Company" value={lead.company} />
          <SummaryField label="Project type" value={lead.projectType} />
          <SummaryField label="Budget" value={lead.budget} />
          <SummaryField label="Timeline" value={lead.timeline} />
          <div className="col-span-2">
            <SummaryField label="Original description" value={lead.description} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="convert-project-name">Project name</Label>
            <Input
              id="convert-project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="convert-project-deadline">Deadline</Label>
            <Input
              id="convert-project-deadline"
              type="date"
              value={deadline ?? ""}
              onChange={(e) => setDeadline(e.target.value || null)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="convert-project-description">Description</Label>
            <Textarea
              id="convert-project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="convert-always-auto"
            checked={alwaysAuto}
            onCheckedChange={(checked) => setAlwaysAuto(checked === true)}
          />
          <Label
            htmlFor="convert-always-auto"
            className="text-sm font-normal text-muted-foreground"
          >
            Always do this automatically — don't ask again
          </Label>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onSkip(alwaysAuto)} disabled={isSubmitting}>
            Not yet
          </Button>
          <Button
            onClick={() =>
              onConvert(
                { name: name.trim(), description: description.trim() || null, deadline },
                alwaysAuto,
              )
            }
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? "Converting..." : "Convert & create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryField({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? "—"}</p>
    </div>
  );
}