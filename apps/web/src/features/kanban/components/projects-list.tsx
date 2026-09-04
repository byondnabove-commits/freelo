// features/kanban/components/projects-list.tsx
import { Link } from "react-router-dom";
import { useClients } from "@/features/clients/hooks/use-clients";
import type { Project } from "../types";

const STAGE_LABELS: Record<string, string> = {
  inquiry: "Inquiry",
  planning: "Planning",
  active: "Active",
  review: "Review",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ProjectsList({ projects }: { projects: Project[] }) {
  const { data: clientsData } = useClients();

  return (
    <div className="rounded-xl border bg-white divide-y">
      {projects.map((project) => {
        const client = clientsData?.data.find((c) => c.id === project.clientId);

        return (
          <Link
            key={project.id}
            to={`/dashboard/projects/${project.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-medium">{project.name}</p>
              <p className="text-xs text-muted-foreground">{client?.name ?? "—"}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="rounded-full border px-2 py-0.5">
                {STAGE_LABELS[project.stage]}
              </span>
              {project.deadline && (
                <span>{new Date(project.deadline).toLocaleDateString()}</span>
              )}
            </div>
          </Link>
        );
      })}

      {projects.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          No projects yet.
        </p>
      )}
    </div>
  );
}