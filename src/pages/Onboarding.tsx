import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserCheck, AlertTriangle, FileX, Clock, CheckCircle2,
  Search, ArrowRight, TrendingUp, UserPlus, Shield, Briefcase,
  FileText, Filter, PauseCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DEMO_ONBOARDING_CASES } from "@/data/onboarding-demo";
import { OnboardingCase, OnboardingStatus, WorkerType } from "@/types/onboarding";
import { cn } from "@/lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OnboardingStatus, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  new: { label: "New", color: "bg-primary/10 text-primary border-primary/20", icon: UserPlus },
  in_progress: { label: "In Progress", color: "bg-warning/10 text-warning border-warning/20", icon: TrendingUp },
  waiting_documents: { label: "Waiting Documents", color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300", icon: FileText },
  compliance_review: { label: "Compliance Review", color: "bg-secondary/10 text-secondary border-secondary/20", icon: Shield },
  ready_to_start: { label: "Ready to Start", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  on_hold: { label: "On Hold", color: "bg-destructive/10 text-destructive border-destructive/20", icon: PauseCircle },
};

const WORKER_TYPE_LABELS: Record<WorkerType, string> = {
  uk_irish: "UK / Irish Citizen",
  ilr_settled: "ILR / Settled",
  non_sponsored_visa: "Non-Sponsored Visa",
  student_visa: "Student Visa",
  sponsored_worker: "Sponsored Worker",
  requires_sponsorship: "Requires Sponsorship",
  custom: "Custom",
};

const WORKER_TYPE_COLORS: Record<WorkerType, string> = {
  uk_irish: "bg-success/10 text-success border-success/20",
  ilr_settled: "bg-success/10 text-success border-success/20",
  non_sponsored_visa: "bg-warning/10 text-warning border-warning/20",
  student_visa: "bg-primary/10 text-primary border-primary/20",
  sponsored_worker: "bg-secondary/10 text-secondary border-secondary/20",
  custom: "bg-muted text-muted-foreground border-border",
};

function initials(given: string, family: string) {
  return `${given[0] ?? ""}${family[0] ?? ""}`.toUpperCase();
}

function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.FC<{ className?: string }>; label: string; value: number | string; sub?: string; color: string }) {
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="p-4 flex items-start gap-3">
        <div className={cn("rounded-lg p-2.5 shrink-0", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Onboarding Case Row ────────────────────────────────────────────────────────
function CaseRow({ c, onClick }: { c: OnboardingCase; onClick: () => void }) {
  const cfg = STATUS_CONFIG[c.status];
  const StatusIcon = cfg.icon;
  const days = daysUntil(c.startDate);

  return (
    <tr
      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Candidate */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
            {initials(c.givenName, c.familyName)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{c.givenName} {c.familyName}</p>
            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
          </div>
        </div>
      </td>
      {/* Role */}
      <td className="py-3 px-4 hidden md:table-cell">
        <p className="text-sm font-medium truncate">{c.appliedRole}</p>
        <p className="text-xs text-muted-foreground">{c.department}</p>
      </td>
      {/* Worker Type */}
      <td className="py-3 px-4 hidden lg:table-cell">
        {c.workerType ? (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", WORKER_TYPE_COLORS[c.workerType])}>
            {WORKER_TYPE_LABELS[c.workerType]}
          </span>
        ) : <span className="text-muted-foreground text-xs">—</span>}
      </td>
      {/* Start Date */}
      <td className="py-3 px-4 hidden xl:table-cell">
        <p className="text-sm">{formatDate(c.startDate)}</p>
        {days !== null && (
          <p className={cn("text-xs", days < 7 ? "text-destructive" : days < 14 ? "text-warning" : "text-muted-foreground")}>
            {days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`}
          </p>
        )}
      </td>
      {/* Progress */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2 min-w-[100px]">
          <Progress value={c.onboardingProgress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground w-8 text-right">{c.onboardingProgress}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{c.currentStage}</p>
      </td>
      {/* Status */}
      <td className="py-3 px-4">
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.color)}>
          <StatusIcon className="h-3 w-3" />
          {cfg.label}
        </span>
      </td>
      {/* Action */}
      <td className="py-3 px-4">
        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
          Open <ArrowRight className="h-3 w-3" />
        </Button>
      </td>
    </tr>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { currentTenant } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OnboardingStatus | "all">("all");

  const cases = DEMO_ONBOARDING_CASES.filter(c => c.tenantId === currentTenant?.id);

  const filtered = cases.filter(c => {
    const matchSearch =
      !search ||
      `${c.givenName} ${c.familyName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.appliedRole.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Stats
  const total = cases.length;
  const sponsored = cases.filter(c => c.requiresSponsorship || c.workerType === "sponsored_worker").length;
  const nonSponsored = total - sponsored;
  const pendingRTW = cases.filter(c => c.checks.some(ch => ch.name.toLowerCase().includes("right to work") && ch.status !== "approved")).length;
  const missingDocs = cases.filter(c => c.documents.some(d => d.mandatory && d.verificationStatus === "not_uploaded")).length;
  const refsPending = cases.filter(c => c.references.some(r => r.status === "pending" || r.status === "requested")).length;
  const complianceReview = cases.filter(c => c.status === "compliance_review").length;
  const readyToStart = cases.filter(c => c.status === "ready_to_start").length;
  const overdue = cases.filter(c => {
    const days = daysUntil(c.startDate);
    return days !== null && days < 0 && c.status !== "completed";
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground text-sm">
            Manage pre-start checks, documents, and compliance for new starters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/recruitment")}>
            <Briefcase className="h-4 w-4 mr-1.5" />
            View Recruitment
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Add Manually
          </Button>
        </div>
      </div>

      {/* Workflow Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <span className="font-semibold text-primary">Workflow:</span>
            {["Recruitment", "Offer Made", "Onboarding", "Pre-Start Checks", "Ready to Start", "People"].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded text-xs font-medium", step === "Onboarding" ? "bg-primary text-primary-foreground" : "bg-background border")}>
                  {step}
                </span>
                {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <StatCard icon={Users} label="Total in Onboarding" value={total} color="bg-primary/10 text-primary" />
        <StatCard icon={Shield} label="Sponsored Workers" value={sponsored} color="bg-secondary/10 text-secondary" />
        <StatCard icon={UserCheck} label="Non-Sponsored" value={nonSponsored} color="bg-success/10 text-success" />
        <StatCard icon={FileX} label="Missing Documents" value={missingDocs} color="bg-destructive/10 text-destructive" />
        <StatCard icon={AlertTriangle} label="Pending RTW Checks" value={pendingRTW} color="bg-warning/10 text-warning" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="References Pending" value={refsPending} color="bg-warning/10 text-warning" />
        <StatCard icon={Shield} label="Compliance Review" value={complianceReview} color="bg-secondary/10 text-secondary" />
        <StatCard icon={CheckCircle2} label="Ready to Start" value={readyToStart} color="bg-success/10 text-success" />
        <StatCard icon={AlertTriangle} label="Overdue Cases" value={overdue} color="bg-destructive/10 text-destructive" />
      </div>

      {/* Case List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Onboarding Cases ({filtered.length})
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-sm"
                  placeholder="Search candidates…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  className="text-xs border rounded px-2 py-1.5 bg-background text-foreground h-8"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as OnboardingStatus | "all")}
                >
                  <option value="all">All Statuses</option>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">Candidate</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground hidden md:table-cell">Role / Dept</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Worker Type</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground hidden xl:table-cell">Start Date</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">Progress</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="py-2.5 px-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">No onboarding cases found.</td></tr>
                ) : (
                  filtered.map(c => (
                    <CaseRow
                      key={c.id}
                      c={c}
                      onClick={() => navigate(`/onboarding/${c.id}`)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
