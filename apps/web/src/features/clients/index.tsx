import { useClients } from "./hooks/use-clients";
import { ClientsTable } from "./components/clients-table";

export default function ClientsPage() {
  const { data, isPending, isError } = useClients();

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
        Failed to load clients. Try refreshing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Clients</h1>
        <p className="text-sm text-muted-foreground">
          {data.data.length} client{data.data.length === 1 ? "" : "s"}
        </p>
      </div>

      <ClientsTable clients={data.data} />
    </div>
  );
}