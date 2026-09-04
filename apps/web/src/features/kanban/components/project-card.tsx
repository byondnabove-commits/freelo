// features/kanban/components/project-card.tsx
import { useDraggable } from "@dnd-kit/react";
import { Card, CardContent } from "@/components/ui/card";
import { useClients } from "@/features/clients/hooks/use-clients";
import type { Project } from "../types";

function getDeadlineColor(deadline: string | null): string {
  if (!deadline) return "";
  const days = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return "text-red-600"; // overdue
  if (days <= 7) return "text-amber-600"; // due soon
  return "text-emerald-600"; // comfortable
}

export function ProjectCard({ project }: { project: Project }) {
  const { ref, isDragging } = useDraggable({ id: project.id });
  const { data: clientsData } = useClients();

  const client = clientsData?.data.find((c) => c.id === project.clientId);

  return (
    <Card
      ref={ref}
      className="cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <CardContent className="p-3 space-y-1">
        <p className="text-sm font-medium">{project.name}</p>
        {client && (
          <p className="text-xs text-muted-foreground">{client.name}</p>
        )}
        {project.deadline && (
          <p className={`text-xs ${getDeadlineColor(project.deadline)}`}>
            Due {new Date(project.deadline).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
