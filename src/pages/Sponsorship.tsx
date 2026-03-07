import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DEMO_CASES, DEMO_WORKERS, DEMO_COUNTRIES } from "@/data/demo";
import { COUNTRIES } from "@/data/countries";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { SLATimer } from "@/components/SLATimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Search, ChevronRight, ArrowLeft, Award, Users, Building2,
  FileText, CheckCircle2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import CosWizard from "@/components/sponsorship/CosWizard";

// ─── Reporting constants (inlined from old Reporting page) ────────────────────
const REPORT_TYPES = [
  { id: "stop", label: "Stop sponsoring worker", desc: "The sponsorship has ended" },
  { id: "continue", label: "Continue sponsoring worker", desc: "Absence without permission" },
  { id: "change", label: "Change in worker circumstances", desc: "Location, salary, or role changes" },
  { id: "withdraw", label: "Previous notification withdrawn", desc: "Retract an earlier report" },
];
const STOP_REASONS = [
  "Failed to take up position", "Resigned after commencing", "Dismissed", "Made redundant",
  "Work completed early", "Moved to another sponsor", "Moved to another immigration category",
  "Extended unpaid leave", "Left UK/offshore",
];
const CHANGE_TYPES = ["Work location changed", "Job title/duties changed", "Salary/hours changed"];
const BIZ_OPTIONS = [
  { id: "replace_ao", label: "Replace Authorising Officer", icon: "🔄" },
  { id: "amend_ao", label: "Amend AO Details", icon: "✏️" },
  { id: "replace_contact", label: "Replace Key Contact Person", icon: "👤" },
  { id: "amend_org", label: "Amend Organisation Details", icon: "🏢" },
  { id: "other", label: "Other Sponsor Changes", icon: "📋" },
];
const ORG_REASONS = [
  "Merger", "Demerger", "Takeover", "Acquisition", "Sale of business", "Rebranding",
  "Business incorporated under new name", "Branch closed", "Downsized premises",
  "Expanded premises", "Lease expired", "Moved premises", "Property reason change",
  "Update company house number", "Other",
];

