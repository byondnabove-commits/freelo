// modules/forms/components/fields/FileField.tsx
// Placeholder — actual upload wiring depends on your existing /api/upload route.
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormField } from "../../types";

export function FileField({ field }: { field: FormField }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>

      <Input id={field.name} type="file" disabled />

      <p className="text-xs text-muted-foreground">
        File upload not yet wired to submission — TODO
      </p>
    </div>
  );
}