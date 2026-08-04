// modules/forms/components/fields/CheckboxField.tsx
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormField } from "../../types";

export function CheckboxField({ field }: { field: FormField }) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.name]?.message as string | undefined;

  return (
    <div className="space-y-1.5">
      <Controller
        name={field.name}
        control={control}
        render={({ field: rhf }) => (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={rhf.value}
              onCheckedChange={rhf.onChange}
            />
            <Label htmlFor={field.name} className="font-normal">
              {field.label}
              {field.required && <span className="text-destructive"> *</span>}
            </Label>
          </div>
        )}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}