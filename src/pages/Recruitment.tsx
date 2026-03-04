import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Plus, X, Briefcase, MapPin, Clock, Users, ChevronRight,
  CheckCircle2, Eye, FileText, ArrowLeft, Search,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type ContractType = "full_time" | "part_time" | "contract" | "bank";
type VacancyStatus = "open" | "closed" | "draft";
type ApplicationStatus = "new" | "shortlisted" | "interview" | "offered" | "rejected";

interface Vacancy {
  id: string;
  title: string;
  department: string;
  location: string;
  contractType: ContractType;
  salaryFrom: number;
  salaryTo: number;
  description: string;
  requirements: string;
  status: VacancyStatus;
  createdAt: string;
  applicationCount: number;
}

interface Application {
  id: string;
  vacancyId: string;
  givenName: string;
  familyName: string;
  email: string;
  phone: string;
  nationality: string;
  rightToWork: string;
  coverLetter: string;
  cvFileName?: string;
  linkedIn?: string;
  status: ApplicationStatus;
  submittedAt: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────────
const INITIAL_VACANCIES: Vacancy[] = [
  {
    id: "v1", title: "Senior Care Worker", department: "Residential Care",
    location: "Birmingham", contractType: "full_time",
    salaryFrom: 26000, salaryTo: 29000,
    description: "We are looking for an experienced Senior Care Worker to join our residential team. You will support residents with daily living activities, lead a small team of care assistants, and ensure compliance with CQC standards.",
    requirements: "NVQ Level 3 in Health & Social Care or equivalent. Minimum 2 years experience in a care setting. Strong communication and leadership skills.",
    status: "open", createdAt: "2026-02-10T09:00:00Z", applicationCount: 0,
  },
  {
    id: "v2", title: "Registered Nurse (RGN)", department: "Nursing",
    location: "Manchester", contractType: "full_time",
    salaryFrom: 35000, salaryTo: 42000,
    description: "An exciting opportunity for a Registered General Nurse to join our growing nursing team. You will deliver clinical care, manage medication administration, and liaise with multidisciplinary teams.",
    requirements: "Active NMC PIN. Minimum 1 year post-qualifying experience. Experience in elderly or residential care preferred.",
    status: "open", createdAt: "2026-02-15T09:00:00Z", applicationCount: 0,
  },
];

const CONTRACT_LABELS: Record<ContractType, string> = {
  full_time: "Full Time", part_time: "Part Time", contract: "Contract", bank: "Bank / Relief",
};

const APP_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: "New", shortlisted: "Shortlisted", interview: "Interview", offered: "Offered", rejected: "Rejected",
};

const APP_STATUS_COLORS: Record<ApplicationStatus, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  shortlisted: "bg-warning/10 text-warning border-warning/20",
  interview: "bg-secondary/10 text-secondary border-secondary/20",
  offered: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

// ── Add Vacancy Modal ──────────────────────────────────────────────────────────
function AddVacancyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: Vacancy) => void }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    title: "", department: "", location: "", contractType: "full_time" as ContractType,
    salaryFrom: "", salaryTo: "", description: "", requirements: "", status: "open" as VacancyStatus,
  });
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSave = !!(form.title && form.department && form.location && form.description);

  const handleSave = () => {
    onAdd({
      id: `v_${Date.now()}`,
      title: form.title, department: form.department, location: form.location,
      contractType: form.contractType,
      salaryFrom: parseFloat(form.salaryFrom) || 0,
      salaryTo: parseFloat(form.salaryTo) || 0,
      description: form.description, requirements: form.requirements,
      status: form.status, createdAt: new Date().toISOString(), applicationCount: 0,
    });
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Post New Vacancy</h2>
            <p className="text-xs text-muted-foreground">Create a new job listing</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Role Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Job Title *</Label><Input className="mt-1" value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Senior Care Worker" /></div>
              <div><Label>Department *</Label><Input className="mt-1" value={form.department} onChange={e => set("department", e.target.value)} placeholder="e.g. Residential Care" /></div>
              <div><Label>Location *</Label><Input className="mt-1" value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Birmingham" /></div>
              <div>
                <Label>Contract Type</Label>
                <Select value={form.contractType} onValueChange={v => set("contractType", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONTRACT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v as VacancyStatus)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Salary From (£)</Label><Input type="number" className="mt-1" value={form.salaryFrom} onChange={e => set("salaryFrom", e.target.value)} /></div>
              <div><Label>Salary To (£)</Label><Input type="number" className="mt-1" value={form.salaryTo} onChange={e => set("salaryTo", e.target.value)} /></div>
            </div>
          </section>
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Job Description</h3>
            <div className="space-y-3">
              <div><Label>Description *</Label><Textarea className="mt-1 min-h-[100px]" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Describe the role and responsibilities…" /></div>
              <div><Label>Requirements</Label><Textarea className="mt-1 min-h-[80px]" value={form.requirements} onChange={e => set("requirements", e.target.value)} placeholder="Qualifications, experience, skills required…" /></div>
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {saved
            ? <Button className="ml-auto" disabled><CheckCircle2 className="h-4 w-4 mr-1" />Vacancy Posted</Button>
            : <Button onClick={handleSave} disabled={!canSave} className="ml-auto">Post Vacancy</Button>}
        </div>
      </div>
    </div>
  );
}

