import { Worker, LeaverChecklist as LeaverChecklistType } from "@/types";
import { CheckCircle2, XCircle, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

function ragFromChecklist(cl: LeaverChecklistType) {
  const count = Object.values(cl).filter(Boolean).length;
  if (count === 4) return "green";
  if (count >= 2) return "amber";
  return "red";
}

function daysRemaining(retentionExpiry: string) {
  return Math.ceil((new Date(retentionExpiry).getTime() - Date.now()) / 86400000);
}

const CHECKLIST_ITEMS: { key: keyof LeaverChecklistType; label: string }[] = [
  { key: "reportingSubmitted", label: "Reporting submitted within 10 days" },
  { key: "finalPayslipUploaded", label: "Final payslip uploaded" },
  { key: "finalAttendanceUploaded", label: "Final attendance record uploaded" },
  { key: "lastContactDetailsStored", label: "Last known contact details stored" },
];

export function LeaverBanner({ worker }: { worker: Worker }) {
  if (worker.leaverStatus !== "leaver") return null;

  const checklist = worker.leaverChecklist ?? {
    reportingSubmitted: false, finalPayslipUploaded: false,
    finalAttendanceUploaded: false, lastContactDetailsStored: false,
  };
  const rag = ragFromChecklist(checklist);
  const completed = Object.values(checklist).filter(Boolean).length;
  const days = worker.retentionExpiryDate ? daysRemaining(worker.retentionExpiryDate) : null;

  return (
    <div className="space-y-3">
      {/* Lock banner */}
      <div className="flex items-center gap-2 rounded-lg border border-muted-foreground/30 bg-muted/50 p-3 text-sm font-medium">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span>This worker record is locked — Leaver</span>
        {days !== null && (
          <span className={cn("ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
            days <= 30 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
          )}>
            <Clock className="h-3 w-3 inline mr-1" />
            {days > 0 ? `${days}d retention remaining` : "Retention period expired"}
          </span>
        )}
      </div>

      {/* Compliance checklist */}
      <div className={cn("rounded-lg border p-3",
        rag === "green" ? "border-success/30 bg-success/5" :
        rag === "amber" ? "border-warning/30 bg-warning/5" :
        "border-destructive/30 bg-destructive/5"
      )}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Leaver Compliance Checklist</p>
          <span className={cn("text-xs font-bold",
            rag === "green" ? "text-success" : rag === "amber" ? "text-warning" : "text-destructive"
          )}>
            {completed}/4 complete · {rag === "green" ? "✓ All clear" : rag === "amber" ? "⚠ Action needed" : "✗ At risk"}
          </span>
        </div>
        <div className="space-y-1.5">
          {CHECKLIST_ITEMS.map(item => (
            <div key={item.key} className="flex items-center gap-2 text-sm">
              {checklist[item.key]
                ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                : <XCircle className="h-4 w-4 shrink-0 text-destructive" />
              }
              <span className={cn(checklist[item.key] ? "text-foreground" : "text-muted-foreground")}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
