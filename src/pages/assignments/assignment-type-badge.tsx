import { ClipboardCheck, FolderKanban, GraduationCap, NotebookPen } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ASSIGNMENT_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AssignmentType } from "@/types/records";

// EXAM is deliberately the loudest (destructive/red + a dedicated icon) so it
// stands out from routine homework in any list or grading queue — exams
// carry more weight for a teacher than a weekly assignment.
const CONFIG: Record<AssignmentType, { variant: BadgeProps["variant"]; icon: typeof NotebookPen }> = {
  HOMEWORK: { variant: "secondary", icon: NotebookPen },
  QUIZ: { variant: "warning", icon: ClipboardCheck },
  EXAM: { variant: "destructive", icon: GraduationCap },
  PROJECT: { variant: "success", icon: FolderKanban },
};

export function AssignmentTypeBadge({ type, className }: { type: AssignmentType; className?: string }) {
  const { variant, icon: Icon } = CONFIG[type];
  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <Icon className="h-3 w-3" />
      {ASSIGNMENT_TYPE_LABELS[type] ?? type}
    </Badge>
  );
}
