import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  initialNotes: string | null;
  onSave: (notes: string | null) => void;
  isSaving: boolean;
};

export function NotesEditor({ initialNotes, onSave, isSaving }: Props) {
  // Initialized once, from the prop, at mount time — no effect needed.
  // The parent guarantees this only mounts once `data` is actually loaded.
  const [notes, setNotes] = useState(initialNotes ?? "");

  return (
    <div className="space-y-3">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
        placeholder="Internal notes..."
      />
      <Button size="sm" onClick={() => onSave(notes || null)} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save notes"}
      </Button>
    </div>
  );
}