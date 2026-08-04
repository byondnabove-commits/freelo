// modules/forms/components/renderer/FormRenderer.tsx
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import type { FormField, FormAnswers } from "../../types";

import { TextField } from "../fields/TextField";
import { TextareaField } from "../fields/TextareaField";
import { EmailField } from "../fields/EmailField";
import { PhoneField } from "../fields/PhoneField";
import { NumberField } from "../fields/NumberField";
import { UrlField } from "../fields/UrlField";
import { DateField } from "../fields/DateField";
import { SelectField } from "../fields/SelectField";
import { RadioField } from "../fields/RadioField";
import { CheckboxField } from "../fields/CheckboxField";
import { FileField } from "../fields/FileField";

type Props = {
  fields: FormField[];
  onSubmit: (answers: FormAnswers) => void;
  isSubmitting?: boolean;
};

function buildSchema(fields: FormField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "number":
        schema = z.coerce.number();
        if (field.validation?.min !== undefined) schema = (schema as z.ZodNumber).min(field.validation.min);
        if (field.validation?.max !== undefined) schema = (schema as z.ZodNumber).max(field.validation.max);
        break;

      case "checkbox":
        schema = z.boolean();
        break;

      case "email":
        schema = z.string().email({ message: "Enter a valid email" });
        break;

      case "url":
        schema = z.string().url({ message: "Enter a valid URL" });
        break;

      default:
        schema = z.string();
        if (field.validation?.minLength) schema = (schema as z.ZodString).min(field.validation.minLength);
        if (field.validation?.maxLength) schema = (schema as z.ZodString).max(field.validation.maxLength);
        if (field.validation?.pattern) {
          schema = (schema as z.ZodString).regex(new RegExp(field.validation.pattern), {
            message: "Invalid format",
          });
        }
    }

    if (field.type !== "checkbox") {
      if (!field.required) {
        schema = schema.optional().or(z.literal(""));
      } else if (schema instanceof z.ZodString) {
        schema = schema.min(1, { message: "This field is required" });
      }
    }

    shape[field.name] = schema;
  }

  return z.object(shape);
}

function buildDefaults(fields: FormField[]) {
  const defaults: FormAnswers = {};

  for (const field of fields) {
    defaults[field.name] = field.type === "checkbox" ? false : "";
  }

  return defaults;
}

export function FormRenderer({ fields, onSubmit, isSubmitting }: Props) {
  const sorted = [...fields].sort((a, b) => a.position - b.position);
  const schema = buildSchema(sorted);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: buildDefaults(sorted),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {sorted.map((field) => {
          switch (field.type) {
            case "text": return <TextField key={field.id} field={field} />;
            case "textarea": return <TextareaField key={field.id} field={field} />;
            case "email": return <EmailField key={field.id} field={field} />;
            case "phone": return <PhoneField key={field.id} field={field} />;
            case "number": return <NumberField key={field.id} field={field} />;
            case "url": return <UrlField key={field.id} field={field} />;
            case "date": return <DateField key={field.id} field={field} />;
            case "select": return <SelectField key={field.id} field={field} />;
            case "radio": return <RadioField key={field.id} field={field} />;
            case "checkbox": return <CheckboxField key={field.id} field={field} />;
            case "file": return <FileField key={field.id} field={field} />;
            default: return null;
          }
        })}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </form>
    </FormProvider>
  );
}