import { DragDropProvider } from "@dnd-kit/react";
import { PROJECT_STAGES } from "@freelo/shared/db/schema/values.js";
import { useProjects } from "./hooks/use-projects";
import { useUpdateProjectStage } from "./hooks/use-update-project-stage";
import { KanbanColumn } from "./components/kanban-column";
import { CreateProjectDialog } from "./components/create-project-dialog";
import type { ProjectStage } from "./types";

export default function KanbanPage() {
  const { data, isPending, isError } = useProjects();
  const { mutate: moveProject } = useUpdateProjectStage();

  if (isPending) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-50" />;
  }

  if (isError) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-muted-foreground">
        Failed to load projects.
      </div>
    );
  }

  const projects = data.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Kanban</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;

          const projectId = event.operation.source?.id;
          const targetStage = event.operation.target?.id as ProjectStage | undefined;

          if (!projectId || !targetStage) return;

          const project = projects.find((p) => p.id === projectId);
          if (!project || project.stage === targetStage) return;

          moveProject({ projectId: String(projectId), stage: targetStage });
        }}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PROJECT_STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              projects={projects.filter((p) => p.stage === stage)}
            />
          ))}
        </div>
      </DragDropProvider>
    </div>
  );
}