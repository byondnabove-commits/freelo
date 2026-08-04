type Props = {
  field: {
    id: string;
    label: string;
    type: string;
    required: boolean;
  };
};

export function FieldCard({ field }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{field.label}</h3>

          <p className="text-sm text-muted-foreground capitalize">
            {field.type}
          </p>
        </div>

        {field.required && (
          <span className="rounded bg-slate-100 px-2 py-1 text-xs">
            Required
          </span>
        )}
      </div>
    </div>
  );
}