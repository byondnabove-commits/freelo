// modules/forms/components/fields/NumberField.tsx
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FormField } from "../../types";

export function NumberField({ field }: { field: FormField }) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.name]?.message as string | undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>

      <Input
        id={field.name}
        type="number"
        placeholder={field.placeholder ?? undefined}
        {...register(field.name, { valueAsNumber: true })}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}