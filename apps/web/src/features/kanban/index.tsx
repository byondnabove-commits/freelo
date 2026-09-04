import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { PROJECT_STAGES } from "@freelo/shared/db/schema/values.js";
import { Button } from "@/components/ui/button";
import { useProjects } from "./hooks/use-projects";
import { useUpdateProjectStage } from "./hooks/use-update-project-stage";
import { KanbanColumn } from "./components/kanban-column";
import { ProjectsList } from "./components/projects-list";
import { CreateProjectDialog } from "./components/create-project-dialog";
import type { ProjectStage } from "./types";

export default function KanbanPage() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
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
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {projects.length} project{projects.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-0.5">
            <Button
              variant={view === "kanban" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <CreateProjectDialog />
        </div>
      </div>

      {view === "list" ? (
        <ProjectsList projects={projects} />
      ) : (
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
      )}
    </div>
  );
}