import { useDraggable } from "@dnd-kit/react";
import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "../types";

export function ProjectCard({ project }: { project: Project }) {
  const { ref, isDragging } = useDraggable({ id: project.id });

  return (
    <Card
      ref={ref}
      className="cursor-grab active:cursor-grabbing"
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <CardContent className="p-3 space-y-1">
        <p className="text-sm font-medium">{project.name}</p>
        {project.deadline && (
          <p className="text-xs text-muted-foreground">
            Due {new Date(project.deadline).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}