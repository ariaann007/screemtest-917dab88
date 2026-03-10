import { Link } from "react-router-dom";
import { CheckSquare, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DemoTask {
  id: string;
  title: string;
  category: "HR" | "Compliance" | "Payroll" | "Recruitment";
  assignedTo: string;
  priority: "high" | "medium" | "low";
  dueLabel: string;
  daysUntilDue: number;
}

const DEMO_TASKS: DemoTask[] = [
  { id: "t1", title: "Approve Leave Request", category: "HR", assignedTo: "Sarah Johnson", priority: "high", dueLabel: "Due Today", daysUntilDue: 0 },
  { id: "t2", title: "Verify Right to Work – Thandiwe Phiri", category: "Compliance", assignedTo: "Mark Thompson", priority: "high", dueLabel: "Due Tomorrow", daysUntilDue: 1 },
  { id: "t3", title: "Review Salary Change – Chioma Okonkwo", category: "Payroll", assignedTo: "Sarah Johnson", priority: "medium", dueLabel: "Due in 3 days", daysUntilDue: 3 },
  { id: "t4", title: "Shortlist Candidates – Care Worker Role", category: "Recruitment", assignedTo: "Mark Thompson", priority: "medium", dueLabel: "Due in 5 days", daysUntilDue: 5 },
  { id: "t5", title: "Update CoS Records – Q1 Audit", category: "Compliance", assignedTo: "Sarah Johnson", priority: "low", dueLabel: "Due in 7 days", daysUntilDue: 7 },
  { id: "t6", title: "Process Bank Holiday Adjustments", category: "Payroll", assignedTo: "Mark Thompson", priority: "low", dueLabel: "Due in 10 days", daysUntilDue: 10 },
];

const categoryColors: Record<DemoTask["category"], string> = {
  HR: "bg-info/10 text-info",
  Compliance: "bg-primary/10 text-primary",
  Payroll: "bg-success/10 text-success",
  Recruitment: "bg-secondary/10 text-secondary",
};

const priorityColors: Record<DemoTask["priority"], string> = {
  high: "text-destructive",
  medium: "text-warning",
  low: "text-muted-foreground",
};

export function TasksWidget() {
  const urgent = DEMO_TASKS.filter(t => t.daysUntilDue <= 1);

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 h-full" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CheckSquare className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold text-sm">Tasks & Approvals</h2>
          {urgent.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-semibold border border-destructive/20">
              <AlertCircle className="h-3 w-3" /> {urgent.length} urgent
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/requests" className="flex items-center gap-1 text-xs">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="space-y-2">
        {DEMO_TASKS.map(task => (
          <div key={task.id} className={cn(
            "flex items-center gap-3 p-2.5 rounded-lg border transition-colors hover:bg-muted/30",
            task.daysUntilDue === 0 ? "border-destructive/30 bg-destructive/5" : "border-transparent bg-muted/20"
          )}>
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0 mt-0.5",
              task.priority === "high" ? "bg-destructive" : task.priority === "medium" ? "bg-warning" : "bg-muted-foreground"
            )} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{task.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{task.assignedTo}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", categoryColors[task.category])}>
                {task.category}
              </span>
              <span className={cn("text-[10px] font-semibold", priorityColors[task.priority])}>
                {task.dueLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
