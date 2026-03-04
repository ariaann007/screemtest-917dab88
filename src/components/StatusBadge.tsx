import { cn } from "@/lib/utils";
import { CaseStatus, Priority } from "@/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-muted" },
  submitted: { label: "Submitted", className: "bg-info-light text-info border-info/20" },
  in_review: { label: "In Review", className: "bg-warning-light text-warning border-warning/20" },
  awaiting_client: { label: "Awaiting Client", className: "bg-orange-50 text-orange-600 border-orange-200" },
  approved: { label: "Approved", className: "bg-success-light text-success border-success/20" },
  filed: { label: "Filed", className: "bg-success-light text-success border-success/20" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-muted" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
  open: { label: "Open", className: "bg-info-light text-info border-info/20" },
  in_progress: { label: "In Progress", className: "bg-warning-light text-warning border-warning/20" },
  waiting_on_client: { label: "Waiting on Client", className: "bg-orange-50 text-orange-600 border-orange-200" },
  resolved: { label: "Resolved", className: "bg-success-light text-success border-success/20" },
  paid: { label: "Paid", className: "bg-success-light text-success border-success/20" },
  unpaid: { label: "Unpaid", className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { label: "Pending", className: "bg-warning-light text-warning border-warning/20" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground border-muted" },
  active: { label: "Active", className: "bg-success-light text-success border-success/20" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-muted" },
};

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-info-light text-info" },
  high: { label: "High", className: "bg-warning-light text-warning" },
  urgent: { label: "Urgent", className: "bg-destructive/10 text-destructive" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border", config.className, className)}>
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}
