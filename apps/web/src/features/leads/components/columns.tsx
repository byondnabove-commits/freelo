// features/leads/components/columns.tsx
import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
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
      <Link
        to={`/dashboard/leads/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
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
    // Was <LeadStatusBadge leadId={row.original.id} status={row.original.status} />
    // — now needs the full lead for the conversion dialog's deal summary
    // and project template.
    cell: ({ row }) => <LeadStatusBadge lead={row.original} />,
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
