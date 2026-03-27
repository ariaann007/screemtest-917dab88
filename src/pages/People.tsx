import { useState } from "react";
import { DEMO_WORKERS, DEMO_COUNTRIES, DEMO_SOC_CODES, DEMO_WORK_LOCATIONS } from "@/data/demo";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, AlertTriangle, FileText, ChevronRight, X, Upload, CheckCircle2, User, Briefcase, PoundSterling } from "lucide-react";
import { cn } from "@/lib/utils";
import { Worker } from "@/types";
import { LeaverBanner } from "@/components/compliance/LeaverChecklist";
import { VisaRulesAlert, VisaBreachBadge } from "@/components/compliance/VisaRulesAlert";
import { WorkerScoreBadge, calcWorkerScore } from "@/components/compliance/ComplianceScore";

const DOC_CATEGORIES = [
  "Passport", "Visa/BRP", "Right to Work Evidence", "Contract", "Offer Letter",
  "DBS Certificate", "NMC Pin", "Qualification Certificate", "Other",
];

type NewWorkerForm = {
  givenName: string; familyName: string; nationality: string;
  dateOfBirth: string; email: string; phone: string; niNumber: string;
  passportNumber: string; passportExpiry: string;
  visaType: string; otherVisaType: string; cosReference: string; visaExpiry: string;
  jobTitle: string; socCode: string; salary: string; salaryPeriod: string;
  workLocationId: string; startDate: string; weeklyHours: string;
  jobDescription: string;
  nokName: string; nokRelationship: string; nokPhone: string; nokEmail: string;
};

const VISA_TYPES = [
  "Skilled Worker",
  "Student",
  "Graduate",
  "Global Talent",
  "Dependent",
  "ILR (Indefinite Leave to Remain)",
  "Specialist Worker",
  "Other",
];

function AddWorkerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (w: Worker) => void }) {
  const { currentTenant } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<NewWorkerForm>({
    givenName: "", familyName: "", nationality: "", dateOfBirth: "",
    email: "", phone: "", niNumber: "", passportNumber: "", passportExpiry: "",
    visaType: "Skilled Worker", otherVisaType: "", cosReference: "", visaExpiry: "",
    jobTitle: "", socCode: "", salary: "", salaryPeriod: "year",
    workLocationId: "", startDate: "", weeklyHours: "37.5",
    jobDescription: "",
    nokName: "", nokRelationship: "", nokPhone: "", nokEmail: "",
  });

  const set = (k: keyof NewWorkerForm, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSave = !!(form.givenName && form.familyName && form.nationality && form.dateOfBirth);

  const resolvedVisaType = form.visaType === "Other" ? (form.otherVisaType || "Other") : form.visaType;

  const handleSave = () => {
    const newWorker: Worker = {
      id: `w_${Date.now()}`,
      tenantId: currentTenant?.id ?? "t1",
      givenName: form.givenName, familyName: form.familyName,
      nationality: form.nationality, dateOfBirth: form.dateOfBirth,
      email: form.email || undefined, phone: form.phone || undefined,
      niNumber: form.niNumber || undefined, passportNumber: form.passportNumber || undefined,
      passportExpiry: form.passportExpiry || undefined,
      visaType: resolvedVisaType || undefined, cosReference: form.cosReference || undefined,
      visaExpiry: form.visaExpiry || undefined,
      jobTitle: form.jobTitle || undefined, socCode: form.socCode || undefined,
      salary: form.salary ? parseFloat(form.salary) : undefined, salaryPeriod: form.salaryPeriod,
      workLocationId: form.workLocationId || undefined,
      startDate: form.startDate || undefined, weeklyHours: form.weeklyHours ? parseFloat(form.weeklyHours) : undefined,
      jobDescription: form.jobDescription || undefined,
      nextOfKin: form.nokName ? {
        name: form.nokName,
        relationship: form.nokRelationship,
        phone: form.nokPhone,
        email: form.nokEmail || undefined,
      } : undefined,
      status: "active", createdAt: new Date().toISOString(),
    };
    onAdd(newWorker);
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  const countries = DEMO_COUNTRIES.map(c => c.name);
  const socs = DEMO_SOC_CODES;
  const locations = DEMO_WORK_LOCATIONS.filter(l => l.tenantId === (currentTenant?.id ?? "t1"));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Add Sponsored Worker</h2>
            <p className="text-xs text-muted-foreground">Create a new worker compliance file</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Personal */}
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Given Name *</Label><Input value={form.givenName} onChange={e => set("givenName", e.target.value)} className="mt-1" placeholder="e.g. Chioma" /></div>
              <div><Label>Family Name *</Label><Input value={form.familyName} onChange={e => set("familyName", e.target.value)} className="mt-1" placeholder="e.g. Okonkwo" /></div>
              <div>
                <Label>Nationality *</Label>
                <Select value={form.nationality} onValueChange={v => set("nationality", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select country…" /></SelectTrigger>
                  <SelectContent className="max-h-48">{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Date of Birth *</Label><Input type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => set("email", e.target.value)} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => set("phone", e.target.value)} className="mt-1" /></div>
            </div>
          </section>

          {/* Next of Kin */}
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Next of Kin</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Name</Label><Input value={form.nokName} onChange={e => set("nokName", e.target.value)} className="mt-1" /></div>
              <div><Label>Relationship</Label><Input value={form.nokRelationship} onChange={e => set("nokRelationship", e.target.value)} className="mt-1" /></div>
              <div><Label>Contact Phone</Label><Input value={form.nokPhone} onChange={e => set("nokPhone", e.target.value)} className="mt-1" /></div>
              <div><Label>Contact Email</Label><Input value={form.nokEmail} onChange={e => set("nokEmail", e.target.value)} className="mt-1" /></div>
            </div>
          </section>

          {/* Passport */}
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Passport & NI</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Passport Number</Label><Input value={form.passportNumber} onChange={e => set("passportNumber", e.target.value)} className="mt-1" /></div>
              <div><Label>Passport Expiry</Label><Input type="date" value={form.passportExpiry} onChange={e => set("passportExpiry", e.target.value)} className="mt-1" /></div>
              <div><Label>NI Number</Label><Input value={form.niNumber} onChange={e => set("niNumber", e.target.value)} className="mt-1" placeholder="e.g. AB123456C" /></div>
            </div>
          </section>

          {/* Sponsorship */}
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Sponsorship Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Visa Type</Label>
                <Select value={form.visaType} onValueChange={v => set("visaType", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{VISA_TYPES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                </Select>
                {form.visaType === "Other" && (
                  <Input
                    className="mt-2"
                    placeholder="Please specify visa category…"
                    value={form.otherVisaType}
                    onChange={e => set("otherVisaType", e.target.value)}
                  />
                )}
                {form.visaType === "Student" && (
                  <p className="text-xs text-warning mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Student visa — maximum 20 hrs/week (including work for another sponsor)
                  </p>
                )}
              </div>
              <div><Label>CoS Reference</Label><Input value={form.cosReference} onChange={e => set("cosReference", e.target.value)} className="mt-1" placeholder="e.g. C123456789A" /></div>
              <div><Label>Visa Expiry</Label><Input type="date" value={form.visaExpiry} onChange={e => set("visaExpiry", e.target.value)} className="mt-1" /></div>
              <div><Label>Sponsorship Start Date</Label><Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className="mt-1" /></div>
            </div>
          </section>

          {/* Employment */}
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Employment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Job Title</Label><Input value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} className="mt-1" /></div>
              <div>
                <Label>SOC Code</Label>
                <Select value={form.socCode} onValueChange={v => set("socCode", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select SOC…" /></SelectTrigger>
                  <SelectContent className="max-h-48">{socs.map(s => <SelectItem key={s.code} value={s.code}>{s.code} – {s.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Job Description</Label>
                <textarea
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                  value={form.jobDescription}
                  onChange={e => set("jobDescription", e.target.value)}
                  placeholder="Enter summary of duties..."
                />
              </div>
              <div><Label>Annual Salary (£)</Label><Input type="number" value={form.salary} onChange={e => set("salary", e.target.value)} className="mt-1" /></div>
              <div><Label>Weekly Hours</Label><Input type="number" value={form.weeklyHours} onChange={e => set("weeklyHours", e.target.value)} className="mt-1" /></div>
              <div className="col-span-2">
                <Label>Work Location</Label>
                <Select value={form.workLocationId} onValueChange={v => set("workLocationId", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select location…" /></SelectTrigger>
                  <SelectContent>{locations.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {saved
            ? <Button className="ml-auto" disabled><CheckCircle2 className="h-4 w-4 mr-1 text-success" />Worker Added</Button>
            : <Button onClick={handleSave} disabled={!canSave} className="ml-auto">Add Worker</Button>
          }
        </div>
      </div>
    </div>
  );
}

function WorkerDetail({ worker, onClose }: { worker: Worker; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("personal");
  const today = new Date();
  const visaExpiry = worker.visaExpiry ? new Date(worker.visaExpiry) : null;
  const passportExpiry = worker.passportExpiry ? new Date(worker.passportExpiry) : null;
  const daysToVisa = visaExpiry ? Math.ceil((visaExpiry.getTime() - today.getTime()) / 86400000) : null;
  const daysToPassport = passportExpiry ? Math.ceil((passportExpiry.getTime() - today.getTime()) / 86400000) : null;
  const isLeaver = worker.leaverStatus === "leaver";

  const DEMO_DOCS = [
    { id: "d1", name: "Passport", status: "present", expiry: worker.passportExpiry, required: true },
    { id: "d2", name: "Visa/BRP", status: daysToVisa && daysToVisa < 60 ? "expiring_soon" : "present", expiry: worker.visaExpiry, required: true },
    { id: "d3", name: "Right to Work Evidence", status: "present", required: true },
    { id: "d4", name: "Contract", status: "missing", required: true },
    { id: "d5", name: "DBS Certificate", status: "present", required: false },
  ];
  const missingDocs = DEMO_DOCS.filter(d => d.status === "missing" && d.required);

  const longAbsence = worker.absenceRecords?.find(a => a.workingDays > 10);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl bg-background shadow-2xl overflow-hidden animate-slide-in flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary/5 border-b p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner",
                isLeaver ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
              )}>
                {worker.givenName[0]}{worker.familyName[0]}
              </div>
              <div>
                <h2 className="font-bold text-xl leading-tight">{worker.givenName} {worker.familyName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">ID: {worker.id}</span>
                  {isLeaver && <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">LEAVER</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WorkerScoreBadge worker={worker} />
              <button
                onClick={onClose}
                className="h-10 w-10 rounded-xl hover:bg-muted/80 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-background/60 p-2 rounded-lg border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Visa Status</p>
              <p className={cn("text-xs font-semibold mt-0.5", daysToVisa && daysToVisa < 30 ? "text-destructive" : "text-foreground")}>
                {daysToVisa ? `${daysToVisa} days left` : "British/Settled"}
              </p>
            </div>
            <div className="bg-background/60 p-2 rounded-lg border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">SOC Code</p>
              <p className="text-xs font-semibold mt-0.5">{worker.socCode || "—"}</p>
            </div>
            <div className="bg-background/60 p-2 rounded-lg border border-border/50">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Compliance</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${worker.complianceScore ?? 85}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Miniature) */}
        <div className="px-6 border-b bg-background flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: "personal", label: "Personal", icon: User },
            { id: "employment", label: "Employment", icon: Briefcase },
            { id: "immigration", label: "Immigration", icon: FileText },
            { id: "documents", label: "Documents", icon: Upload },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Active Banner/Alerts block */}
          <div className="space-y-3">
            <LeaverBanner worker={worker} />
            <VisaRulesAlert worker={worker} />
            {missingDocs.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl border border-destructive/20 bg-destructive/5 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Missing Documentation</p>
                  <p className="text-xs opacity-80">{missingDocs.length} required file{missingDocs.length !== 1 ? "s" : ""} missing: {missingDocs.map(d => d.name).join(", ")}</p>
                </div>
              </div>
            )}
            {longAbsence && (
              <div className="flex items-start gap-3 p-3 rounded-xl border border-warning/20 bg-warning/5 text-sm text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Absence Threshold Warning</p>
                  <p className="text-xs opacity-80">{longAbsence.workingDays} consecutive days absent — reporting obligation may apply.</p>
                </div>
              </div>
            )}
          </div>

          {activeTab === "personal" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><User className="h-4 w-4 text-primary" /></div>
                  <h3 className="font-bold text-sm tracking-tight">Identity Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                  {[
                    ["Full Name", `${worker.givenName} ${worker.familyName}`],
                    ["Nationality", worker.nationality],
                    ["Date of Birth", worker.dateOfBirth ? new Date(worker.dateOfBirth).toLocaleDateString("en-GB") : "—"],
                    ["NI Number", worker.niNumber || "—"],
                    ["Employee Number", worker.employeeNumber || "—"],
                  ].map(([k, v]) => (
                    <div key={k}><p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{k}</p><p className="text-sm font-semibold">{v}</p></div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center"><User className="h-4 w-4 text-orange-600" /></div>
                  <h3 className="font-bold text-sm tracking-tight">Next of Kin</h3>
                </div>
                {worker.nextOfKin ? (
                  <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-xs text-muted-foreground font-medium uppercase">Name</p><p className="text-sm font-semibold">{worker.nextOfKin.name}</p></div>
                      <div><p className="text-xs text-muted-foreground font-medium uppercase">Relationship</p><p className="text-sm font-semibold">{worker.nextOfKin.relationship}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><p className="text-xs text-muted-foreground font-medium uppercase">Phone</p><p className="text-sm font-semibold">{worker.nextOfKin.phone}</p></div>
                      <div><p className="text-xs text-muted-foreground font-medium uppercase">Email</p><p className="text-sm font-semibold">{worker.nextOfKin.email || "—"}</p></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 border-2 border-dashed rounded-xl">
                    <p className="text-sm text-muted-foreground">No next of kin recorded</p>
                    <Button variant="link" size="sm">Add Contact Info</Button>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "employment" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Briefcase className="h-4 w-4 text-blue-600" /></div>
                  <h3 className="font-bold text-sm tracking-tight">Job Details</h3>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-muted-foreground font-medium uppercase">Job Title</p><p className="text-sm font-semibold">{worker.jobTitle || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground font-medium uppercase">SOC Code</p><p className="text-sm font-semibold font-mono">{worker.socCode || "—"}</p></div>
                  </div>
                  <div><p className="text-xs text-muted-foreground font-medium uppercase">Job Description</p><p className="text-sm text-foreground/80 mt-1 leading-relaxed">{worker.jobDescription || "Detailed job description has not been uploaded for this worker yet."}</p></div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center"><PoundSterling className="h-4 w-4 text-green-600" /></div>
                  <h3 className="font-bold text-sm tracking-tight">Remuneration & Schedule</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                  {[
                    ["Gross Salary", worker.salary ? `£${worker.salary.toLocaleString()} / ${worker.salaryPeriod}` : "—"],
                    ["Hours Per Week", worker.weeklyHours ? `${worker.weeklyHours}h` : "—"],
                    ["Start Date", worker.startDate ? new Date(worker.startDate).toLocaleDateString("en-GB") : "—"],
                    ["Work Location", DEMO_WORK_LOCATIONS.find(l => l.id === worker.workLocationId)?.name || "Main (Birmingham)"],
                  ].map(([k, v]) => (
                    <div key={k}><p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{k}</p><p className="text-sm font-semibold">{v}</p></div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === "immigration" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <ImmigrationForm
                initialData={{
                  fullLegalName: `${worker.givenName} ${worker.familyName}`,
                  dateOfBirth: worker.dateOfBirth,
                  nationalities: worker.nationality ? [worker.nationality] : [],
                  passportNumbers: worker.passportNumber || "",
                  passportExpiry: worker.passportExpiry || "",
                  immigrationCategory: worker.visaType === "Skilled Worker" ? "skilled_worker_company"
                    : worker.visaType === "Student" ? "student_visa"
                    : worker.visaType === "Graduate" ? "graduate_visa"
                    : worker.visaType === "Global Talent" ? "global_talent"
                    : worker.visaType === "Dependent" ? "dependent_visa"
                    : worker.visaType === "ILR (Indefinite Leave to Remain)" ? "settled_status"
                    : worker.visaType ? "other" : "",
                  cosNumber: worker.cosReference || "",
                  swVisaExpiryDate: worker.visaExpiry || "",
                  swVisaStartDate: worker.startDate || "",
                  jobTitleOnCos: worker.jobTitle || "",
                  socCode: worker.socCode || "",
                  salaryOnCos: worker.salary ? `£${worker.salary.toLocaleString()}` : "",
                }}
                onSave={(data) => console.log("Immigration data saved:", data)}
              />
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Upload className="h-4 w-4 text-amber-600" /></div>
                  <h3 className="font-bold text-sm tracking-tight">Document Vault</h3>
                </div>
                {!isLeaver && <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg"><Upload className="h-3 w-3 mr-2" />Upload New</Button>}
              </div>
              <div className="space-y-2">
                {DEMO_DOCS.map(doc => (
                  <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-all hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border group-hover:border-primary/30 transition-colors shadow-sm text-muted-foreground">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{doc.name}</p>
                        {doc.expiry && <p className="text-[11px] text-muted-foreground mt-0.5">Expires {new Date(doc.expiry).toLocaleDateString("en-GB")}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusBadge status={doc.status === "expiring_soon" ? "submitted" : doc.status === "present" ? "approved" : "cancelled"} />
                      {doc.required && <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-1 bg-muted/40 rounded">Required</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/20 flex gap-3">
          <Button variant="outline" className="flex-1 h-11 rounded-xl">Edit Profile</Button>
          <Button className="flex-1 h-11 rounded-xl shadow-lg shadow-primary/20">Generate Report</Button>
        </div>
      </div>
    </div>
  );
}


export default function PeoplePage() {
  const { currentTenant } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [extraWorkers, setExtraWorkers] = useState<Worker[]>([]);
  const [sponsorTab, setSponsorTab] = useState<"all" | "sponsored" | "non_sponsored">("all");

  const baseWorkers = DEMO_WORKERS.filter(w => currentTenant ? w.tenantId === currentTenant.id : true);
  const workers = [...baseWorkers, ...extraWorkers.filter(w => currentTenant ? w.tenantId === currentTenant.id : true)];
  const today = new Date();
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const isSponsored = (w: Worker) => !!w.cosReference;

  const tabWorkers = sponsorTab === "all" ? workers
    : sponsorTab === "sponsored" ? workers.filter(isSponsored)
      : workers.filter(w => !isSponsored(w));

  const filtered = tabWorkers.filter(w => {
    const name = `${w.givenName} ${w.familyName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || w.jobTitle?.toLowerCase().includes(search.toLowerCase());
    const visaExpiring = w.visaExpiry && new Date(w.visaExpiry) < in90;
    const passportExpiring = w.passportExpiry && new Date(w.passportExpiry) < in90;
    const score = w.complianceScore ?? calcWorkerScore(w);
    const matchFilter =
      filter === "all" ? true :
        filter === "leavers" ? w.leaverStatus === "leaver" :
          filter === "at_risk" ? score < 60 :
            filter === "expiring_visa" ? !!visaExpiring :
              filter === "expiring_passport" ? !!passportExpiring :
                filter === "expiring" ? !!(visaExpiring || passportExpiring) :
                  w.status === filter;
    return matchSearch && matchFilter;
  });

  const expiringCount = workers.filter(w => {
    const ve = w.visaExpiry && new Date(w.visaExpiry) < in90;
    const pe = w.passportExpiry && new Date(w.passportExpiry) < in90;
    return ve || pe;
  }).length;

  const leaverCount = workers.filter(w => w.leaverStatus === "leaver").length;
  const atRiskCount = workers.filter(w => (w.complianceScore ?? calcWorkerScore(w)) < 60).length;
  const sponsoredCount = workers.filter(isSponsored).length;
  const nonSponsoredCount = workers.filter(w => !isSponsored(w)).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {selectedWorker && <WorkerDetail worker={selectedWorker} onClose={() => setSelectedWorker(null)} />}
      {showAddWorker && <AddWorkerModal onClose={() => setShowAddWorker(false)} onAdd={w => setExtraWorkers(prev => [...prev, w])} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-muted-foreground">Sponsored and non-sponsored workers</p>
        </div>
        <Button size="sm" onClick={() => setShowAddWorker(true)}><Plus className="h-4 w-4 mr-1" />Add Worker</Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Workers", value: workers.length, color: "text-foreground", tab: "all" as const },
          { label: "Sponsored", value: sponsoredCount, color: "text-primary", tab: "sponsored" as const },
          { label: "Non-Sponsored", value: nonSponsoredCount, color: "text-success", tab: "non_sponsored" as const },
          { label: "Leavers", value: leaverCount, color: "text-muted-foreground", tab: "all" as const },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setSponsorTab(s.tab)}
            className={cn(
              "rounded-xl border bg-card p-4 text-left transition-all hover:shadow-sm",
              sponsorTab === s.tab && s.tab !== "all" && "ring-2 ring-primary"
            )}
          >
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Sponsor type tabs */}
      <div className="flex gap-0 border-b">
        {([
          { id: "all", label: `All Workers (${workers.length})` },
          { id: "sponsored", label: `Sponsored (${sponsoredCount})` },
          { id: "non_sponsored", label: `Non-Sponsored (${nonSponsoredCount})` },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setSponsorTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              sponsorTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Banners */}
      <div className="space-y-2">
        {expiringCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-warning text-sm cursor-pointer" onClick={() => setFilter("expiring")}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{expiringCount} worker{expiringCount !== 1 ? "s" : ""} with documents expiring within 90 days</span>
            <span className="ml-auto text-xs underline">View</span>
          </div>
        )}
        {atRiskCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm cursor-pointer" onClick={() => setFilter("at_risk")}>
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="font-medium">{atRiskCount} worker{atRiskCount !== 1 ? "s" : ""} with compliance score below 60% — action required</span>
            <span className="ml-auto text-xs underline">View</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search workers…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="leavers">Leavers ({leaverCount})</SelectItem>
            <SelectItem value="at_risk">At Risk (&lt;60%)</SelectItem>
            <SelectItem value="expiring">Expiring Soon</SelectItem>
            <SelectItem value="expiring_visa">Visa Expiring</SelectItem>
            <SelectItem value="expiring_passport">Passport Expiring</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Worker</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Job Title / SOC</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left p-3 font-medium text-muted-foreground">CoS / Visa Info</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No workers found</td></tr>}
            {filtered.map(w => {
              const visaExpiry = w.visaExpiry ? new Date(w.visaExpiry) : null;
              const daysVisa = visaExpiry ? Math.ceil((visaExpiry.getTime() - today.getTime()) / 86400000) : null;
              const isLeaver = w.leaverStatus === "leaver";
              const sponsored = isSponsored(w);
              return (
                <tr key={w.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedWorker(w)}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                        isLeaver ? "bg-muted text-muted-foreground" : sponsored ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                      )}>
                        {w.givenName[0]}{w.familyName[0]}
                      </div>
                      <div>
                        <p className="font-medium">{w.givenName} {w.familyName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-xs text-muted-foreground">{w.nationality}</p>
                          {isLeaver && <span className="text-[10px] font-semibold px-1.5 py-0 rounded-full bg-muted text-muted-foreground border">Leaver</span>}
                          <VisaBreachBadge worker={w} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3"><p className="font-medium">{w.jobTitle || "—"}</p><p className="text-xs text-muted-foreground">{w.socCode}</p></td>
                  <td className="p-3">
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full border",
                      sponsored ? "bg-primary/10 text-primary border-primary/20" : "bg-success/10 text-success border-success/20"
                    )}>
                      {sponsored ? "Sponsored" : "Non-Sponsored"}
                    </span>
                  </td>
                  <td className="p-3">
                    {sponsored ? (
                      <div>
                        <p className="font-mono text-xs">{w.cosReference}</p>
                        {visaExpiry && (
                          <span className={cn("text-xs", daysVisa !== null && daysVisa < 30 ? "text-destructive font-medium" : daysVisa !== null && daysVisa < 90 ? "text-warning" : "text-muted-foreground")}>
                            {visaExpiry.toLocaleDateString("en-GB")}
                            {daysVisa !== null && daysVisa < 90 && <span className="ml-1">({daysVisa}d)</span>}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">{w.visaType || "British / Settled"}</span>
                    )}
                  </td>
                  <td className="p-3"><WorkerScoreBadge worker={w} /></td>
                  <td className="p-3"><StatusBadge status={w.status} /></td>
                  <td className="p-3 text-right"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground">
          {filtered.length} of {workers.length} workers · {sponsoredCount} sponsored · {nonSponsoredCount} non-sponsored
        </div>
      </div>
    </div>
  );
}



