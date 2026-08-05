// features/leads/components/columns.tsx
import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lead } from "../types";
import { LeadStatusBadge } from "./lead-status-badge";

function sortableHeader(label: string) {
  return ({ column }: { column: Column<Lead, unknown> }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
    </Button>
  );
}

export const leadColumns: ColumnDef<Lead>[] = [
  {
    accessorKey: "name",
    header: sortableHeader("Name"),
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "email",
    header: sortableHeader("Email"),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "company",
    header: sortableHeader("Company"),
    cell: ({ row }) => row.original.company ?? "—",
  },
  {
    accessorKey: "projectType",
    header: "Project type",
    cell: ({ row }) => row.original.projectType ?? "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <LeadStatusBadge leadId={row.original.id} status={row.original.status} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: sortableHeader("Submitted"),
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  },
];