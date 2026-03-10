import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DEMO_WORKERS, DEMO_WORK_LOCATIONS } from "@/data/demo";
import { calcWorkerScore } from "@/components/compliance/ComplianceScore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft, Edit, Upload, CalendarDays, FileText, AlertTriangle,
  Shield, CheckCircle2, Clock, MapPin, Phone, Mail, User,
  Briefcase, DollarSign, Award, Bell, Settings, Activity,
  UserCheck, BookOpen, GraduationCap, ClipboardList, FileCheck,
  Users, Heart, TrendingUp, Inbox,
} from "lucide-react";

// ── Tab components ────────────────────────────────────────────────────────────
function Field({ label, value, span = false }: { label: string; value?: string | null; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : ""}>
      <dt className="text-xs text-muted-foreground mb-0.5">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function SectionGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</dl>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 pb-2 border-b">{children}</h4>;
}

function PersonalDetailsTab({ worker }: { worker: ReturnType<typeof DEMO_WORKERS[0]["id"] extends string ? typeof DEMO_WORKERS[number] : never> }) {
  return (
    <div className="space-y-6">
      <div>
        <SectionHeading>Identity</SectionHeading>
        <SectionGrid>
          <Field label="Full Legal Name" value={`${worker.givenName} ${worker.familyName}`} />
          <Field label="Date of Birth" value={worker.dateOfBirth ? new Date(worker.dateOfBirth).toLocaleDateString("en-GB") : null} />
          <Field label="Nationality" value={worker.nationality} />
          <Field label="Passport Number" value={worker.passportNumber} />
          <Field label="Passport Expiry" value={worker.passportExpiry ? new Date(worker.passportExpiry).toLocaleDateString("en-GB") : null} />
          <Field label="NI Number" value={worker.niNumber} />
        </SectionGrid>
      </div>
      <div>
        <SectionHeading>Contact</SectionHeading>
        <SectionGrid>
          <Field label="Personal Email" value={worker.email} />
          <Field label="Phone Number" value={worker.phone} />
          <Field label="Address" value="—" />
          <Field label="Emergency Contact" value="—" />
        </SectionGrid>
      </div>
    </div>
  );
}

function EmploymentDetailsTab({ worker }: { worker: typeof DEMO_WORKERS[number] }) {
  const location = DEMO_WORK_LOCATIONS.find(l => l.id === worker.workLocationId);
  return (
    <div className="space-y-6">
      <div>
        <SectionHeading>Role & Contract</SectionHeading>
        <SectionGrid>
          <Field label="Job Title" value={worker.jobTitle} />
          <Field label="Department" value="—" />
          <Field label="Employment Type" value="Full-time" />
          <Field label="Employment Status" value={worker.leaverStatus === "leaver" ? "Leaver" : worker.status} />
          <Field label="Start Date" value={worker.startDate ? new Date(worker.startDate).toLocaleDateString("en-GB") : null} />
          <Field label="End Date" value={worker.endDate ? new Date(worker.endDate).toLocaleDateString("en-GB") : null} />
          <Field label="Probation Period" value="6 months" />
          <Field label="Notice Period" value="4 weeks" />
        </SectionGrid>
      </div>
      <div>
        <SectionHeading>Pay & Hours</SectionHeading>
        <SectionGrid>
          <Field label="Salary" value={worker.salary ? `£${worker.salary.toLocaleString()} per ${worker.salaryPeriod}` : null} />
          <Field label="Weekly Hours" value={worker.weeklyHours ? `${worker.weeklyHours}h` : null} />
          <Field label="Work Pattern" value="Monday–Friday" />
          <Field label="Work Location" value={location ? `${location.name}` : null} />
          <Field label="SOC Code" value={worker.socCode} />
          <Field label="Payroll ID" value={worker.id.toUpperCase().slice(0, 8)} />
        </SectionGrid>
      </div>
    </div>
  );
}

function NextOfKinTab() {
  return (
    <div className="space-y-4">
      <SectionHeading>Primary Next of Kin</SectionHeading>
      <SectionGrid>
        <Field label="Name" value="—" />
        <Field label="Relationship" value="—" />
        <Field label="Phone Number" value="—" />
        <Field label="Email" value="—" />
        <Field label="Address" value="—" span />
      </SectionGrid>
    </div>
  );
}

