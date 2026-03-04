import { Worker } from "@/types";
import { DEMO_VISA_RULES } from "@/data/demo";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function getVisaBreach(worker: Worker): string | null {
  if (!worker.visaType || !worker.weeklyHours) return null;
  const rule = DEMO_VISA_RULES.find(r => r.visaType === worker.visaType);
  if (!rule) return null;
  if (worker.weeklyHours > rule.maxHoursPerWeek) {
    return `${worker.visaType} visa: ${worker.weeklyHours}h/week exceeds ${rule.maxHoursPerWeek}h limit`;
  }
  return null;
}

export function VisaRulesAlert({ worker }: { worker: Worker }) {
  const breach = getVisaBreach(worker);
  if (!breach) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span><strong>Visa breach:</strong> {breach}</span>
    </div>
  );
}

export function VisaBreachBadge({ worker }: { worker: Worker }) {
  const breach = getVisaBreach(worker);
  if (!breach) return null;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20")}>
      <AlertTriangle className="h-2.5 w-2.5" />
      Visa breach
    </span>
  );
}
