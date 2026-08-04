// modules/forms/components/fields/RadioField.tsx
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { FormField } from "../../types";

export function RadioField({ field }: { field: FormField }) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[field.name]?.message as string | undefined;

  return (
    <div className="space-y-1.5">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive"> *</span>}
      </Label>

      <Controller
        name={field.name}
        control={control}
        render={({ field: rhf }) => (
          <RadioGroup onValueChange={rhf.onChange} value={rhf.value}>
            {field.fieldOptions?.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${field.name}-${opt.value}`} />
                <Label htmlFor={`${field.name}-${opt.value}`} className="font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}