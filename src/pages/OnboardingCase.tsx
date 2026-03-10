import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, User, CheckCircle2, XCircle, AlertTriangle, Clock,
  FileText, Upload, Shield, Activity, Settings2, BookOpen,
  Users, Mail, Phone, MapPin, Briefcase, Calendar, ChevronRight,
  RefreshCw, UserCheck, AlertCircle, PauseCircle, TrendingUp,
  FileCheck, Eye, Send, UserPlus,
} from "lucide-react";
import { DEMO_ONBOARDING_CASES } from "@/data/onboarding-demo";
import {
  OnboardingCase, OnboardingStatus, WorkerType,
  CheckStatus, EligibilityDecision, ComplianceDecision, ReferenceStatus,
} from "@/types/onboarding";

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OnboardingStatus, { label: string; color: string }> = {
  new: { label: "New", color: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "In Progress", color: "bg-warning/10 text-warning border-warning/20" },
  waiting_documents: { label: "Waiting Documents", color: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300" },
  compliance_review: { label: "Compliance Review", color: "bg-secondary/10 text-secondary border-secondary/20" },
  ready_to_start: { label: "Ready to Start", color: "bg-success/10 text-success border-success/20" },
  completed: { label: "Completed", color: "bg-muted text-muted-foreground border-border" },
  on_hold: { label: "On Hold", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const WORKER_TYPE_LABELS: Record<WorkerType, string> = {
  uk_irish: "UK / Irish Citizen",
  ilr_settled: "ILR / Settled",
  non_sponsored_visa: "Non-Sponsored Visa",
  student_visa: "Student Visa",
  sponsored_worker: "Sponsored Worker",
  custom: "Custom",
};

const CHECK_STATUS_CONFIG: Record<CheckStatus, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  not_started: { label: "Not Started", color: "bg-muted text-muted-foreground border-border", icon: Clock },
  pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  received: { label: "Received", color: "bg-primary/10 text-primary border-primary/20", icon: FileCheck },
  under_review: { label: "Under Review", color: "bg-secondary/10 text-secondary border-secondary/20", icon: Eye },
  approved: { label: "Approved", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  waived: { label: "Waived", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
};

const REF_STATUS_CONFIG: Record<ReferenceStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground border-border" },
  requested: { label: "Requested", color: "bg-warning/10 text-warning border-warning/20" },
  received: { label: "Received", color: "bg-primary/10 text-primary border-primary/20" },
  verified: { label: "Verified", color: "bg-success/10 text-success border-success/20" },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20" },
};

const DOC_STATUS_CONFIG = {
  not_uploaded: { label: "Not Uploaded", color: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertCircle },
  pending: { label: "Pending Review", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  verified: { label: "Verified", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
} as const;

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function daysUntil(s?: string) {
  if (!s) return null;
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86400000);
}

function initials(given: string, family: string) {
  return `${given[0] ?? ""}${family[0] ?? ""}`.toUpperCase();
}

// ── Eligibility badge helper ──────────────────────────────────────────────────
function EligBadge({ d }: { d: EligibilityDecision }) {
  const map: Record<EligibilityDecision, { label: string; color: string }> = {
    eligible: { label: "Eligible", color: "bg-success/10 text-success border-success/20" },
    eligible_with_conditions: { label: "Eligible with Conditions", color: "bg-warning/10 text-warning border-warning/20" },
    not_eligible: { label: "Not Eligible", color: "bg-destructive/10 text-destructive border-destructive/20" },
    pending: { label: "Pending Review", color: "bg-muted text-muted-foreground border-border" },
  };
  const cfg = map[d];
  return <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.color)}>{cfg.label}</span>;
}

function CompBadge({ d }: { d: ComplianceDecision }) {
  const map: Record<ComplianceDecision, { label: string; color: string }> = {
    cleared: { label: "Cleared to Start", color: "bg-success/10 text-success border-success/20" },
    cleared_with_conditions: { label: "Cleared with Conditions", color: "bg-warning/10 text-warning border-warning/20" },
    not_cleared: { label: "Not Cleared", color: "bg-destructive/10 text-destructive border-destructive/20" },
    pending: { label: "Pending Review", color: "bg-muted text-muted-foreground border-border" },
  };
  const cfg = map[d];
  return <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border", cfg.color)}>{cfg.label}</span>;
}

// ── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-2 py-2 border-b last:border-0", className)}>
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      {action}
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ c }: { c: OnboardingCase }) {
  const approvedChecks = c.checks.filter(ch => ch.status === "approved").length;
  const mandatoryDocs = c.documents.filter(d => d.mandatory);
  const uploadedMandatoryDocs = mandatoryDocs.filter(d => d.verificationStatus !== "not_uploaded").length;
  const verifiedRefs = c.references.filter(r => r.status === "verified").length;

  const sections = [
    { label: "Eligibility", status: c.eligibilityDecision !== "pending" ? "done" : "pending", detail: c.eligibilityDecision === "pending" ? "Not reviewed" : WORKER_TYPE_LABELS[c.workerType ?? "uk_irish"] },
    { label: "Documents", status: uploadedMandatoryDocs === mandatoryDocs.length ? "done" : "pending", detail: `${uploadedMandatoryDocs} / ${mandatoryDocs.length} mandatory uploaded` },
    { label: "Checks", status: approvedChecks === c.checks.filter(ch => ch.mandatory).length ? "done" : "pending", detail: `${approvedChecks} / ${c.checks.filter(ch => ch.mandatory).length} approved` },
    { label: "References", status: verifiedRefs >= 1 ? "done" : "pending", detail: `${verifiedRefs} / ${c.references.length} verified` },
    { label: "Compliance Review", status: c.complianceDecision !== "pending" ? "done" : "pending", detail: c.complianceDecision === "pending" ? "Awaiting" : "Reviewed" },
    { label: "Contract & Policies", status: c.contractSigned && c.handbookAcknowledged ? "done" : "pending", detail: c.contractSigned ? "Contract signed" : "Contract not signed" },
  ];

  return (
    <div className="space-y-5">
      {/* Progress Stages */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Onboarding Stages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sections.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={cn("h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                  s.status === "done" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                  {s.status === "done" ? <CheckCircle2 className="h-4 w-4" /> : <span>{i + 1}</span>}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Candidate Details</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <InfoRow label="Full Name" value={`${c.givenName} ${c.familyName}`} />
            <InfoRow label="Email" value={c.email} />
            <InfoRow label="Phone" value={c.phone} />
            <InfoRow label="Nationality" value={c.nationality} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Role & Employment</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <InfoRow label="Role" value={c.appliedRole} />
            <InfoRow label="Department" value={c.department} />
            <InfoRow label="Location" value={c.location} />
            <InfoRow label="Employment Type" value={c.employmentType} />
            <InfoRow label="Salary Offered" value={c.salaryOffered ? `£${c.salaryOffered.toLocaleString()} p/a` : undefined} />
            <InfoRow label="Proposed Start" value={formatDate(c.startDate)} />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(c.documents.some(d => d.mandatory && d.verificationStatus === "not_uploaded") ||
        c.checks.some(ch => ch.status === "pending" || ch.status === "not_started") ||
        c.references.some(r => r.status === "pending")) && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" /> Outstanding Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {c.documents.filter(d => d.mandatory && d.verificationStatus === "not_uploaded").map(d => (
                <li key={d.id} className="flex items-center gap-2 text-xs">
                  <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  <span>Missing mandatory document: <strong>{d.name}</strong></span>
                </li>
              ))}
              {c.checks.filter(ch => ch.mandatory && ch.status === "not_started").map(ch => (
                <li key={ch.id} className="flex items-center gap-2 text-xs">
                  <Clock className="h-3.5 w-3.5 text-warning shrink-0" />
                  <span>Check not started: <strong>{ch.name}</strong></span>
                </li>
              ))}
              {c.references.filter(r => r.status === "pending").map(r => (
                <li key={r.id} className="flex items-center gap-2 text-xs">
                  <Send className="h-3.5 w-3.5 text-warning shrink-0" />
                  <span>Reference request not sent: <strong>{r.refereeName || "Unnamed referee"}</strong></span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Eligibility Tab ───────────────────────────────────────────────────────────
function EligibilityTab({ c }: { c: OnboardingCase }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Eligibility Status</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Decision</span>
            <EligBadge d={c.eligibilityDecision} />
          </div>
          {c.eligibilityNotes && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              {c.eligibilityNotes}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Worker Classification</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <InfoRow label="Worker Type" value={c.workerType ? WORKER_TYPE_LABELS[c.workerType] : "Not set"} />
          <InfoRow label="Right to Work" value={c.rightToWork === "yes_unrestricted" ? "Yes – Unrestricted" : c.rightToWork === "yes_visa" ? "Yes – Visa Required" : c.rightToWork === "requires_sponsorship" ? "Requires Sponsorship" : c.rightToWork} />
          <InfoRow label="Requires Sponsorship" value={c.requiresSponsorship ? "Yes" : "No"} />
          {c.visaType && <InfoRow label="Visa Type" value={c.visaType} />}
          {c.cosReference && <InfoRow label="CoS Reference" value={c.cosReference} />}
          {c.workRestrictions && <InfoRow label="Work Restrictions" value={c.workRestrictions} />}
          {c.requiresSponsorship && <InfoRow label="Salary Threshold Met" value={c.salaryThresholdMet ? "Yes" : "No — Review Required"} />}
        </CardContent>
      </Card>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Update Decision
        </Button>
        <Button variant="outline" size="sm">
          <FileText className="h-3.5 w-3.5 mr-1.5" /> Add Note
        </Button>
      </div>
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab({ c }: { c: OnboardingCase }) {
  const categories = [...new Set(c.documents.map(d => d.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {c.documents.filter(d => d.verificationStatus !== "not_uploaded").length} of {c.documents.length} documents uploaded
          &nbsp;·&nbsp;
          {c.documents.filter(d => d.mandatory && d.verificationStatus === "not_uploaded").length} mandatory missing
        </p>
        <Button size="sm">
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Document
        </Button>
      </div>
      {categories.map(cat => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {c.documents.filter(d => d.category === cat).map(doc => {
                const cfg = DOC_STATUS_CONFIG[doc.verificationStatus];
                const DocIcon = cfg.icon;
                return (
                  <div key={doc.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-medium">{doc.name}</span>
                          {doc.mandatory && <span className="text-xs text-destructive font-medium">*Required</span>}
                        </div>
                        {doc.fileName && <p className="text-xs text-muted-foreground mt-0.5">{doc.fileName}</p>}
                        {doc.uploadedAt && <p className="text-xs text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)} by {doc.uploadedBy}</p>}
                        {doc.expiryDate && <p className="text-xs text-muted-foreground">Expires: {formatDate(doc.expiryDate)}</p>}
                        {doc.notes && <p className="text-xs text-muted-foreground italic">{doc.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border", cfg.color)}>
                        <DocIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                      {doc.verificationStatus === "not_uploaded" ? (
                        <Button size="sm" variant="outline" className="h-6 text-xs px-2">
                          <Upload className="h-3 w-3 mr-1" /> Upload
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="h-6 text-xs px-2">
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Checks Tab ────────────────────────────────────────────────────────────────
function ChecksTab({ c }: { c: OnboardingCase }) {
  const categories = [...new Set(c.checks.map(ch => ch.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {c.checks.filter(ch => ch.status === "approved" || ch.status === "waived").length} of {c.checks.length} checks completed
        </p>
        <Button size="sm" variant="outline">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Mark Check Complete
        </Button>
      </div>
      {categories.map(cat => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {c.checks.filter(ch => ch.category === cat).map(check => {
                const cfg = CHECK_STATUS_CONFIG[check.status];
                const ChkIcon = cfg.icon;
                return (
                  <div key={check.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", cfg.color.replace("border-", "").split(" ")[0])}>
                        <ChkIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium">{check.name}</span>
                          {check.mandatory && <span className="text-xs text-destructive">*</span>}
                        </div>
                        {check.dueDate && <p className="text-xs text-muted-foreground">Due: {formatDate(check.dueDate)}</p>}
                        {check.assignedTo && <p className="text-xs text-muted-foreground">Assigned: {check.assignedTo}</p>}
                        {check.completedAt && <p className="text-xs text-muted-foreground">Completed: {formatDate(check.completedAt)} by {check.completedBy}</p>}
                        {check.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{check.notes}</p>}
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shrink-0", cfg.color)}>
                      <ChkIcon className="h-3 w-3" />{cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── References Tab ────────────────────────────────────────────────────────────
function ReferencesTab({ c }: { c: OnboardingCase }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {c.references.filter(r => r.status === "verified").length} of {c.references.length} references verified
        </p>
        <Button size="sm">
          <Users className="h-3.5 w-3.5 mr-1.5" /> Add Referee
        </Button>
      </div>
      {c.references.map(ref => {
        const cfg = REF_STATUS_CONFIG[ref.status];
        return (
          <Card key={ref.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{ref.refereeName || "Referee not added"}</p>
                    {ref.refereeTitle && <p className="text-xs text-muted-foreground">{ref.refereeTitle}{ref.refereeOrganisation ? `, ${ref.refereeOrganisation}` : ""}</p>}
                    {ref.refereeEmail && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3" /> {ref.refereeEmail}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground capitalize">{ref.type} reference</span>
                      {ref.requestDate && <span className="text-xs text-muted-foreground">Requested: {formatDate(ref.requestDate)}</span>}
                      {ref.responseDate && <span className="text-xs text-muted-foreground">Received: {formatDate(ref.responseDate)}</span>}
                    </div>
                    {ref.notes && <p className="text-xs mt-1 text-muted-foreground italic">{ref.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cfg.color)}>
                    {cfg.label}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Send className="h-3 w-3 mr-1" />
                    {ref.status === "pending" ? "Request" : "Chase"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Compliance Review Tab ─────────────────────────────────────────────────────
function ComplianceReviewTab({ c }: { c: OnboardingCase }) {
  const checks = [
    { label: "Right to Work Completed", done: c.checks.some(ch => ch.name.toLowerCase().includes("right to work") && ch.status === "approved") },
    { label: "Identity Verified", done: c.checks.some(ch => ch.name.toLowerCase().includes("identity") && ch.status === "approved") },
    { label: "All Mandatory Documents Uploaded", done: !c.documents.some(d => d.mandatory && d.verificationStatus === "not_uploaded") },
    { label: "References Verified", done: c.references.some(r => r.status === "verified") },
    { label: "DBS / Background Check Completed", done: c.checks.some(ch => ch.name.toLowerCase().includes("dbs") && ch.status === "approved") },
    ...(c.requiresSponsorship ? [
      { label: "Sponsorship Eligibility Reviewed", done: c.checks.some(ch => ch.name.toLowerCase().includes("sponsor") && ch.status === "approved") },
      { label: "Salary Threshold Confirmed", done: c.salaryThresholdMet === true },
    ] : []),
    { label: "Contract Signed", done: c.contractSigned === true },
    { label: "Policies Acknowledged", done: c.handbookAcknowledged === true },
  ];

  const allClear = checks.every(ch => ch.done);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            Compliance Checklist
            <CompBadge d={c.complianceDecision} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checks.map((ch, i) => (
              <div key={i} className={cn("flex items-center gap-3 p-2 rounded", ch.done ? "bg-success/5" : "bg-destructive/5")}>
                {ch.done
                  ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  : <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                <span className="text-sm">{ch.label}</span>
                <span className={cn("ml-auto text-xs font-medium", ch.done ? "text-success" : "text-destructive")}>
                  {ch.done ? "Complete" : "Incomplete"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {c.complianceNotes && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Compliance Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{c.complianceNotes}</p></CardContent>
        </Card>
      )}
      <div className="flex gap-2">
        <Button className="flex-1" disabled={!allClear} variant={allClear ? "default" : "outline"}>
          <Shield className="h-4 w-4 mr-1.5" />
          {allClear ? "Clear to Start" : "Complete All Items First"}
        </Button>
        <Button variant="outline">
          <AlertTriangle className="h-4 w-4 mr-1.5" />
          Clear with Conditions
        </Button>
      </div>
    </div>
  );
}

// ── Contract & Policies Tab ───────────────────────────────────────────────────
function ContractTab({ c }: { c: OnboardingCase }) {
  const items = [
    { label: "Offer Letter Accepted", done: c.offerAccepted, key: "offerAccepted" },
    { label: "Employment Contract Uploaded", done: c.contractUploaded, key: "contractUploaded" },
    { label: "Contract Signed", done: c.contractSigned, key: "contractSigned" },
    { label: "Staff Handbook Acknowledged", done: c.handbookAcknowledged, key: "handbookAcknowledged" },
    { label: "Company Policies Acknowledged", done: c.policyAcknowledged, key: "policyAcknowledged" },
    { label: "Confidentiality Agreement Signed", done: c.confidentialityAgreed, key: "confidentialityAgreed" },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Contract & Policy Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.key} className={cn("flex items-center justify-between p-3 rounded-lg border", item.done ? "border-success/20 bg-success/5" : "border-border")}>
                <div className="flex items-center gap-3">
                  {item.done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-medium", item.done ? "text-success" : "text-muted-foreground")}>
                    {item.done ? "Done" : "Pending"}
                  </span>
                  {!item.done && (
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2">
                      <Upload className="h-3 w-3 mr-1" /> Action
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Activity Log Tab ──────────────────────────────────────────────────────────
function ActivityLogTab({ c }: { c: OnboardingCase }) {
  return (
    <div className="space-y-3">
      {c.activityLog.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
      ) : (
        [...c.activityLog].reverse().map((log, i) => (
          <div key={log.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Activity className="h-3.5 w-3.5 text-primary" />
              </div>
              {i < c.activityLog.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="pb-4 min-w-0">
              <p className="text-sm font-medium">{log.action}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{log.performedBy}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{log.module}</span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{formatTime(log.timestamp)}</span>
              </div>
              {log.oldValue && <p className="text-xs text-muted-foreground mt-0.5">From: <span className="line-through">{log.oldValue}</span> → {log.newValue}</p>}
              {log.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{log.notes}</p>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ c }: { c: OnboardingCase }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Onboarding Configuration</CardTitle></CardHeader>
        <CardContent className="pt-0">
          <InfoRow label="Assigned To" value={c.assignedTo} />
          <InfoRow label="Template" value={c.templateId ?? "Default template"} />
          <InfoRow label="Proposed Start Date" value={formatDate(c.startDate)} />
          <InfoRow label="Created" value={formatTime(c.createdAt)} />
          <InfoRow label="Last Updated" value={formatTime(c.updatedAt)} />
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">Change Assigned HR</Button>
        <Button variant="outline" size="sm">Update Start Date</Button>
        <Button variant="outline" size="sm">Change Template</Button>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
          Put on Hold
        </Button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function OnboardingCaseProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const c = DEMO_ONBOARDING_CASES.find(x => x.id === id);

  if (!c) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        <p className="text-muted-foreground">Onboarding case not found.</p>
        <Button variant="outline" onClick={() => navigate("/onboarding")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Onboarding
        </Button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[c.status];
  const days = daysUntil(c.startDate);

  const allReadyItems = [
    c.documents.every(d => !d.mandatory || d.verificationStatus !== "not_uploaded"),
    c.checks.every(ch => !ch.mandatory || ch.status === "approved" || ch.status === "waived"),
    c.references.some(r => r.status === "verified"),
    c.contractSigned,
    !!c.startDate,
  ];
  const canMarkReady = allReadyItems.every(Boolean);

  const TABS = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "eligibility", label: "Eligibility", icon: UserCheck },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "checks", label: "Checks", icon: CheckCircle2 },
    { id: "references", label: "References", icon: Users },
    { id: "compliance", label: "Compliance Review", icon: Shield },
    { id: "contract", label: "Contract & Policies", icon: BookOpen },
    { id: "activity", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <div className="space-y-4">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate("/onboarding")} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Onboarding
      </Button>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* ── LEFT PANEL ──────────────────────────────────────── */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
          {/* Identity Card */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {initials(c.givenName, c.familyName)}
                </div>
                <div>
                  <h2 className="font-bold text-base">{c.givenName} {c.familyName}</h2>
                  <p className="text-sm text-muted-foreground">{c.appliedRole}</p>
                  <p className="text-xs text-muted-foreground">{c.department} · {c.location}</p>
                </div>
                <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1", statusCfg.color)}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{c.onboardingProgress}%</span>
                </div>
                <Progress value={c.onboardingProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{c.currentStage}</p>
              </div>
            </CardContent>
          </Card>

          {/* Key Info */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Key Information</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow label="Start Date" value={
                <span className={cn("font-semibold", days !== null && days < 7 ? "text-destructive" : "")}>
                  {formatDate(c.startDate)}{days !== null ? ` (${days > 0 ? `${days}d` : "past"})` : ""}
                </span>
              } />
              <InfoRow label="Employment" value={c.employmentType} />
              <InfoRow label="Salary" value={c.salaryOffered ? `£${c.salaryOffered.toLocaleString()}` : undefined} />
              <InfoRow label="Shift" value={c.shiftPattern} />
              <InfoRow label="Assigned To" value={c.assignedTo} />
              {c.vacancyTitle && <InfoRow label="Vacancy" value={c.vacancyTitle} />}
            </CardContent>
          </Card>

          {/* Sponsorship Snapshot */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Worker Classification</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow label="Type" value={c.workerType ? WORKER_TYPE_LABELS[c.workerType] : "Not set"} />
              <InfoRow label="Sponsored" value={
                <span className={cn("font-medium text-xs", c.requiresSponsorship ? "text-warning" : "text-success")}>
                  {c.requiresSponsorship ? "Yes – Sponsored" : "No"}
                </span>
              } />
              {c.visaType && <InfoRow label="Visa Type" value={c.visaType} />}
              <InfoRow label="Eligibility" value={<EligBadge d={c.eligibilityDecision} />} />
            </CardContent>
          </Card>

          {/* Status Badges */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Status</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5">
                {c.documents.some(d => d.mandatory && d.verificationStatus === "not_uploaded") && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                    <AlertCircle className="h-3 w-3" /> Missing Docs
                  </span>
                )}
                {c.checks.some(ch => ch.mandatory && (ch.status === "pending" || ch.status === "not_started")) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                    <Clock className="h-3 w-3" /> Checks Pending
                  </span>
                )}
                {c.references.some(r => r.status === "pending") && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                    <Send className="h-3 w-3" /> Refs Pending
                  </span>
                )}
                {c.requiresSponsorship && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary/10 text-secondary border border-secondary/20">
                    <Shield className="h-3 w-3" /> Sponsored
                  </span>
                )}
                {c.offerAccepted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                    <CheckCircle2 className="h-3 w-3" /> Offer Accepted
                  </span>
                )}
                {!c.contractSigned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                    <FileText className="h-3 w-3" /> Contract Pending
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Upload className="h-3.5 w-3.5 mr-2" /> Upload Document
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mark Check Complete
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <Send className="h-3.5 w-3.5 mr-2" /> Send Reference Request
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <FileText className="h-3.5 w-3.5 mr-2" /> Add Note
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                <PauseCircle className="h-3.5 w-3.5 mr-2 text-warning" /> Put on Hold
              </Button>
              {canMarkReady ? (
                <Button size="sm" className="w-full justify-start text-xs h-8 bg-success hover:bg-success/90 text-success-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mark Ready to Start
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => navigate("/people")}
                >
                  <UserPlus className="h-3.5 w-3.5 mr-2" /> Move to People
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex flex-wrap h-auto gap-1 p-1 mb-4">
              {TABS.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center gap-1.5 text-xs h-8"
                  >
                    <TabIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="overview"><OverviewTab c={c} /></TabsContent>
            <TabsContent value="eligibility"><EligibilityTab c={c} /></TabsContent>
            <TabsContent value="documents"><DocumentsTab c={c} /></TabsContent>
            <TabsContent value="checks"><ChecksTab c={c} /></TabsContent>
            <TabsContent value="references"><ReferencesTab c={c} /></TabsContent>
            <TabsContent value="compliance"><ComplianceReviewTab c={c} /></TabsContent>
            <TabsContent value="contract"><ContractTab c={c} /></TabsContent>
            <TabsContent value="activity"><ActivityLogTab c={c} /></TabsContent>
            <TabsContent value="settings"><SettingsTab c={c} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