// ── Application Form Modal ─────────────────────────────────────────────────────
function ApplyModal({ vacancy, onClose, onSubmit }: { vacancy: Vacancy; onClose: () => void; onSubmit: (a: Application) => void }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    givenName: "", familyName: "", email: "", phone: "", nationality: "",
    rightToWork: "", coverLetter: "", linkedIn: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const canSave = !!(form.givenName && form.familyName && form.email && form.rightToWork);

  const handleSubmit = () => {
    onSubmit({
      id: `a_${Date.now()}`,
      vacancyId: vacancy.id,
      givenName: form.givenName, familyName: form.familyName,
      email: form.email, phone: form.phone, nationality: form.nationality,
      rightToWork: form.rightToWork, coverLetter: form.coverLetter,
      linkedIn: form.linkedIn || undefined,
      status: "new", submittedAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-xl bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">Apply for {vacancy.title}</h2>
            <p className="text-xs text-muted-foreground">{vacancy.location} · {CONTRACT_LABELS[vacancy.contractType]}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-5">
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Personal Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Given Name *</Label><Input className="mt-1" value={form.givenName} onChange={e => set("givenName", e.target.value)} /></div>
              <div><Label>Family Name *</Label><Input className="mt-1" value={form.familyName} onChange={e => set("familyName", e.target.value)} /></div>
              <div><Label>Email *</Label><Input type="email" className="mt-1" value={form.email} onChange={e => set("email", e.target.value)} /></div>
              <div><Label>Phone</Label><Input className="mt-1" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
              <div><Label>Nationality</Label><Input className="mt-1" value={form.nationality} onChange={e => set("nationality", e.target.value)} /></div>
              <div>
                <Label>Right to Work in UK *</Label>
                <Select value={form.rightToWork} onValueChange={v => set("rightToWork", v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes_unrestricted">Yes — Unrestricted</SelectItem>
                    <SelectItem value="yes_visa">Yes — Visa / Limited Leave</SelectItem>
                    <SelectItem value="requires_sponsorship">Requires Sponsorship</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
          <section>
            <h3 className="font-semibold text-sm mb-3 pb-2 border-b">Application</h3>
            <div className="space-y-3">
              <div><Label>Cover Letter / Supporting Statement</Label><Textarea className="mt-1 min-h-[120px]" value={form.coverLetter} onChange={e => set("coverLetter", e.target.value)} placeholder="Tell us why you're a great fit for this role…" /></div>
              <div><Label>LinkedIn Profile URL</Label><Input className="mt-1" value={form.linkedIn} onChange={e => set("linkedIn", e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
              <div>
                <Label>CV / Resume</Label>
                <div className="mt-1 flex items-center gap-2 border border-dashed rounded-lg p-3 text-sm text-muted-foreground cursor-pointer hover:bg-muted/30 transition-colors">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>Click to upload CV (PDF, DOCX) — coming soon</span>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {saved
            ? <Button className="ml-auto" disabled><CheckCircle2 className="h-4 w-4 mr-1" />Application Submitted!</Button>
            : <Button onClick={handleSubmit} disabled={!canSave} className="ml-auto">Submit Application</Button>}
        </div>
      </div>
    </div>
  );
}

// ── Application Detail Drawer ──────────────────────────────────────────────────
function ApplicationDetail({ app, onClose, onStatusChange }: {
  app: Application; onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-xl shadow-2xl overflow-y-auto max-h-[85vh]" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <h2 className="font-bold">{app.givenName} {app.familyName}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", APP_STATUS_COLORS[app.status])}>
              {APP_STATUS_LABELS[app.status]}
            </span>
            <span className="text-xs text-muted-foreground">Applied {new Date(app.submittedAt).toLocaleDateString("en-GB")}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium">{app.email}</p></div>
            <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{app.phone || "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Nationality</p><p className="font-medium">{app.nationality || "—"}</p></div>
            <div>
              <p className="text-xs text-muted-foreground">Right to Work</p>
              <p className="font-medium">
                {app.rightToWork === "yes_unrestricted" ? "Yes — Unrestricted"
                  : app.rightToWork === "yes_visa" ? "Yes — Visa"
                  : app.rightToWork === "requires_sponsorship" ? "Requires Sponsorship"
                  : "No"}
              </p>
            </div>
          </div>

          {app.coverLetter && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Cover Letter</p>
              <p className="text-sm bg-muted/40 rounded-lg p-3 leading-relaxed">{app.coverLetter}</p>
            </div>
          )}

          {app.linkedIn && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">LinkedIn</p>
              <a href={app.linkedIn} target="_blank" rel="noreferrer" className="text-sm text-primary underline">{app.linkedIn}</a>
            </div>
          )}

          <div>
            <p className="text-xs text-muted-foreground mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(APP_STATUS_LABELS) as ApplicationStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => { onStatusChange(app.id, s); onClose(); }}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                    app.status === s ? APP_STATUS_COLORS[s] : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {APP_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Vacancy Detail View ────────────────────────────────────────────────────────
function VacancyDetail({ vacancy, applications, onBack, onApply, onStatusChange }: {
  vacancy: Vacancy;
  applications: Application[];
  onBack: () => void;
  onApply: () => void;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
}) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  return (
    <div className="space-y-5 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to vacancies
      </button>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">{vacancy.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vacancy.location}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{CONTRACT_LABELS[vacancy.contractType]}</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{vacancy.department}</span>
              {vacancy.salaryFrom > 0 && (
                <span>£{vacancy.salaryFrom.toLocaleString()} – £{vacancy.salaryTo.toLocaleString()} / year</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border",
              vacancy.status === "open" ? "bg-success/10 text-success border-success/20"
              : vacancy.status === "draft" ? "bg-muted text-muted-foreground border-border"
              : "bg-destructive/10 text-destructive border-destructive/20"
            )}>
              {vacancy.status.charAt(0).toUpperCase() + vacancy.status.slice(1)}
            </span>
            {vacancy.status === "open" && (
              <Button size="sm" onClick={onApply}>Apply Now</Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Job Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{vacancy.description}</p>
          </div>
          {vacancy.requirements && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Requirements</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{vacancy.requirements}</p>
            </div>
          )}
        </div>
      </div>

      {/* Applications */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Applications
            <span className="text-xs bg-muted rounded-full px-2 py-0.5">{applications.length}</span>
          </h3>
        </div>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {applications.map(app => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/40 transition-colors text-left group"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {app.givenName[0]}{app.familyName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{app.givenName} {app.familyName}</p>
                  <p className="text-xs text-muted-foreground">{app.email} · Applied {new Date(app.submittedAt).toLocaleDateString("en-GB")}</p>
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border shrink-0", APP_STATUS_COLORS[app.status])}>
                  {APP_STATUS_LABELS[app.status]}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedApp && (
        <ApplicationDetail
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RecruitmentPage() {
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddVacancy, setShowAddVacancy] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VacancyStatus | "all">("all");

  const filtered = vacancies.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase()) ||
      v.department.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddVacancy = (v: Vacancy) => {
    setVacancies(prev => [v, ...prev]);
  };

  const handleSubmitApplication = (app: Application) => {
    setApplications(prev => [app, ...prev]);
    setVacancies(prev => prev.map(v => v.id === app.vacancyId ? { ...v, applicationCount: v.applicationCount + 1 } : v));
  };

  const handleStatusChange = (appId: string, status: ApplicationStatus) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
  };

  const vacancyApplications = selectedVacancy
    ? applications.filter(a => a.vacancyId === selectedVacancy.id)
    : [];

  if (selectedVacancy) {
    return (
      <div className="space-y-6 animate-fade-in">
        <VacancyDetail
          vacancy={selectedVacancy}
          applications={vacancyApplications}
          onBack={() => setSelectedVacancy(null)}
          onApply={() => setShowApply(true)}
          onStatusChange={handleStatusChange}
        />
        {showApply && (
          <ApplyModal
            vacancy={selectedVacancy}
            onClose={() => setShowApply(false)}
            onSubmit={handleSubmitApplication}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recruitment</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage vacancies and candidate applications</p>
        </div>
        <Button onClick={() => setShowAddVacancy(true)}>
          <Plus className="h-4 w-4 mr-1" /> Post Vacancy
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Open Vacancies</p>
          <p className="text-2xl font-bold">{vacancies.filter(v => v.status === "open").length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Applications</p>
          <p className="text-2xl font-bold">{applications.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Shortlisted</p>
          <p className="text-2xl font-bold">{applications.filter(a => a.status === "shortlisted" || a.status === "interview" || a.status === "offered").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search vacancies…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(["all", "open", "draft", "closed"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Vacancy list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No vacancies found</p>
            <p className="text-sm mt-1">Post your first vacancy to get started</p>
          </div>
        )}
        {filtered.map(v => {
          const appCount = applications.filter(a => a.vacancyId === v.id).length;
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVacancy(v)}
              className="w-full rounded-xl border bg-card p-5 text-left hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-base">{v.title}</h3>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border",
                      v.status === "open" ? "bg-success/10 text-success border-success/20"
                      : v.status === "draft" ? "bg-muted text-muted-foreground border-border"
                      : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{v.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{CONTRACT_LABELS[v.contractType]}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{v.department}</span>
                    {v.salaryFrom > 0 && <span>£{v.salaryFrom.toLocaleString()} – £{v.salaryTo.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold">{appCount}</p>
                    <p className="text-xs text-muted-foreground">applicant{appCount !== 1 ? "s" : ""}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              {v.description && (
                <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{v.description}</p>
              )}
            </button>
          );
        })}
      </div>

      {showAddVacancy && (
        <AddVacancyModal onClose={() => setShowAddVacancy(false)} onAdd={handleAddVacancy} />
      )}
    </div>
  );
}
