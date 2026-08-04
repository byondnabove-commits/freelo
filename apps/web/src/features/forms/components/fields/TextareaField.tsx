// modules/forms/components/fields/TextareaField.tsx
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormField } from "../../types";

export function TextareaField({ field }: { field: FormField }) {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[field.name]?.message as string | undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>

      <Textarea
        id={field.name}
        placeholder={field.placeholder ?? undefined}
        rows={4}
        {...register(field.name)}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}