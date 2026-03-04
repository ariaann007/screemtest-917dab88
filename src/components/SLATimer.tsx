import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface SLATimerProps {
  dueDate: string;
  isOverdue?: boolean;
  className?: string;
  compact?: boolean;
}

export function SLATimer({ dueDate, isOverdue, className, compact }: SLATimerProps) {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  const overdue = isOverdue || diffMs < 0;

  let label = "";
  let colorClass = "";

  if (overdue) {
    const overdueDays = Math.abs(diffDays);
    label = compact ? `${overdueDays}d overdue` : `Overdue by ${overdueDays} day${overdueDays !== 1 ? "s" : ""}`;
    colorClass = "text-destructive";
  } else if (diffDays <= 1) {
    label = compact ? `${diffHours}h left` : `${diffHours} hours remaining`;
    colorClass = "text-destructive";
  } else if (diffDays <= 3) {
    label = compact ? `${diffDays}d left` : `${diffDays} days remaining`;
    colorClass = "text-warning";
  } else if (diffDays <= 7) {
    label = compact ? `${diffDays}d left` : `${diffDays} days remaining`;
    colorClass = "text-warning";
  } else {
    label = compact ? `${diffDays}d left` : `${diffDays} days remaining`;
    colorClass = "text-muted-foreground";
  }

  const Icon = overdue || diffDays <= 3 ? AlertTriangle : Clock;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", colorClass, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
