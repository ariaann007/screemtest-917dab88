import { Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, FileWarning, Clock, FileText, Briefcase, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreGauge, ragBg, ragColor, ragLabel, calcWorkerScore } from "@/components/compliance/ComplianceScore";
import { cn } from "@/lib/utils";
import { Worker } from "@/types";

interface Props {
  workers: Worker[];
  licenceScore: number;
}

export function ComplianceScoreWidget({ workers, licenceScore }: Props) {
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 86400000);
  const in90 = new Date(today.getTime() + 90 * 86400000);

  const activeWorkers = workers.filter(w => w.status === "active");
  const missingRtw = activeWorkers.filter(w => !w.passportNumber || !w.visaExpiry).length;
  const expiringVisas = activeWorkers.filter(w => w.visaExpiry && new Date(w.visaExpiry) > today && new Date(w.visaExpiry) < in30).length;
  const missingDocs = activeWorkers.filter(w => !w.passportExpiry).length;
  const studentBreaches = activeWorkers.filter(w => w.visaType === "Student" && (w.weeklyHours ?? 0) > 20).length;

  const issues = [
    missingRtw > 0 && { label: `${missingRtw} missing right to work document${missingRtw !== 1 ? "s" : ""}`, icon: FileWarning, color: "text-destructive" },
    expiringVisas > 0 && { label: `${expiringVisas} visa${expiringVisas !== 1 ? "s" : ""} expiring within 30 days`, icon: Clock, color: "text-warning" },
    missingDocs > 0 && { label: `${missingDocs} incomplete document record${missingDocs !== 1 ? "s" : ""}`, icon: FileText, color: "text-warning" },
    studentBreaches > 0 && { label: `${studentBreaches} student visa hour breach${studentBreaches !== 1 ? "es" : ""}`, icon: Activity, color: "text-destructive" },
  ].filter(Boolean) as { label: string; icon: React.FC<{ className?: string }>; color: string }[];

  const categories = [
    { label: "Right to Work", value: missingRtw === 0 ? 100 : Math.max(0, 100 - missingRtw * 20), icon: ShieldCheck },
    { label: "Visa Monitoring", value: expiringVisas === 0 ? 100 : Math.max(0, 100 - expiringVisas * 15), icon: Clock },
    { label: "Document Completeness", value: missingDocs === 0 ? 100 : Math.max(0, 100 - missingDocs * 10), icon: FileText },
    { label: "Sponsor Reporting", value: 95, icon: Briefcase },
    { label: "Absence Monitoring", value: studentBreaches === 0 ? 100 : 70, icon: Activity },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 h-full" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold text-sm">Compliance Score</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/people" className="flex items-center gap-1 text-xs">
            View Details <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Score */}
      <div className="flex items-center gap-5">
        <ScoreGauge score={licenceScore} size={88} />
        <div>
          <p className="text-2xl font-bold">{licenceScore}%</p>
          <p className={cn("text-sm font-semibold mt-0.5", ragColor(licenceScore))}>
            {ragLabel(licenceScore)} — {licenceScore >= 80 ? "Good Standing" : licenceScore >= 60 ? "Medium Risk" : "High Risk"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {issues.length === 0 ? "No issues detected" : `${issues.length} issue${issues.length !== 1 ? "s" : ""} detected`}
          </p>
        </div>
      </div>

      {/* Issues */}
      {issues.length > 0 && (
        <div className="space-y-1.5">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <issue.icon className={cn("h-3.5 w-3.5 shrink-0", issue.color)} />
              <span className="text-muted-foreground">{issue.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Category bars */}
      <div className="space-y-2 pt-1 border-t">
        {categories.map(cat => (
          <div key={cat.label} className="flex items-center gap-3">
            <cat.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground w-36 truncate">{cat.label}</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", cat.value >= 80 ? "bg-success" : cat.value >= 60 ? "bg-warning" : "bg-destructive")}
                style={{ width: `${cat.value}%` }}
              />
            </div>
            <span className={cn("text-xs font-medium w-8 text-right", cat.value >= 80 ? "text-success" : cat.value >= 60 ? "text-warning" : "text-destructive")}>
              {cat.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
