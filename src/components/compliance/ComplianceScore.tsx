import { cn } from "@/lib/utils";
import { Worker } from "@/types";
import { DEMO_SOC_GOING_RATES } from "@/data/demo";

export function ragColor(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function ragBg(score: number) {
  if (score >= 80) return "bg-success/10 border-success/30";
  if (score >= 60) return "bg-warning/10 border-warning/30";
  return "bg-destructive/10 border-destructive/30";
}

export function ragStroke(score: number) {
  if (score >= 80) return "hsl(var(--success))";
  if (score >= 60) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

export function ragLabel(score: number) {
  if (score >= 80) return "Green";
  if (score >= 60) return "Amber";
  return "Red";
}

/** Calculate a worker's compliance score (0–100) */
export function calcWorkerScore(worker: Worker): number {
  const today = new Date();
  let score = 0;

  // Doc completeness (25 pts) — simplified: has passport + visa = present
  const hasPassport = !!worker.passportNumber;
  const hasVisa = !!worker.visaExpiry;
  if (hasPassport && hasVisa) score += 25;
  else if (hasPassport || hasVisa) score += 12;

  // RTW validity (25 pts)
  const passportExpiry = worker.passportExpiry ? new Date(worker.passportExpiry) : null;
  if (passportExpiry && passportExpiry > today) score += 25;
  else if (passportExpiry) score += 0;
  else score += 12; // unknown

  // Visa validity (25 pts)
  const visaExpiry = worker.visaExpiry ? new Date(worker.visaExpiry) : null;
  if (visaExpiry && visaExpiry > today) {
    const daysLeft = (visaExpiry.getTime() - today.getTime()) / 86400000;
    score += daysLeft > 90 ? 25 : daysLeft > 30 ? 15 : 5;
  }

  // Salary vs SOC going rate (25 pts)
  if (worker.socCode && worker.salary) {
    const rate = DEMO_SOC_GOING_RATES.find(r => r.socCode === worker.socCode);
    if (!rate) {
      score += 25; // no data, assume ok
    } else {
      const annualSalary = worker.salaryPeriod === "year" ? worker.salary :
        worker.salaryPeriod === "month" ? worker.salary * 12 :
        worker.salaryPeriod === "week" ? worker.salary * 52 :
        worker.salaryPeriod === "hour" ? worker.salary * (worker.weeklyHours || 37.5) * 52 : worker.salary;
      if (annualSalary >= rate.minAnnualSalary) score += 25;
      else if (annualSalary >= rate.minAnnualSalary * 0.9) score += 10;
    }
  } else {
    score += 25;
  }

  // Visa hour breach penalty: -20
  if (worker.visaType === "Student" && worker.weeklyHours && worker.weeklyHours > 20) score -= 20;
  if (worker.visaType === "Graduate" && worker.weeklyHours && worker.weeklyHours > 40) score -= 20;

  // Leaver checklist penalty
  if (worker.leaverStatus === "leaver" && worker.leaverChecklist) {
    const completed = Object.values(worker.leaverChecklist).filter(Boolean).length;
    if (completed < 4) score -= (4 - completed) * 5;
  }

  return Math.max(0, Math.min(100, score));
}

/** Circular gauge showing compliance score */
export function ScoreGauge({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={ragStroke(score)}
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className={cn("absolute text-sm font-bold", ragColor(score))}>{score}%</span>
    </div>
  );
}

export function WorkerScoreBadge({ worker }: { worker: Worker }) {
  const score = worker.complianceScore ?? calcWorkerScore(worker);
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border", ragBg(score), ragColor(score))}>
      <span className={cn("h-1.5 w-1.5 rounded-full", score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive")} />
      {score}%
    </span>
  );
}

/** Licence-level compliance score aggregated from all workers */
export function calcLicenceScore(workers: Worker[]): number {
  if (workers.length === 0) return 100;
  const scores = workers.map(w => w.complianceScore ?? calcWorkerScore(w));
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg);
}
