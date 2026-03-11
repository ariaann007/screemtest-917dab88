import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, User, CheckCircle2, XCircle, AlertTriangle, Clock,
  FileText, Upload, Shield, Activity, Settings2, BookOpen,
  Users, Mail, Phone, MapPin, Briefcase, Calendar,
  RefreshCw, UserCheck, AlertCircle, PauseCircle, TrendingUp,
  FileCheck, Eye, Send, UserPlus, Plus, Trash2, Building2,
  Globe, CreditCard, Heart, ClipboardList, Star, ChevronDown,
  ChevronUp, Info,
} from "lucide-react";
import { DEMO_ONBOARDING_CASES } from "@/data/onboarding-demo";
import {
  OnboardingCase, OnboardingStatus, WorkerType,
  CheckStatus, EligibilityDecision, ComplianceDecision, ReferenceStatus,
  EmploymentHistoryEntry, EmploymentGap, NextOfKin,
  AdditionalDocRequest,
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
  requires_sponsorship: "Requires Sponsorship",
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

function monthsBetween(from: string, to: string) {
  const a = new Date(from), b = new Date(to);
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

// ── Sub-badges ────────────────────────────────────────────────────────────────
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

// ── Reusable display components ───────────────────────────────────────────────
function InfoRow({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-2 py-2 border-b last:border-0", className)}>
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-xs font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

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
    { label: "Personal Details", status: c.personalDetails?.fullLegalName ? "done" : "pending", detail: c.personalDetails?.fullLegalName ? "Completed by candidate" : "Awaiting candidate input" },
    { label: "Employment History", status: (c.employmentHistory ?? []).length > 0 ? "done" : "pending", detail: `${(c.employmentHistory ?? []).length} entries` },
    { label: "Next of Kin", status: c.primaryNextOfKin?.fullName ? "done" : "pending", detail: c.primaryNextOfKin?.fullName ? "Primary contact added" : "Not completed" },
    { label: "Immigration Status", status: c.immigrationStatus?.workerCategory ? "done" : "pending", detail: c.immigrationStatus ? WORKER_TYPE_LABELS[c.immigrationStatus.workerCategory] : "Not set" },
    { label: "Documents", status: uploadedMandatoryDocs === mandatoryDocs.length ? "done" : "pending", detail: `${uploadedMandatoryDocs} / ${mandatoryDocs.length} mandatory uploaded` },
    { label: "Checks", status: approvedChecks === c.checks.filter(ch => ch.mandatory).length ? "done" : "pending", detail: `${approvedChecks} / ${c.checks.filter(ch => ch.mandatory).length} approved` },
    { label: "References", status: verifiedRefs >= 1 ? "done" : "pending", detail: `${verifiedRefs} / ${c.references.length} verified` },
    { label: "Compliance Review", status: c.complianceDecision !== "pending" ? "done" : "pending", detail: c.complianceDecision === "pending" ? "Awaiting" : "Reviewed" },
    { label: "Contract & Policies", status: c.contractSigned && c.handbookAcknowledged ? "done" : "pending", detail: c.contractSigned ? "Contract signed" : "Pending" },
  ];

  return (
    <div className="space-y-5">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Candidate Details</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <InfoRow label="Full Name" value={`${c.givenName} ${c.familyName}`} />
            <InfoRow label="Email" value={c.email} />
            <InfoRow label="Phone" value={c.phone} />
            <InfoRow label="Nationality" value={c.nationality} />
            {c.invitationSentAt && <InfoRow label="Invitation Sent" value={formatTime(c.invitationSentAt)} />}
            {c.candidateJoinedAt && <InfoRow label="Candidate Joined" value={formatTime(c.candidateJoinedAt)} />}
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
                  <span>Reference not requested: <strong>{r.refereeName || "Unnamed referee"}</strong></span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Personal Details Tab ──────────────────────────────────────────────────────
function PersonalDetailsTab({ c }: { c: OnboardingCase }) {
  const pd = c.personalDetails;
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {pd?.fullLegalName ? "Completed by candidate — awaiting manager review" : "Awaiting candidate to complete this section"}
        </p>
        <Button size="sm" variant="outline" onClick={() => setEditing(e => !e)}>
          {editing ? <><XCircle className="h-3.5 w-3.5 mr-1.5" />Cancel</> : <><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Edit</>}
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Edit Personal Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Legal Name"><Input defaultValue={pd?.fullLegalName ?? `${c.givenName} ${c.familyName}`} /></Field>
              <Field label="Preferred Name"><Input defaultValue={pd?.preferredName ?? ""} /></Field>
              <Field label="Personal Email"><Input type="email" defaultValue={pd?.personalEmail ?? c.email} /></Field>
              <Field label="Phone Number"><Input defaultValue={pd?.phone ?? c.phone} /></Field>
              <Field label="Date of Birth"><Input type="date" defaultValue={pd?.dateOfBirth} /></Field>
              <Field label="Nationality"><Input defaultValue={pd?.nationality ?? c.nationality} /></Field>
              <Field label="Passport Number"><Input defaultValue={pd?.passportNumber} /></Field>
              <Field label="National Insurance Number"><Input defaultValue={pd?.nationalInsuranceNumber} /></Field>
              <div className="md:col-span-2"><Field label="Home Address"><Textarea defaultValue={pd?.homeAddress} className="min-h-[70px]" /></Field></div>
              <Field label="Postcode"><Input defaultValue={pd?.postcode} /></Field>
              <Field label="Emergency Contact Name"><Input defaultValue={pd?.emergencyContactName} /></Field>
              <Field label="Emergency Contact Phone"><Input defaultValue={pd?.emergencyContactPhone} /></Field>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => setEditing(false)}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Save Changes</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" />Identity</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <InfoRow label="Full Legal Name" value={pd?.fullLegalName ?? `${c.givenName} ${c.familyName}`} />
                <InfoRow label="Preferred Name" value={pd?.preferredName} />
                <InfoRow label="Date of Birth" value={pd?.dateOfBirth ? formatDate(pd.dateOfBirth) : undefined} />
                <InfoRow label="Nationality" value={pd?.nationality ?? c.nationality} />
                <InfoRow label="Passport Number" value={pd?.passportNumber} />
                <InfoRow label="NI Number" value={pd?.nationalInsuranceNumber} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4" />Contact Details</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <InfoRow label="Personal Email" value={pd?.personalEmail ?? c.email} />
                <InfoRow label="Phone" value={pd?.phone ?? c.phone} />
                <InfoRow label="Home Address" value={pd?.homeAddress} />
                <InfoRow label="Postcode" value={pd?.postcode} />
                <InfoRow label="Emergency Contact" value={pd?.emergencyContactName} />
                <InfoRow label="Emergency Phone" value={pd?.emergencyContactPhone} />
              </CardContent>
            </Card>
          </div>
          {!pd?.fullLegalName && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-3 flex items-center gap-2 text-sm text-warning">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Candidate has not yet completed their personal details. An invitation email should be sent.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ── Employment Details Tab ────────────────────────────────────────────────────
function EmploymentDetailsTab({ c }: { c: OnboardingCase }) {
  const ed = c.employmentDetails;
  const [editing, setEditing] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Employment details for the new role — verified by manager</p>
        <div className="flex gap-2">
          {ed?.managerVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
              <CheckCircle2 className="h-3 w-3" /> Manager Verified
            </span>
          )}
          <Button size="sm" variant="outline" onClick={() => setEditing(e => !e)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </div>

      {editing ? (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Edit Employment Details</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Job Title"><Input defaultValue={ed?.jobTitle ?? c.appliedRole} /></Field>
              <Field label="Department"><Input defaultValue={ed?.department ?? c.department} /></Field>
              <Field label="Work Location"><Input defaultValue={ed?.location ?? c.location} /></Field>
              <Field label="Line Manager"><Input defaultValue={ed?.manager} /></Field>
              <Field label="Employment Type"><Input defaultValue={ed?.employmentType ?? c.employmentType} /></Field>
              <Field label="Contracted Hours"><Input defaultValue={ed?.contractedHours} placeholder="e.g. 37.5" /></Field>
              <Field label="Work Pattern"><Input defaultValue={ed?.workPattern} /></Field>
              <Field label="Shift Type"><Input defaultValue={ed?.shiftType ?? c.shiftPattern} /></Field>
              <Field label="Salary / Hourly Rate"><Input defaultValue={ed?.salaryOrRate ?? (c.salaryOffered ? `£${c.salaryOffered.toLocaleString()}` : "")} /></Field>
              <Field label="Proposed Start Date"><Input type="date" defaultValue={ed?.proposedStartDate ?? c.startDate} /></Field>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => setEditing(false)}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Save & Verify</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4" />Role Details</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow label="Job Title" value={ed?.jobTitle ?? c.appliedRole} />
              <InfoRow label="Department" value={ed?.department ?? c.department} />
              <InfoRow label="Location" value={ed?.location ?? c.location} />
              <InfoRow label="Line Manager" value={ed?.manager} />
              <InfoRow label="Proposed Start" value={ed?.proposedStartDate ? formatDate(ed.proposedStartDate) : formatDate(c.startDate)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Hours & Pay</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <InfoRow label="Employment Type" value={ed?.employmentType ?? c.employmentType} />
              <InfoRow label="Contracted Hours" value={ed?.contractedHours} />
              <InfoRow label="Work Pattern" value={ed?.workPattern} />
              <InfoRow label="Shift Type" value={ed?.shiftType ?? c.shiftPattern} />
              <InfoRow label="Salary / Rate" value={ed?.salaryOrRate ?? (c.salaryOffered ? `£${c.salaryOffered.toLocaleString()} p/a` : undefined)} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Employment History Tab ────────────────────────────────────────────────────
function EmploymentHistoryTab({ c }: { c: OnboardingCase }) {
  const history = c.employmentHistory ?? [];
  const gaps = c.employmentGaps ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Detect gaps automatically from history dates
  const sortedHistory = [...history].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const detectedGaps: { from: string; to: string; months: number }[] = [];
  for (let i = 0; i < sortedHistory.length - 1; i++) {
    const endOfCurrent = sortedHistory[i].endDate;
    const startOfNext = sortedHistory[i + 1].startDate;
    if (endOfCurrent && startOfNext) {
      const gap = monthsBetween(endOfCurrent, startOfNext);
      if (gap > 1) {
        detectedGaps.push({ from: endOfCurrent, to: startOfNext, months: gap });
      }
    }
  }

  const GAP_REASONS: Record<string, string> = {
    study: "Studying / Further Education",
    unemployment: "Seeking Employment",
    caring: "Caring Responsibilities",
    travel: "Travel",
    medical: "Medical / Health Reasons",
    other: "Other",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{history.length} employment record{history.length !== 1 ? "s" : ""} — candidate completed</p>
        <Button size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Employment Record
        </Button>
      </div>

      {history.length === 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3 text-sm text-warning">
            <AlertCircle className="h-4 w-4 shrink-0" />
            No employment history recorded. Candidate should complete this section.
          </CardContent>
        </Card>
      )}

      {sortedHistory.map((entry, idx) => {
        const isExpanded = expandedId === entry.id;
        return (
          <Card key={entry.id}>
            <CardContent className="p-0">
              <button
                className="w-full p-4 flex items-start justify-between gap-3 text-left hover:bg-muted/30 transition-colors rounded-lg"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{entry.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">{entry.employerName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.startDate)} – {entry.endDate ? formatDate(entry.endDate) : <span className="text-success font-medium">Current</span>}
                      {entry.endDate && <span className="ml-2 text-muted-foreground">({monthsBetween(entry.startDate, entry.endDate)} months)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {entry.reasonForLeaving && (
                    <span className="text-xs text-muted-foreground hidden sm:block">{entry.reasonForLeaving}</span>
                  )}
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 border-t pt-3 space-y-1.5">
                  <InfoRow label="Employer" value={entry.employerName} />
                  <InfoRow label="Job Title" value={entry.jobTitle} />
                  <InfoRow label="Employment Type" value={entry.employmentType} />
                  <InfoRow label="Start Date" value={formatDate(entry.startDate)} />
                  <InfoRow label="End Date" value={entry.endDate ? formatDate(entry.endDate) : "Current position"} />
                  <InfoRow label="Location" value={entry.workplaceLocation} />
                  <InfoRow label="Main Duties" value={entry.mainDuties} />
                  <InfoRow label="Reason for Leaving" value={entry.reasonForLeaving} />
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="h-7 text-xs">Edit</Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Auto-detected Gaps */}
      {detectedGaps.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-semibold text-sm text-warning">Employment Gaps Detected</h3>
          </div>
          {detectedGaps.map((gap, i) => {
            const existingExplanation = gaps.find(g => g.fromDate === gap.from);
            return (
              <Card key={i} className="border-warning/30 bg-warning/5">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Gap of {gap.months} month{gap.months !== 1 ? "s" : ""}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(gap.from)} – {formatDate(gap.to)}</p>
                      {existingExplanation?.reason && (
                        <p className="text-xs mt-1">
                          <span className="font-medium">Reason:</span> {GAP_REASONS[existingExplanation.reason] ?? existingExplanation.reason}
                        </p>
                      )}
                      {existingExplanation?.explanation && (
                        <p className="text-xs text-muted-foreground italic mt-0.5">{existingExplanation.explanation}</p>
                      )}
                    </div>
                    {!existingExplanation ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs shrink-0">Request Explanation</Button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/10 text-success border border-success/20">
                        <CheckCircle2 className="h-3 w-3" /> Explained
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Candidate-provided gap explanations */}
      {gaps.length > 0 && detectedGaps.length === 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Gap Explanations</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-2">
            {gaps.map(gap => (
              <div key={gap.id} className="p-3 rounded-lg border">
                <p className="text-xs font-medium">{formatDate(gap.fromDate)} – {formatDate(gap.toDate)}</p>
                <p className="text-xs text-muted-foreground">{gap.reason ? GAP_REASONS[gap.reason] ?? gap.reason : "No reason given"}</p>
                {gap.explanation && <p className="text-xs italic mt-0.5">{gap.explanation}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Next of Kin Tab ───────────────────────────────────────────────────────────
function NextOfKinTab({ c }: { c: OnboardingCase }) {
  const [editingPrimary, setEditingPrimary] = useState(false);
  const [editingSecondary, setEditingSecondary] = useState(false);

  function KinCard({ kin, label, editing, onEdit }: { kin?: NextOfKin; label: string; editing: boolean; onEdit: () => void }) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="h-4 w-4 text-destructive" />
              {label}
            </CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onEdit}>
              {editing ? "Cancel" : kin?.fullName ? "Edit" : "Add"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Full Name"><Input defaultValue={kin?.fullName} placeholder="Full legal name" /></Field>
              <Field label="Relationship"><Input defaultValue={kin?.relationship} placeholder="e.g. Spouse, Parent, Sibling" /></Field>
              <Field label="Phone Number"><Input defaultValue={kin?.phone} /></Field>
              <Field label="Email Address"><Input type="email" defaultValue={kin?.email} /></Field>
              <div className="md:col-span-2"><Field label="Address"><Textarea defaultValue={kin?.address} className="min-h-[60px]" /></Field></div>
              <div className="md:col-span-2 flex gap-2">
                <Button size="sm" onClick={onEdit}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Save</Button>
                <Button size="sm" variant="outline" onClick={onEdit}>Cancel</Button>
              </div>
            </div>
          ) : kin?.fullName ? (
            <div>
              <InfoRow label="Full Name" value={kin.fullName} />
              <InfoRow label="Relationship" value={kin.relationship} />
              <InfoRow label="Phone" value={kin.phone} />
              <InfoRow label="Email" value={kin.email} />
              <InfoRow label="Address" value={kin.address} />
            </div>
          ) : (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              Not yet provided — candidate should complete this section
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Two emergency contacts are required before employment starts.</p>
      <KinCard kin={c.primaryNextOfKin} label="Primary Next of Kin" editing={editingPrimary} onEdit={() => setEditingPrimary(e => !e)} />
      <KinCard kin={c.secondaryNextOfKin} label="Secondary Next of Kin" editing={editingSecondary} onEdit={() => setEditingSecondary(e => !e)} />
    </div>
  );
}

// ── Immigration Status Tab ────────────────────────────────────────────────────
function ImmigrationStatusTab({ c }: { c: OnboardingCase }) {
  const imm = c.immigrationStatus;
  const [editing, setEditing] = useState(false);

  const categoryDescriptions: Partial<Record<WorkerType, string>> = {
    uk_irish: "Unrestricted right to work. Passport or birth cert as evidence.",
    ilr_settled: "Settled/Pre-settled status. Share code or BRC as evidence.",
    non_sponsored_visa: "Time-limited visa (Graduate, Global Talent etc). Visa expiry tracking required.",
    student_visa: "Student visa — term-time working hour limits apply.",
    sponsored_worker: "Currently sponsored or transferring sponsorship.",
    requires_sponsorship: "Requires new Skilled Worker visa sponsorship.",
    custom: "Custom classification — specify details.",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Immigration status drives the required document checklist.</p>
        <Button size="sm" variant="outline" onClick={() => setEditing(e => !e)}>
          {editing ? "Cancel" : imm ? "Edit" : "Set Status"}
        </Button>
      </div>

      {editing ? (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Immigration / Right to Work Status</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Worker Category">
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                    {Object.entries(WORKER_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k} selected={imm?.workerCategory === k}>{v}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Current Immigration Status"><Input defaultValue={imm?.currentStatus} placeholder="e.g. Skilled Worker Visa" /></Field>
              <Field label="Visa Type"><Input defaultValue={imm?.visaType} placeholder="e.g. Skilled Worker, Graduate" /></Field>
              <Field label="Visa Expiry Date"><Input type="date" defaultValue={imm?.visaExpiryDate} /></Field>
              <Field label="Right to Work Share Code"><Input defaultValue={imm?.rightToWorkShareCode} placeholder="e.g. W4K7R9T2P" /></Field>
              <Field label="NI Number"><Input defaultValue={imm?.niNumber} /></Field>
              <Field label="CoS Reference"><Input defaultValue={imm?.cosReference} /></Field>
              <div className="md:col-span-2">
                <Field label="Work Restrictions (if any)"><Textarea defaultValue={imm?.workRestrictions} className="min-h-[60px]" placeholder="e.g. 20 hours max during term time" /></Field>
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="needsSponsorship" defaultChecked={imm?.requiresSponsorship} className="rounded" />
                  <Label htmlFor="needsSponsorship" className="text-sm">Requires Sponsorship</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isStudying" defaultChecked={imm?.isCurrentlyStudying} className="rounded" />
                  <Label htmlFor="isStudying" className="text-sm">Currently Studying</Label>
                </div>
              </div>
              {(imm?.workerCategory === "student_visa") && (
                <>
                  <Field label="Academic Term Dates"><Input defaultValue={imm?.academicTermDates} /></Field>
                  <Field label="Vacation Dates"><Input defaultValue={imm?.vacationDates} /></Field>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => setEditing(false)}><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Save</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      ) : imm ? (
        <>
          {/* Category banner */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{WORKER_TYPE_LABELS[imm.workerCategory]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{categoryDescriptions[imm.workerCategory]}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Visa & Status</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <InfoRow label="Category" value={WORKER_TYPE_LABELS[imm.workerCategory]} />
                <InfoRow label="Current Status" value={imm.currentStatus} />
                <InfoRow label="Visa Type" value={imm.visaType} />
                <InfoRow label="Visa Expiry" value={imm.visaExpiryDate ? formatDate(imm.visaExpiryDate) : undefined} />
                <InfoRow label="Work Restrictions" value={imm.workRestrictions} />
                <InfoRow label="Requires Sponsorship" value={
                  imm.requiresSponsorship
                    ? <span className="text-warning font-medium">Yes</span>
                    : <span className="text-success font-medium">No</span>
                } />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Documentation</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <InfoRow label="RTW Share Code" value={imm.rightToWorkShareCode} />
                <InfoRow label="NI Number" value={imm.niNumber} />
                <InfoRow label="CoS Reference" value={imm.cosReference} />
                {imm.workerCategory === "student_visa" && (
                  <>
                    <InfoRow label="Term Dates" value={imm.academicTermDates} />
                    <InfoRow label="Vacation Dates" value={imm.vacationDates} />
                    <InfoRow label="Currently Studying" value={imm.isCurrentlyStudying ? "Yes" : "No"} />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dynamic document requirements hint */}
          <Card className="border-secondary/20 bg-secondary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-secondary" />
                Required Documents for This Worker Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {imm.workerCategory === "uk_irish" && ["Passport or acceptable RTW evidence", "Record of RTW check date", "NI number"].map(d => (
                  <li key={d} className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{d}</li>
                ))}
                {(imm.workerCategory === "non_sponsored_visa" || imm.workerCategory === "ilr_settled") && ["Passport", "Visa / BRP / eVisa evidence", "RTW check", "Visa expiry tracking", "NI number"].map(d => (
                  <li key={d} className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{d}</li>
                ))}
                {imm.workerCategory === "student_visa" && ["Passport", "Visa / BRP evidence", "RTW check", "Term dates letter", "Academic calendar", "NI number (if available)", "Work restriction review"].map(d => (
                  <li key={d} className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{d}</li>
                ))}
                {(imm.workerCategory === "sponsored_worker" || imm.workerCategory === "requires_sponsorship") && ["Passport including leave stamps", "BRP or digital immigration status", "Visa evidence", "CoS reference", "NI number", "Contact details + address", "Signed contract", "Payroll setup", "Attendance monitoring", "Qualification evidence"].map(d => (
                  <li key={d} className="flex items-center gap-2 text-xs"><CheckCircle2 className="h-3.5 w-3.5 text-success" />{d}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3 text-sm text-warning">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Immigration status has not been set. This determines the required document checklist.
          </CardContent>
        </Card>
      )}
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

// ── Additional Doc Requests Tab ───────────────────────────────────────────────
function AdditionalDocRequestsTab({ c }: { c: OnboardingCase }) {
  const requests = c.additionalDocRequests ?? [];
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", instructions: "", mandatory: "true", dueDate: "" });

  const ADR_STATUS_CONFIG = {
    pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20" },
    uploaded: { label: "Uploaded", color: "bg-primary/10 text-primary border-primary/20" },
    approved: { label: "Approved", color: "bg-success/10 text-success border-success/20" },
    rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{requests.length} additional request{requests.length !== 1 ? "s" : ""} raised by HR</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(s => !s)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Request Document
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2"><CardTitle className="text-sm">New Document Request</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Document Title *">
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Enhanced DBS Evidence, Role-specific Licence" />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Instructions for Candidate">
                  <Textarea value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} className="min-h-[70px]" placeholder="Explain what is needed and why…" />
                </Field>
              </div>
              <div>
                <Field label="Required?">
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.mandatory} onChange={e => setForm(f => ({ ...f, mandatory: e.target.value }))}>
                    <option value="true">Mandatory</option>
                    <option value="false">Optional</option>
                  </select>
                </Field>
              </div>
              <Field label="Due Date">
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
              </Field>
            </div>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => setShowForm(false)}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> Send Request to Candidate
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No additional document requests raised yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Use this to request documents outside the standard checklist.</p>
          </CardContent>
        </Card>
      )}

      {requests.map(req => {
        const cfg = ADR_STATUS_CONFIG[req.status];
        return (
          <Card key={req.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{req.title}</p>
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", req.mandatory ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-muted text-muted-foreground border-border")}>
                        {req.mandatory ? "Mandatory" : "Optional"}
                      </span>
                    </div>
                    {req.instructions && <p className="text-xs text-muted-foreground mt-1">{req.instructions}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground">Requested by {req.requestedBy}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(req.requestedAt)}</span>
                      {req.dueDate && <span className="text-xs text-muted-foreground">Due: {formatDate(req.dueDate)}</span>}
                    </div>
                    {req.fileName && <p className="text-xs text-muted-foreground mt-1">Uploaded: {req.fileName}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", cfg.color)}>
                    {cfg.label}
                  </span>
                  {req.status === "uploaded" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs">Review</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
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
                      <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", cfg.color.split(" ")[0])}>
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

// ── Review & Approval Tab ─────────────────────────────────────────────────────
function ReviewApprovalTab({ c, onMoveToPeople }: { c: OnboardingCase; onMoveToPeople: () => void }) {
  const sections = [
    { label: "Personal Details Completed", done: !!(c.personalDetails?.fullLegalName), detail: c.personalDetails?.fullLegalName ? "✓ Completed" : "Awaiting candidate" },
    { label: "Employment Details Verified", done: !!(c.employmentDetails?.managerVerified), detail: c.employmentDetails?.managerVerified ? "✓ Manager verified" : "Not verified" },
    { label: "Employment History Reviewed", done: (c.employmentHistory ?? []).length > 0, detail: `${(c.employmentHistory ?? []).length} records` },
    { label: "Employment Gaps Explained", done: (c.employmentGaps ?? []).every(g => g.explanation), detail: (c.employmentGaps ?? []).length === 0 ? "No gaps detected" : `${(c.employmentGaps ?? []).length} gap(s) explained` },
    { label: "Next of Kin Completed", done: !!(c.primaryNextOfKin?.fullName), detail: c.primaryNextOfKin?.fullName ? "✓ Primary added" : "Missing" },
    { label: "Immigration Status Set", done: !!(c.immigrationStatus), detail: c.immigrationStatus ? WORKER_TYPE_LABELS[c.immigrationStatus.workerCategory] : "Not set" },
    { label: "Mandatory Documents Uploaded", done: !c.documents.some(d => d.mandatory && d.verificationStatus === "not_uploaded"), detail: `${c.documents.filter(d => d.mandatory && d.verificationStatus !== "not_uploaded").length}/${c.documents.filter(d => d.mandatory).length} uploaded` },
    { label: "Additional Requests Completed", done: (c.additionalDocRequests ?? []).filter(r => r.mandatory).every(r => r.status === "approved"), detail: `${(c.additionalDocRequests ?? []).filter(r => r.mandatory && r.status === "approved").length}/${(c.additionalDocRequests ?? []).filter(r => r.mandatory).length} mandatory done` },
    { label: "Pre-Employment Checks Approved", done: !c.checks.some(ch => ch.mandatory && ch.status !== "approved" && ch.status !== "waived"), detail: `${c.checks.filter(ch => ch.status === "approved").length}/${c.checks.length} complete` },
    { label: "References Verified", done: c.references.some(r => r.status === "verified"), detail: `${c.references.filter(r => r.status === "verified").length}/${c.references.length} verified` },
    ...(c.requiresSponsorship ? [
      { label: "Sponsorship Eligibility Confirmed", done: c.checks.some(ch => ch.name.toLowerCase().includes("sponsor") && ch.status === "approved"), detail: "Immigration check" },
      { label: "Salary Threshold Met", done: c.salaryThresholdMet === true, detail: c.salaryThresholdMet ? "Confirmed" : "Not confirmed" },
    ] : []),
    { label: "Contract Signed", done: !!c.contractSigned, detail: c.contractSigned ? "Signed" : "Pending signature" },
    { label: "Policies Acknowledged", done: !!(c.handbookAcknowledged && c.policyAcknowledged), detail: c.handbookAcknowledged ? "Acknowledged" : "Pending" },
    { label: "Start Date Confirmed", done: !!c.startDate, detail: c.startDate ? formatDate(c.startDate) : "Not set" },
  ];

  const completedCount = sections.filter(s => s.done).length;
  const totalCount = sections.length;
  const allClear = completedCount === totalCount;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      {/* Summary progress */}
      <Card className={cn("border-2", allClear ? "border-success/40 bg-success/5" : "border-warning/30 bg-warning/5")}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {allClear
                ? <CheckCircle2 className="h-5 w-5 text-success" />
                : <AlertTriangle className="h-5 w-5 text-warning" />}
              <span className="font-semibold text-sm">
                {allClear ? "All items complete — ready to approve" : `${completedCount} of ${totalCount} items complete`}
              </span>
            </div>
            <span className="text-sm font-bold">{progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </CardContent>
      </Card>

      {/* Detailed checklist */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Pre-Approval Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {sections.map((s, i) => (
              <div key={i} className={cn("flex items-center justify-between p-2.5 rounded-lg", s.done ? "bg-success/5" : "bg-destructive/5")}>
                <div className="flex items-center gap-2.5">
                  {s.done
                    ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    : <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                  <span className="text-sm">{s.label}</span>
                </div>
                <span className={cn("text-xs font-medium", s.done ? "text-success" : "text-destructive")}>{s.detail}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decision buttons */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Final Decision</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              className="flex-1 min-w-[200px]"
              disabled={!allClear}
              variant={allClear ? "default" : "outline"}
              onClick={allClear ? onMoveToPeople : undefined}
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              {allClear ? "Approve & Move to People" : "Complete All Items First"}
            </Button>
            <Button variant="outline" className="flex-1 min-w-[180px]">
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Return to Candidate
            </Button>
            <Button variant="outline" className="flex-1 min-w-[150px] text-warning border-warning/30 hover:bg-warning/10">
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              Approve with Conditions
            </Button>
            <Button variant="outline" className="flex-1 min-w-[150px] text-destructive border-destructive/30 hover:bg-destructive/10">
              <XCircle className="h-4 w-4 mr-1.5" />
              Not Cleared
            </Button>
          </div>
          {allClear && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Clicking "Approve & Move to People" will create a live employee record and transfer all onboarding data automatically.
            </p>
          )}
        </CardContent>
      </Card>
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
    { label: "Offer Letter Accepted", done: c.offerAccepted },
    { label: "Employment Contract Uploaded", done: c.contractUploaded },
    { label: "Contract Signed", done: c.contractSigned },
    { label: "Staff Handbook Acknowledged", done: c.handbookAcknowledged },
    { label: "Company Policies Acknowledged", done: c.policyAcknowledged },
    { label: "Confidentiality Agreement Signed", done: c.confidentialityAgreed },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Contract & Policy Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.label} className={cn("flex items-center justify-between p-3 rounded-lg border", item.done ? "border-success/20 bg-success/5" : "border-border")}>
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
          <InfoRow label="Invitation Sent" value={c.invitationSentAt ? formatTime(c.invitationSentAt) : "Not sent"} />
          <InfoRow label="Candidate Joined" value={c.candidateJoinedAt ? formatTime(c.candidateJoinedAt) : "Pending"} />
          <InfoRow label="Created" value={formatTime(c.createdAt)} />
          <InfoRow label="Last Updated" value={formatTime(c.updatedAt)} />
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm">Change Assigned HR</Button>
        <Button variant="outline" size="sm">Update Start Date</Button>
        <Button variant="outline" size="sm">Change Template</Button>
        <Button variant="outline" size="sm">
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Resend Invitation
        </Button>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
          <PauseCircle className="h-3.5 w-3.5 mr-1.5" />
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
  const [movedToPeople, setMovedToPeople] = useState(false);

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

  if (movedToPeople) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold">Moved to People</h2>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          {c.givenName} {c.familyName} has been successfully converted to a live employee record. All onboarding data has been transferred.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/people")}>
            <Users className="h-4 w-4 mr-1.5" /> View in People
          </Button>
          <Button variant="outline" onClick={() => navigate("/onboarding")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Onboarding
          </Button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "personal", label: "Personal Details", icon: User },
    { id: "employment", label: "Employment Details", icon: Briefcase },
    { id: "history", label: "Employment History", icon: Building2 },
    { id: "kin", label: "Next of Kin", icon: Heart },
    { id: "immigration", label: "Immigration Status", icon: Globe },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "additional", label: "Additional Requests", icon: ClipboardList },
    { id: "checks", label: "Checks", icon: CheckCircle2 },
    { id: "references", label: "References", icon: Users },
    { id: "compliance", label: "Compliance Review", icon: Shield },
    { id: "contract", label: "Contract & Policies", icon: BookOpen },
    { id: "review", label: "Review & Approval", icon: Star },
    { id: "activity", label: "Activity Log", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/onboarding")} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to Onboarding
      </Button>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* ── LEFT PANEL ────────────────────────────────────── */}
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

          {/* Worker Classification */}
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
                {!c.personalDetails?.fullLegalName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20">
                    <User className="h-3 w-3" /> Awaiting Candidate
                  </span>
                )}
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
                <Send className="h-3.5 w-3.5 mr-2 text-primary" />
                {c.invitationSentAt ? "Resend Invitation" : "Send Invitation"}
              </Button>
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
              <Button
                size="sm"
                className="w-full justify-start text-xs h-8 bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => { setActiveTab("review"); }}
              >
                <Star className="h-3.5 w-3.5 mr-2" /> Review & Approve
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────── */}
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
            <TabsContent value="personal"><PersonalDetailsTab c={c} /></TabsContent>
            <TabsContent value="employment"><EmploymentDetailsTab c={c} /></TabsContent>
            <TabsContent value="history"><EmploymentHistoryTab c={c} /></TabsContent>
            <TabsContent value="kin"><NextOfKinTab c={c} /></TabsContent>
            <TabsContent value="immigration"><ImmigrationStatusTab c={c} /></TabsContent>
            <TabsContent value="documents"><DocumentsTab c={c} /></TabsContent>
            <TabsContent value="additional"><AdditionalDocRequestsTab c={c} /></TabsContent>
            <TabsContent value="checks"><ChecksTab c={c} /></TabsContent>
            <TabsContent value="references"><ReferencesTab c={c} /></TabsContent>
            <TabsContent value="compliance"><ComplianceReviewTab c={c} /></TabsContent>
            <TabsContent value="contract"><ContractTab c={c} /></TabsContent>
            <TabsContent value="review"><ReviewApprovalTab c={c} onMoveToPeople={() => setMovedToPeople(true)} /></TabsContent>
            <TabsContent value="activity"><ActivityLogTab c={c} /></TabsContent>
            <TabsContent value="settings"><SettingsTab c={c} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