function DocumentsTab({ worker }: { worker: typeof DEMO_WORKERS[number] }) {
  const today = new Date();
  const visaExpiry = worker.visaExpiry ? new Date(worker.visaExpiry) : null;
  const passportExpiry = worker.passportExpiry ? new Date(worker.passportExpiry) : null;
  const daysVisa = visaExpiry ? Math.ceil((visaExpiry.getTime() - today.getTime()) / 86400000) : null;
  const daysPass = passportExpiry ? Math.ceil((passportExpiry.getTime() - today.getTime()) / 86400000) : null;

  const docs = [
    { name: "Passport", category: "Compliance", expiry: worker.passportExpiry, days: daysPass, required: true, status: worker.passportNumber ? "present" : "missing" },
    { name: "Visa / BRP", category: "Compliance", expiry: worker.visaExpiry, days: daysVisa, required: true, status: worker.visaExpiry ? (daysVisa !== null && daysVisa < 60 ? "expiring_soon" : "present") : "missing" },
    { name: "Right to Work Evidence", category: "Compliance", expiry: null, days: null, required: true, status: "present" },
    { name: "Employment Contract", category: "HR", expiry: null, days: null, required: true, status: "missing" },
    { name: "Offer Letter", category: "HR", expiry: null, days: null, required: false, status: "present" },
    { name: "DBS Certificate", category: "Compliance", expiry: null, days: null, required: false, status: "present" },
  ];

  const statusConfig = {
    present: { label: "Present", className: "bg-success/10 text-success" },
    missing: { label: "Missing", className: "bg-destructive/10 text-destructive" },
    expiring_soon: { label: "Expiring Soon", className: "bg-warning/10 text-warning" },
    expired: { label: "Expired", className: "bg-destructive/10 text-destructive" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeading>Document Vault</SectionHeading>
        <Button size="sm" variant="outline" className="gap-1.5 h-8">
          <Upload className="h-3.5 w-3.5" /> Upload Document
        </Button>
      </div>
      <div className="space-y-2">
        {docs.map(doc => {
          const cfg = statusConfig[doc.status as keyof typeof statusConfig];
          return (
            <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.category}{doc.expiry ? ` · Exp: ${new Date(doc.expiry).toLocaleDateString("en-GB")}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {doc.required && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Required</span>}
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cfg.className)}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NomineesTab() {
  return (
    <div className="space-y-4">
      <SectionHeading>Nominees / Beneficiaries</SectionHeading>
      <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg bg-muted/20">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
        No nominees recorded. Add a nominee to store beneficiary details.
        <div className="mt-3"><Button size="sm" variant="outline">Add Nominee</Button></div>
      </div>
    </div>
  );
}

function RequestsTab() {
  const requests = [
    { type: "Annual Leave", date: "2024-01-10", status: "Approved", approver: "Sarah Johnson" },
    { type: "Salary Change", date: "2024-01-05", status: "Pending", approver: "Mark Thompson" },
    { type: "Change of Address", date: "2023-12-18", status: "Completed", approver: "Sarah Johnson" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><SectionHeading>Requests</SectionHeading>
        <Button size="sm" variant="outline" className="h-8 gap-1"><Plus />New Request</Button>
      </div>
      {requests.map(r => (
        <div key={r.type + r.date} className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div>
            <p className="text-sm font-medium">{r.type}</p>
            <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("en-GB")} · Approver: {r.approver}</p>
          </div>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
            r.status === "Approved" || r.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          )}>{r.status}</span>
        </div>
      ))}
    </div>
  );
}

function AttendanceTab() {
  const records = [
    { date: "2024-01-15", checkIn: "08:55", checkOut: "17:05", status: "On time" },
    { date: "2024-01-14", checkIn: "09:12", checkOut: "17:00", status: "Late" },
    { date: "2024-01-13", checkIn: "09:00", checkOut: "17:00", status: "On time" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["Present Days", "18", "text-success"], ["Late Arrivals", "2", "text-warning"], ["Absences", "1", "text-destructive"]].map(([l, v, c]) => (
          <div key={l} className="p-3 rounded-lg border bg-card text-center">
            <p className={cn("text-xl font-bold", c)}>{v}</p>
            <p className="text-xs text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      <SectionHeading>Recent Records</SectionHeading>
      <div className="space-y-2">
        {records.map(r => (
          <div key={r.date} className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div>
              <p className="text-sm font-medium">{new Date(r.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
              <p className="text-xs text-muted-foreground">In: {r.checkIn} · Out: {r.checkOut}</p>
            </div>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
              r.status === "On time" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            )}>{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AbsenceTab({ worker }: { worker: typeof DEMO_WORKERS[number] }) {
  const absences = worker.absenceRecords ?? [];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["Annual Leave Left", "12 days", "text-primary"], ["Sick Days Used", "3", "text-warning"], ["Unauthorised", absences.length.toString(), "text-destructive"]].map(([l, v, c]) => (
          <div key={l} className="p-3 rounded-lg border bg-card text-center">
            <p className={cn("text-xl font-bold", c)}>{v}</p>
            <p className="text-xs text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>
      {absences.length > 0 && (
        <>
          <SectionHeading>Absence Records</SectionHeading>
          <div className="space-y-2">
            {absences.map(a => (
              <div key={a.id} className="p-3 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{a.reason}</p>
                  <span className="text-xs font-medium text-warning">{a.workingDays} working days</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(a.startDate).toLocaleDateString("en-GB")} – {new Date(a.endDate).toLocaleDateString("en-GB")}
                </p>
                {a.workingDays > 10 && (
                  <p className="text-xs text-warning flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3" /> Exceeds 10 consecutive days — Home Office reporting may apply
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ComplianceTab({ worker }: { worker: typeof DEMO_WORKERS[number] }) {
  const score = worker.complianceScore ?? calcWorkerScore(worker);
  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  const today = new Date();
  const visaExpiry = worker.visaExpiry ? new Date(worker.visaExpiry) : null;
  const daysToVisa = visaExpiry ? Math.ceil((visaExpiry.getTime() - today.getTime()) / 86400000) : null;

  const items = [
    { label: "Right to Work", status: "Compliant", ok: true },
    { label: "DBS Check", status: "Valid", ok: true },
    { label: "Visa Status", status: daysToVisa !== null && daysToVisa < 90 ? `Expiring in ${daysToVisa} days` : "Valid", ok: daysToVisa === null || daysToVisa >= 90 },
    { label: "Employment Contract", status: "Missing", ok: false },
    { label: "Training Compliance", status: "Up to date", ok: true },
    { label: "Policy Acknowledgement", status: "Completed", ok: true },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border bg-card flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border-4 flex items-center justify-center shrink-0"
          style={{ borderColor: score >= 80 ? "hsl(var(--success))" : score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))" }}>
          <span className={cn("text-xl font-black", scoreColor)}>{score}</span>
        </div>
        <div>
          <p className="font-semibold">Compliance Score</p>
          <p className={cn("text-sm font-medium", scoreColor)}>
            {score >= 80 ? "Low Risk" : score >= 60 ? "Medium Risk" : "High Risk"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{items.filter(i => !i.ok).length} issues require attention</p>
        </div>
      </div>
      <SectionHeading>Compliance Checks</SectionHeading>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border bg-card">
            <div className="flex items-center gap-2.5">
              {item.ok
                ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                : <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
              item.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            )}>{item.status}</span>
          </div>
        ))}
      </div>
      {worker.visaType && (
        <>
          <SectionHeading>Immigration Details</SectionHeading>
          <SectionGrid>
            <Field label="Visa Type" value={worker.visaType} />
            <Field label="CoS Reference" value={worker.cosReference} />
            <Field label="Visa Expiry" value={worker.visaExpiry ? new Date(worker.visaExpiry).toLocaleDateString("en-GB") : null} />
            <Field label="Work Restrictions" value="None noted" />
          </SectionGrid>
        </>
      )}
    </div>
  );
}

function PayrollTab({ worker }: { worker: typeof DEMO_WORKERS[number] }) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 text-sm flex items-center gap-2">
        <Shield className="h-4 w-4 text-warning shrink-0" />
        <span>Sensitive data — restricted to authorised HR and payroll staff only.</span>
      </div>
      <SectionHeading>Pay Details</SectionHeading>
      <SectionGrid>
        <Field label="Salary" value={worker.salary ? `£${worker.salary.toLocaleString()} / ${worker.salaryPeriod}` : null} />
        <Field label="Pay Frequency" value="Monthly" />
        <Field label="Tax Code" value="1257L" />
        <Field label="NI Number" value={worker.niNumber} />
        <Field label="Pension Status" value="Auto-enrolled" />
        <Field label="Pension Contribution" value="5% employee / 3% employer" />
      </SectionGrid>
      <SectionHeading>Bank Details</SectionHeading>
      <SectionGrid>
        <Field label="Bank Account" value="••••••••4521" />
        <Field label="Sort Code" value="••-••-12" />
      </SectionGrid>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="space-y-4">
      <SectionHeading>Objectives</SectionHeading>
      <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg bg-muted/20">
        <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
        No objectives set. Add objectives to start tracking performance.
      </div>
      <SectionHeading>Appraisals</SectionHeading>
      <div className="space-y-2">
        {[{ period: "2023 Annual Review", rating: "Meets Expectations", date: "2024-01-08" }].map(a => (
          <div key={a.period} className="p-3 rounded-lg border bg-card flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{a.period}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleDateString("en-GB")}</p>
            </div>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{a.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainingTab() {
  const courses = [
    { name: "Fire Safety Awareness", status: "Completed", expiry: "2025-03-15", required: true },
    { name: "Manual Handling", status: "Completed", expiry: "2025-01-20", required: true },
    { name: "Safeguarding Adults", status: "Due", expiry: null, required: true },
    { name: "Infection Control", status: "Completed", expiry: "2025-06-10", required: true },
  ];
  return (
    <div className="space-y-3">
      <SectionHeading>Training & Certifications</SectionHeading>
      {courses.map(c => (
        <div key={c.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-2.5">
            {c.status === "Completed" ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <Clock className="h-4 w-4 text-warning shrink-0" />}
            <div>
              <p className="text-sm font-medium">{c.name}</p>
              {c.expiry && <p className="text-xs text-muted-foreground">Expires {new Date(c.expiry).toLocaleDateString("en-GB")}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {c.required && <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Required</span>}
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
              c.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
            )}>{c.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function OnboardingTab() {
  const tasks = [
    { name: "ID verification completed", done: true },
    { name: "Contract signed and returned", done: false },
    { name: "Right to Work check completed", done: true },
    { name: "IT equipment allocated", done: false },
    { name: "Induction training completed", done: false },
    { name: "Policy acknowledgement signed", done: true },
  ];
  const pct = Math.round(tasks.filter(t => t.done).length / tasks.length * 100);
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border bg-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Onboarding Progress</p>
          <span className="text-sm font-bold text-primary">{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map(t => (
          <div key={t.name} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            {t.done ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground shrink-0" />}
            <span className={cn("text-sm", t.done ? "line-through text-muted-foreground" : "font-medium")}>{t.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityLogTab({ worker }: { worker: typeof DEMO_WORKERS[number] }) {
  const logs = [
    { action: "Employee record created", user: "Sarah Johnson", time: worker.createdAt, module: "People" },
    { action: "Visa details updated", user: "Mark Thompson", time: "2023-06-01T10:15:00Z", module: "Compliance" },
    { action: "Annual leave approved", user: "Sarah Johnson", time: "2023-09-12T14:30:00Z", module: "Leave" },
    { action: "Document uploaded: Passport", user: "Mark Thompson", time: "2023-03-16T09:00:00Z", module: "Documents" },
  ];
  return (
    <div className="space-y-3">
      <SectionHeading>Audit Trail</SectionHeading>
      <div className="relative space-y-0">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3 pb-4 relative">
            <div className="flex flex-col items-center">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                <Activity className="h-3.5 w-3.5 text-primary" />
              </div>
              {i < logs.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="pb-2 flex-1">
              <p className="text-sm font-medium leading-none">{log.action}</p>
              <p className="text-xs text-muted-foreground mt-1">{log.user} · {new Date(log.time).toLocaleString("en-GB")} · {log.module}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-4">
      <SectionHeading>Work Configuration</SectionHeading>
      <SectionGrid>
        <Field label="Work Pattern" value="Monday–Friday" />
        <Field label="Contracted Hours" value="37.5h / week" />
        <Field label="Shift Type" value="Fixed" />
        <Field label="Overtime Eligibility" value="Yes" />
        <Field label="Annual Leave Entitlement" value="28 days" />
        <Field label="Approval Manager" value="Sarah Johnson" />
      </SectionGrid>
      <SectionHeading>Notifications</SectionHeading>
      <SectionGrid>
        <Field label="Visa Expiry Alerts" value="Enabled (90, 60, 30 days)" />
        <Field label="Document Reminders" value="Enabled" />
        <Field label="Leave Notifications" value="Enabled" />
        <Field label="Compliance Alerts" value="Enabled" />
      </SectionGrid>
    </div>
  );
}

// ── Missing import for Plus ───────────────────────────────────────────────────
import { Plus } from "lucide-react";

// ── Main Profile Page ─────────────────────────────────────────────────────────
const TABS = [
  { id: "personal",    label: "Personal Details",   icon: User },
  { id: "employment",  label: "Employment",          icon: Briefcase },
  { id: "kin",         label: "Next of Kin",         icon: Heart },
  { id: "documents",   label: "Documents",           icon: FileText },
  { id: "nominees",    label: "Nominees",            icon: Users },
  { id: "requests",    label: "Requests",            icon: Inbox },
  { id: "attendance",  label: "Attendance",          icon: UserCheck },
  { id: "absence",     label: "Absence & Leave",     icon: CalendarDays },
  { id: "compliance",  label: "Compliance",          icon: Shield },
  { id: "payroll",     label: "Payroll",             icon: DollarSign },
  { id: "performance", label: "Performance",         icon: TrendingUp },
  { id: "training",    label: "Training",            icon: GraduationCap },
  { id: "onboarding",  label: "Onboarding",          icon: ClipboardList },
  { id: "activity",    label: "Activity Log",        icon: Activity },
  { id: "settings",    label: "Settings",            icon: Settings },
];

export default function EmployeeProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");

  const worker = DEMO_WORKERS.find(w => w.id === id);

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Employee not found.</p>
        <Button variant="outline" onClick={() => navigate("/people")}>Back to People</Button>
      </div>
    );
  }

  const today = new Date();
  const startDate = worker.startDate ? new Date(worker.startDate) : null;
  const yearsService = startDate ? Math.floor((today.getTime() - startDate.getTime()) / (365.25 * 86400000)) : null;
  const visaExpiry = worker.visaExpiry ? new Date(worker.visaExpiry) : null;
  const daysToVisa = visaExpiry ? Math.ceil((visaExpiry.getTime() - today.getTime()) / 86400000) : null;
  const score = worker.complianceScore ?? calcWorkerScore(worker);
  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
  const location = DEMO_WORK_LOCATIONS.find(l => l.id === worker.workLocationId);
  const isSponsored = !!worker.visaType;
  const isLeaver = worker.leaverStatus === "leaver";

  const statusBadges: { label: string; className: string }[] = [
    ...(isLeaver ? [{ label: "Leaver", className: "bg-muted text-muted-foreground" }] : [{ label: "Active", className: "bg-success/10 text-success" }]),
    ...(isSponsored ? [{ label: "Sponsored Worker", className: "bg-primary/10 text-primary" }] : []),
    ...(daysToVisa !== null && daysToVisa < 90 ? [{ label: "Visa Expiring Soon", className: "bg-warning/10 text-warning" }] : []),
    ...(score < 60 ? [{ label: "Compliance Risk", className: "bg-destructive/10 text-destructive" }] : []),
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "personal":    return <PersonalDetailsTab worker={worker} />;
      case "employment":  return <EmploymentDetailsTab worker={worker} />;
      case "kin":         return <NextOfKinTab />;
      case "documents":   return <DocumentsTab worker={worker} />;
      case "nominees":    return <NomineesTab />;
      case "requests":    return <RequestsTab />;
      case "attendance":  return <AttendanceTab />;
      case "absence":     return <AbsenceTab worker={worker} />;
      case "compliance":  return <ComplianceTab worker={worker} />;
      case "payroll":     return <PayrollTab worker={worker} />;
      case "performance": return <PerformanceTab />;
      case "training":    return <TrainingTab />;
      case "onboarding":  return <OnboardingTab />;
      case "activity":    return <ActivityLogTab worker={worker} />;
      case "settings":    return <SettingsTab />;
      default:            return null;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Back nav */}
      <button
        onClick={() => navigate("/people")}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to People
      </button>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><Edit className="h-3.5 w-3.5" />Edit Profile</Button>
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><Upload className="h-3.5 w-3.5" />Upload Document</Button>
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><CalendarDays className="h-3.5 w-3.5" />Record Absence</Button>
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><FileCheck className="h-3.5 w-3.5" />Raise Request</Button>
        {isSponsored && <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs text-primary border-primary/30"><Award className="h-3.5 w-3.5" />Visa Renewal</Button>}
        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><Bell className="h-3.5 w-3.5" />Add Note</Button>
      </div>

      {/* Main split layout */}
      <div className="flex gap-5 items-start">

        {/* ── LEFT: Overview Card ─────────────────────────────────────────── */}
        <div className="w-64 shrink-0 space-y-4">

          {/* Identity card */}
          <Card className="p-4 space-y-4">
            {/* Avatar + name */}
            <div className="text-center">
              <div className={cn(
                "h-16 w-16 rounded-full mx-auto flex items-center justify-center font-bold text-xl mb-3",
                isLeaver ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
              )}>
                {worker.givenName[0]}{worker.familyName[0]}
              </div>
              <h2 className="font-bold text-base leading-tight">{worker.givenName} {worker.familyName}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{worker.jobTitle || "—"}</p>
              <p className="text-xs text-muted-foreground">{worker.id.toUpperCase().slice(0, 8)}</p>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-1 justify-center">
              {statusBadges.map(b => (
                <span key={b.label} className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", b.className)}>{b.label}</span>
              ))}
            </div>

            {/* Key info */}
            <div className="space-y-2 text-xs border-t pt-3">
              {[
                { icon: Briefcase, label: "Department", value: "Care Operations" },
                { icon: MapPin, label: "Location", value: location?.city || "—" },
                { icon: User, label: "Manager", value: "Sarah Johnson" },
                { icon: Clock, label: "Start Date", value: worker.startDate ? new Date(worker.startDate).toLocaleDateString("en-GB") : "—" },
                { icon: Activity, label: "Service Length", value: yearsService !== null ? `${yearsService} yr${yearsService !== 1 ? "s" : ""}` : "—" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-2">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-muted-foreground leading-none">{item.label}</p>
                    <p className="font-medium mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Pay & Hours */}
          <Card className="p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b">Pay & Hours</h3>
            {[
              ["Salary", worker.salary ? `£${worker.salary.toLocaleString()}` : "—"],
              ["Pay Frequency", "Monthly"],
              ["Weekly Hours", worker.weeklyHours ? `${worker.weeklyHours}h` : "—"],
              ["Work Pattern", "Mon–Fri"],
              ["Shift Type", "Fixed"],
              ["Overtime", "Eligible"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </Card>

          {/* Sponsorship Snapshot */}
          {isSponsored && (
            <Card className="p-4 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Sponsorship
              </h3>
              {[
                ["Visa Type", worker.visaType || "—"],
                ["CoS Ref", worker.cosReference || "—"],
                ["Visa Expiry", worker.visaExpiry ? new Date(worker.visaExpiry).toLocaleDateString("en-GB") : "—"],
                ["Nationality", worker.nationality],
                ["RTW Status", "Verified"],
                ["Work Restrictions", "None"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs gap-2">
                  <span className="text-muted-foreground shrink-0">{k}</span>
                  <span className={cn("font-medium text-right", k === "Visa Expiry" && daysToVisa !== null && daysToVisa < 90 ? "text-warning" : "")}>{v}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Compliance score */}
          <Card className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-2 border-b mb-3">Compliance Score</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: score >= 80 ? "hsl(var(--success))" : score >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))" }}>
                <span className={cn("text-sm font-black", scoreColor)}>{score}</span>
              </div>
              <div>
                <p className={cn("text-sm font-semibold", scoreColor)}>
                  {score >= 80 ? "Low Risk" : score >= 60 ? "Medium Risk" : "High Risk"}
                </p>
                <p className="text-xs text-muted-foreground">Compliance health</p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── RIGHT: Tabbed Content ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Tab list */}
          <div className="border-b mb-4 overflow-x-auto">
            <div className="flex gap-0.5 min-w-max">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <Card className="p-5 min-h-96">
            {renderTab()}
          </Card>
        </div>
      </div>
    </div>
  );
}
