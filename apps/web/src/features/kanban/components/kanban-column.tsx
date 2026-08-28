// features/kanban/components/kanban-column.tsx
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { ProjectCard } from "./project-card";
import type { Project, ProjectStage } from "../types";

const STAGE_LABELS: Record<ProjectStage, string> = {
  inquiry: "Inquiry",
  planning: "Planning",
  active: "Active",
  review: "Review",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function KanbanColumn({
  stage,
  projects,
}: {
  stage: ProjectStage;
  projects: Project[];
}) {
  const { ref, isDropTarget } = useDroppable({
    id: stage,
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      ref={ref}
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-slate-50 p-3 transition-colors ${
        isDropTarget ? "bg-slate-100" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold">{STAGE_LABELS[stage]}</h3>
        <span className="text-xs text-muted-foreground">{projects.length}</span>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {projects.length === 0 && (
          <p className="px-1 text-xs text-muted-foreground">No projects</p>
        )}
      </div>
    </div>
  );
}