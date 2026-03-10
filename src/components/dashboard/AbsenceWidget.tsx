import { Link } from "react-router-dom";
import { CalendarDays, ArrowRight, UserX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ABSENCE_TODAY = [
  { label: "Annual Leave", count: 4, color: "bg-info/20 text-info", dot: "bg-info" },
  { label: "Sick Leave", count: 2, color: "bg-destructive/20 text-destructive", dot: "bg-destructive" },
  { label: "Other Leave", count: 1, color: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  { label: "Unauthorised", count: 1, color: "bg-warning/20 text-warning", dot: "bg-warning" },
];

const LEAVE_REQUESTS = [
  { name: "Maria Silva", type: "Annual Leave", dates: "12–14 Mar", status: "pending" },
  { name: "Ahmed Khan", type: "Annual Leave", dates: "15 Mar", status: "approved" },
  { name: "Kwame Mensah", type: "Sick Leave", dates: "10–11 Mar", status: "approved" },
  { name: "Fatima Yakubu", type: "Other Leave", dates: "18 Mar", status: "pending" },
];

const statusStyle: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AbsenceWidget() {
  const totalAbsent = ABSENCE_TODAY.reduce((s, a) => s + a.count, 0);

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 h-full" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
            <CalendarDays className="h-4 w-4 text-info" />
          </div>
          <h2 className="font-semibold text-sm">Absence Overview</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/leave" className="flex items-center gap-1 text-xs">
            View Calendar <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Today section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <UserX className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Absent Today</p>
          <span className="ml-auto text-xs font-bold">{totalAbsent} staff</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ABSENCE_TODAY.map(item => (
            <div key={item.label} className={cn("rounded-lg p-2.5 flex items-center gap-2", item.color)}>
              <span className={cn("h-2 w-2 rounded-full shrink-0", item.dot)} />
              <div>
                <p className="text-[10px] font-medium">{item.label}</p>
                <p className="text-lg font-bold leading-tight">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave requests this week */}
      <div className="border-t pt-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Leave Requests This Week</p>
        </div>
        <div className="space-y-1.5">
          {LEAVE_REQUESTS.map((req, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs">
              <div className="min-w-0">
                <span className="font-medium">{req.name}</span>
                <span className="text-muted-foreground"> · {req.type} · {req.dates}</span>
              </div>
              <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-semibold capitalize shrink-0", statusStyle[req.status])}>
                {req.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