// ─── Searchable Select helper ─────────────────────────────────────────────────
function SearchableSelect({ value, onChange, options, placeholder, id }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string; id?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        <div className="p-2">
          <Input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} className="h-7 text-xs" />
        </div>
        {filtered.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ─── Report Migrant section ───────────────────────────────────────────────────
function ReportMigrantSection({ onBack }: { onBack: () => void }) {
  const { currentTenant } = useApp();
  const [view, setView] = useState<"select" | "type" | "form">("select");
  const [reportType, setReportType] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [workerSearch, setWorkerSearch] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const workers = DEMO_WORKERS.filter(w => currentTenant ? w.tenantId === currentTenant.id : true);
  const filteredWorkers = workers.filter(w =>
    !workerSearch || `${w.givenName} ${w.familyName}`.toLowerCase().includes(workerSearch.toLowerCase())
  );
  const update = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));
  const selectedWorkerObj = DEMO_WORKERS.find(w => w.id === selectedWorker);

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold mb-2">Report Submitted</h2>
        <p className="text-muted-foreground text-sm mb-6">Your migrant report has been submitted and assigned to a SCREEM caseworker.</p>
        <Button onClick={() => { setSubmitted(false); setView("select"); setFormData({}); setSelectedWorker(null); setReportType(""); }}>
          Submit Another Report
        </Button>
      </div>
    );
  }

  if (view === "select") {
    return (
      <div className="max-w-xl space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h2 className="text-xl font-bold">Report a Migrant</h2>
            <p className="text-sm text-muted-foreground">Select the worker to report on</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search workers…" className="pl-9" value={workerSearch} onChange={e => setWorkerSearch(e.target.value)} />
        </div>
        <div className="space-y-2">
          {filteredWorkers.map(w => (
            <button key={w.id} onClick={() => { setSelectedWorker(w.id); setView("type"); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {w.givenName[0]}{w.familyName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{w.givenName} {w.familyName}</p>
                <p className="text-xs text-muted-foreground">{w.jobTitle} · Visa expires {w.visaExpiry ? new Date(w.visaExpiry).toLocaleDateString("en-GB") : "N/A"}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "type" && selectedWorkerObj) {
    return (
      <div className="max-w-xl space-y-5 animate-fade-in">
        <button onClick={() => setView("select")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {selectedWorkerObj.givenName[0]}{selectedWorkerObj.familyName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{selectedWorkerObj.givenName} {selectedWorkerObj.familyName}</h2>
            <p className="text-sm text-muted-foreground">{selectedWorkerObj.jobTitle} · CoS: {selectedWorkerObj.cosReference}</p>
          </div>
        </div>
        <p className="text-sm font-medium">Choose report type:</p>
        <div className="space-y-2">
          {REPORT_TYPES.map(r => (
            <button key={r.id} onClick={() => { setReportType(r.id); setView("form"); }}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (view === "form" && selectedWorkerObj) {
    return (
      <div className="max-w-xl space-y-5 animate-fade-in">
        <button onClick={() => { setView("type"); setReportType(""); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="text-xl font-bold">{REPORT_TYPES.find(r => r.id === reportType)?.label}</h2>
        <div className="space-y-4">
          {reportType === "stop" && (<>
            <div><Label>Reason *</Label>
              <Select value={formData.reason ?? ""} onValueChange={v => update("reason", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select reason…" /></SelectTrigger>
                <SelectContent>{STOP_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date Sponsorship Ended *</Label><Input type="date" value={formData.endDate ?? ""} onChange={e => update("endDate", e.target.value)} className="mt-1" /></div>
            <div><Label>Detailed Explanation</Label><Textarea value={formData.explanation ?? ""} onChange={e => update("explanation", e.target.value)} className="mt-1" rows={4} /></div>
            <div><Label>Last Known Address</Label><Input placeholder="Address" value={formData.lastAddress ?? ""} onChange={e => update("lastAddress", e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Phone</Label><Input value={formData.phone ?? ""} onChange={e => update("phone", e.target.value)} className="mt-1" /></div>
              <div><Label>Email</Label><Input type="email" value={formData.email ?? ""} onChange={e => update("email", e.target.value)} className="mt-1" /></div>
            </div>
          </>)}
          {reportType === "continue" && (<>
            <div><Label>Why are you continuing to sponsor?</Label><Textarea value={formData.reason ?? ""} onChange={e => update("reason", e.target.value)} className="mt-1" rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Worker Start Date</Label><Input type="date" value={formData.startDate ?? ""} onChange={e => update("startDate", e.target.value)} className="mt-1" /></div>
              <div><Label>Date Absent Without Permission</Label><Input type="date" value={formData.absentDate ?? ""} onChange={e => update("absentDate", e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Is worker offshore?</Label>
              <Select value={formData.offshore ?? ""} onValueChange={v => update("offshore", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Full Details</Label><Textarea value={formData.details ?? ""} onChange={e => update("details", e.target.value)} className="mt-1" rows={4} /></div>
          </>)}
          {reportType === "change" && (<>
            <div><Label>Change Type *</Label>
              <Select value={formData.changeType ?? ""} onValueChange={v => update("changeType", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select change…" /></SelectTrigger>
                <SelectContent>{CHANGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date of Change *</Label><Input type="date" value={formData.changeDate ?? ""} onChange={e => update("changeDate", e.target.value)} className="mt-1" /></div>
            <div><Label>Details</Label><Textarea value={formData.details ?? ""} onChange={e => update("details", e.target.value)} className="mt-1" rows={4} /></div>
          </>)}
          {reportType === "withdraw" && (<>
            <div><Label>Date of Previous Notification *</Label><Input type="date" value={formData.prevDate ?? ""} onChange={e => update("prevDate", e.target.value)} className="mt-1" /></div>
            <div><Label>Details</Label><Textarea value={formData.details ?? ""} onChange={e => update("details", e.target.value)} className="mt-1" rows={4} /></div>
          </>)}
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold text-sm mb-3">Report Filed?</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Filed Date</Label><Input type="date" value={formData.filedDate ?? ""} onChange={e => update("filedDate", e.target.value)} className="mt-1" /></div>
          </div>
          <div className="mt-3"><Label>Outcome Notes</Label><Textarea value={formData.outcome ?? ""} onChange={e => update("outcome", e.target.value)} className="mt-1" rows={2} /></div>
          <div className="mt-3 border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
            <p className="text-sm text-muted-foreground">📎 Attach proof of submission</p>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => { setView("type"); setReportType(""); }}>Cancel</Button>
          <Button className="flex-1" onClick={() => setSubmitted(true)}>Submit Report</Button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Report Business section ──────────────────────────────────────────────────
function ReportBusinessSection({ onBack }: { onBack: () => void }) {
  const [reportType, setReportType] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const update = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }));
  const countries = COUNTRIES.map(c => ({ value: c.name, label: c.name }));

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold mb-2">Report Submitted</h2>
        <p className="text-muted-foreground text-sm mb-6">Your business report has been submitted and will be processed by a SCREEM caseworker.</p>
        <Button onClick={() => { setSubmitted(false); setReportType(""); setFormData({}); }}>Submit Another Report</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div>
          <h2 className="text-xl font-bold">Report a Business</h2>
          <p className="text-sm text-muted-foreground">Organisation and sponsor licence changes</p>
        </div>
      </div>

      {!reportType ? (
        <div className="space-y-2">
          {BIZ_OPTIONS.map(o => (
            <button key={o.id} onClick={() => setReportType(o.id)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border hover:border-secondary hover:bg-secondary/5 transition-colors text-left">
              <span className="text-xl">{o.icon}</span>
              <span className="font-medium">{o.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setReportType("")} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
            <h3 className="font-semibold">{BIZ_OPTIONS.find(o => o.id === reportType)?.label}</h3>
          </div>

          {(reportType === "replace_ao" || reportType === "amend_ao") && (
            <div className="rounded-lg bg-info-light border border-info/20 p-4 text-sm text-info">
              ℹ This will create an internal support ticket with instructions for SCREEM to process the AO change.
              <Button size="sm" className="mt-3 w-full" onClick={() => setSubmitted(true)}>Create Support Ticket</Button>
            </div>
          )}

          {reportType === "replace_contact" && (<>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Title</Label><Input value={formData.title ?? ""} onChange={e => update("title", e.target.value)} className="mt-1" /></div>
              <div><Label>Given Name</Label><Input value={formData.givenName ?? ""} onChange={e => update("givenName", e.target.value)} className="mt-1" /></div>
              <div><Label>Family Name</Label><Input value={formData.familyName ?? ""} onChange={e => update("familyName", e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={formData.email ?? ""} onChange={e => update("email", e.target.value)} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={formData.phone ?? ""} onChange={e => update("phone", e.target.value)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date of Birth</Label><Input type="date" value={formData.dob ?? ""} onChange={e => update("dob", e.target.value)} className="mt-1" /></div>
              <div><Label>Nationality</Label>
                <div className="mt-1">
                  <SearchableSelect value={formData.nationality ?? ""} onChange={v => update("nationality", v)} options={countries} placeholder="Select nationality…" />
                </div>
              </div>
            </div>
            <div><Label>Position in Organisation</Label><Input value={formData.position ?? ""} onChange={e => update("position", e.target.value)} className="mt-1" /></div>
            <div><Label>Has NI Number?</Label>
              <Select value={formData.hasNI ?? ""} onValueChange={v => update("hasNI", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
            </div>
            {formData.hasNI === "yes" && <div><Label>NI Number</Label><Input value={formData.niNumber ?? ""} onChange={e => update("niNumber", e.target.value)} className="mt-1" /></div>}
            <div><Label>Criminal Convictions?</Label>
              <Select value={formData.convictions ?? ""} onValueChange={v => update("convictions", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
              </Select>
            </div>
            {formData.convictions === "yes" && <div><Label>Details</Label><Textarea value={formData.convDetails ?? ""} onChange={e => update("convDetails", e.target.value)} className="mt-1" rows={3} /></div>}
            <Button className="w-full" onClick={() => setSubmitted(true)}>Submit Report</Button>
          </>)}

          {reportType === "amend_org" && (<>
            <div><Label>Reason *</Label>
              <Select value={formData.orgReason ?? ""} onValueChange={v => update("orgReason", v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select reason…" /></SelectTrigger>
                <SelectContent>{ORG_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {formData.orgReason === "Other" && <div><Label>Reason (max 250 chars)</Label><Input value={formData.orgOtherReason ?? ""} onChange={e => update("orgOtherReason", e.target.value.slice(0, 250))} className="mt-1" /></div>}
            <div><Label>Date of Change</Label><Input type="date" value={formData.changeDate ?? ""} onChange={e => update("changeDate", e.target.value)} className="mt-1" /></div>
            <div><Label>Explanation (max 2000 chars)</Label><Textarea value={formData.explanation ?? ""} onChange={e => update("explanation", e.target.value.slice(0, 2000))} className="mt-1" rows={5} /><p className="text-xs text-muted-foreground mt-1">{(formData.explanation ?? "").length}/2000</p></div>
            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/30"><p className="text-sm text-muted-foreground">📎 Attach evidence documents</p></div>
            <Button className="w-full" onClick={() => setSubmitted(true)}>Submit Report</Button>
          </>)}

          {reportType === "other" && (<>
            <div><Label>Description *</Label><Textarea value={formData.description ?? ""} onChange={e => update("description", e.target.value.slice(0, 2000))} className="mt-1" rows={5} placeholder="Describe the change…" /></div>
            <div><Label>Date of Change</Label><Input type="date" value={formData.changeDate ?? ""} onChange={e => update("changeDate", e.target.value)} className="mt-1" /></div>
            <Button className="w-full" onClick={() => setSubmitted(true)}>Submit Report</Button>
          </>)}
        </div>
      )}
    </div>
  );
}

// ─── CoS (Certificate of Sponsorship) section ────────────────────────────────
function CosSection() {
  const { currentTenant } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState<"landing" | "wizard" | "list">("landing");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const cases = DEMO_CASES.filter(c =>
    c.type === "cos_draft" &&
    (currentTenant ? c.tenantId === currentTenant.id : true)
  );
  const filtered = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (view === "wizard") {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setView("landing")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Certificate of Sponsorship
        </button>
        <CosWizard onComplete={() => setView("landing")} />
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setView("landing")} className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">Case History</h2>
              <p className="text-sm text-muted-foreground">Manage your CoS drafts and submissions</p>
            </div>
          </div>
          <Button onClick={() => setView("wizard")}><Plus className="h-4 w-4 mr-2" /> New CoS Draft</Button>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search cases…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="awaiting_client">Awaiting Client</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="filed">Filed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">Case</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Worker</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Due Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">SLA</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No cases found</td></tr>
              )}
              {filtered.map(c => {
                const worker = DEMO_WORKERS.find(w => w.id === c.workerId);
                return (
                  <tr key={c.id} className={cn("border-b last:border-0 hover:bg-muted/20 transition-colors", c.isOverdue && "overdue-indicator")}>
                    <td className="p-3">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.caseNumber}</p>
                    </td>
                    <td className="p-3">
                      {worker ? <span className="text-sm">{worker.givenName} {worker.familyName}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3"><StatusBadge status={c.status} /></td>
                    <td className="p-3 text-sm">{c.dueDate ? new Date(c.dueDate).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="p-3">{c.dueDate && <SLATimer dueDate={c.dueDate} isOverdue={c.isOverdue} compact />}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/sponsorship/${c.id}`}><ChevronRight className="h-4 w-4" /></Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // CoS landing
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">Certificate of Sponsorship</h2>
        <p className="text-muted-foreground text-sm">Create and manage CoS pre-drafts for prospective workers</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        <button
          onClick={() => setView("wizard")}
          className="group rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 p-6 text-left transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold mb-1">New CoS Draft</h3>
          <p className="text-sm text-muted-foreground">Start a new Certificate of Sponsorship pre-draft.</p>
          <div className="mt-3 flex items-center text-primary font-semibold text-sm">
            Start Draft <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </button>
        <button
          onClick={() => setView("list")}
          className="group rounded-2xl border-2 border-border hover:border-secondary hover:bg-secondary/5 p-6 text-left transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Search className="h-5 w-5 text-secondary" />
          </div>
          <h3 className="font-semibold mb-1">Case History</h3>
          <p className="text-sm text-muted-foreground">View and manage existing CoS drafts and submissions.</p>
          <div className="mt-3 flex items-center text-secondary font-semibold text-sm">
            View Cases <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </button>
      </div>
      {cases.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Recent Drafts</h3>
            <button onClick={() => setView("list")} className="text-xs text-primary hover:underline">View all</button>
          </div>
          <div className="rounded-xl border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Case</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Worker</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">SLA</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map(c => {
                  const worker = DEMO_WORKERS.find(w => w.id === c.workerId);
                  return (
                    <tr key={c.id} className={cn("border-b last:border-0 hover:bg-muted/20 transition-colors", c.isOverdue && "overdue-indicator")}>
                      <td className="p-3">
                        <p className="font-medium">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.caseNumber}</p>
                      </td>
                      <td className="p-3">{worker ? <span>{worker.givenName} {worker.familyName}</span> : <span className="text-muted-foreground">—</span>}</td>
                      <td className="p-3"><StatusBadge status={c.status} /></td>
                      <td className="p-3">{c.dueDate && <SLATimer dueDate={c.dueDate} isOverdue={c.isOverdue} compact />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Sponsorship Page ────────────────────────────────────────────────────
type SponsorshipSection = "cos" | "migrant" | "business" | null;

export default function SponsorshipPage() {
  const [activeSection, setActiveSection] = useState<SponsorshipSection>(null);
  const { id } = useParams();

  // Handle case detail view (deep-link)
  if (id) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Sponsorship
        </button>
        <div className="rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Case Detail: {id}</h1>
          <p className="text-muted-foreground">Detail view is under construction.</p>
        </div>
      </div>
    );
  }

  // Section views
  if (activeSection === "cos") {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setActiveSection(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Sponsorship
        </button>
        <CosSection />
      </div>
    );
  }
  if (activeSection === "migrant") {
    return (
      <div className="animate-fade-in">
        <ReportMigrantSection onBack={() => setActiveSection(null)} />
      </div>
    );
  }
  if (activeSection === "business") {
    return (
      <div className="animate-fade-in">
        <ReportBusinessSection onBack={() => setActiveSection(null)} />
      </div>
    );
  }

  // Landing — 3 option cards
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sponsorship</h1>
        <p className="text-muted-foreground">Manage UKVI sponsorship obligations and reporting</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <button
          onClick={() => setActiveSection("cos")}
          className="group relative flex flex-col items-start p-6 bg-card rounded-2xl border-2 border-transparent hover:border-primary/30 hover:bg-primary/[0.02] transition-all text-left shadow-sm"
        >
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-bold text-lg mb-2">Certificate of Sponsorship</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Create, manage and submit CoS drafts for prospective workers.</p>
          <div className="mt-auto pt-6 flex items-center text-primary font-semibold text-sm">
            Manage CoS <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => setActiveSection("migrant")}
          className="group relative flex flex-col items-start p-6 bg-card rounded-2xl border-2 border-transparent hover:border-secondary/30 hover:bg-secondary/[0.02] transition-all text-left shadow-sm"
        >
          <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6 text-secondary" />
          </div>
          <h3 className="font-bold text-lg mb-2">Report a Migrant</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Notify UKVI about changes in worker circumstances or status.</p>
          <div className="mt-auto pt-6 flex items-center text-secondary font-semibold text-sm">
            Open Report <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => setActiveSection("business")}
          className="group relative flex flex-col items-start p-6 bg-card rounded-2xl border-2 border-transparent hover:border-accent/30 hover:bg-accent/[0.02] transition-all text-left shadow-sm"
        >
          <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <h3 className="font-bold text-lg mb-2">Report a Business</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">Update organisation details, replacement contacts, or licence changes.</p>
          <div className="mt-auto pt-6 flex items-center text-accent font-semibold text-sm">
            Open Report <ChevronRight className="ml-1 h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );
}
