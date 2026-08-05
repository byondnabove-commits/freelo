// features/leads/index.tsx
import { useLeads } from "./hooks/use-leads";
import { LeadsTable } from "./components/leads-table";

export default function LeadsPage() {
  const { data, isPending, isError } = useLeads();

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="h-9 w-64 animate-pulse rounded bg-slate-100" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-50" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-muted-foreground">
        Failed to load leads. Try refreshing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          {data.data.length} lead{data.data.length === 1 ? "" : "s"}
        </p>
      </div>

      <LeadsTable leads={data.data} />
    </div>
  );
}