import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const POSITIVE = new Set(["ACTIVE", "PRESENT", "PAID", "GRADED", "SUBMITTED", "EXCELLENT", "GOOD"]);
const NEGATIVE = new Set(["BLOCKED", "EXPELLED", "ABSENT", "CANCELLED", "CRITICAL", "REMOVED"]);
const WARNING = new Set(["LATE", "PARTIAL", "PENDING", "INACTIVE", "POOR"]);

const LABELS: Record<string, string> = {
  ACTIVE: "Faol",
  INACTIVE: "Nofaol",
  BLOCKED: "Bloklangan",
  GRADUATED: "Bitirgan",
  EXPELLED: "Chetlashtirilgan",
  PRESENT: "Keldi",
  ABSENT: "Kelmadi",
  LATE: "Kechikdi",
  EXCUSED: "Sababli",
  PAID: "To'langan",
  PENDING: "Kutilmoqda",
  PARTIAL: "Qisman",
  CANCELLED: "Bekor qilingan",
  SUBMITTED: "Topshirildi",
  GRADED: "Baholandi",
  REMOVED: "O'chirilgan",
  EXCELLENT: "A'lo",
  GOOD: "Yaxshi",
  AVERAGE: "O'rtacha",
  POOR: "Past",
  CRITICAL: "Tanqidiy",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = POSITIVE.has(status) ? "success" : NEGATIVE.has(status) ? "destructive" : WARNING.has(status) ? "warning" : "secondary";
  return (
    <Badge variant={variant} className={cn(className)}>
      {LABELS[status] ?? status}
    </Badge>
  );
}
