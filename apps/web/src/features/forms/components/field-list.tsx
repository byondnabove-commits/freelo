import { FieldCard } from "./field-card";

type Props = {
  fields: {
    id: string;
    label: string;
    type: string;
    required: boolean;
  }[];
};

export function FieldList({ fields }: Props) {
  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <FieldCard
          key={field.id}
          field={field}
        />
      ))}
    </div>
  );
}