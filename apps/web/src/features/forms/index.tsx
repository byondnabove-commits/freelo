import { FormHeader } from "@/features/forms/components/form-header";
import { FieldList } from "@/features/forms/components/field-list";
import { useDefaultForm } from "@/features/forms/hooks/use-default-form";

export default function Forms() {
  const { data, isPending, isError } = useDefaultForm();

  if (isPending) return <div>Loading...</div>;
  if (isError || !data?.data) return <div>Something went wrong.</div>;

  const form = data.data;

  return (
    <div className="space-y-6">
      <FormHeader form={form} />

      <FieldList fields={form.fields} />
    </div>
  );
}
