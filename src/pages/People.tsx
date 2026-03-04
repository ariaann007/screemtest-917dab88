import { useState } from "react";
import { DEMO_WORKERS } from "@/data/demo";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, AlertTriangle, FileText, ChevronRight, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Worker } from "@/types";
import { LeaverBanner } from "@/components/compliance/LeaverChecklist";
import { VisaRulesAlert, VisaBreachBadge } from "@/components/compliance/VisaRulesAlert";
import { WorkerScoreBadge, calcWorkerScore } from "@/components/compliance/ComplianceScore";

const DOC_CATEGORIES = [
  "Passport", "Visa/BRP", "Right to Work Evidence", "Contract", "Offer Letter",
  "DBS Certificate", "NMC Pin", "Qualification Certificate", "Other",
];

function WorkerDetail({ worker, onClose }: { worker: Worker; onClose: () => void }) {
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
  const score = worker.complianceScore ?? calcWorkerScore(worker);

  // Absence alert
  const longAbsence = worker.absenceRecords?.find(a => a.workingDays > 10);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-end" onClick={onClose}>
      <div className="h-full w-full max-w-lg bg-background shadow-xl overflow-y-auto animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
              isLeaver ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
            )}>
              {worker.givenName[0]}{worker.familyName[0]}
            </div>
            <div>
              <h2 className="font-bold">{worker.givenName} {worker.familyName}</h2>
              <p className="text-xs text-muted-foreground">{worker.jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WorkerScoreBadge worker={worker} />
            <button onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Leaver banner + checklist */}
          <LeaverBanner worker={worker} />

          {/* Missing docs */}
          {missingDocs.length > 0 && (
            <div className="missing-banner flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{missingDocs.length} required document{missingDocs.length !== 1 ? "s" : ""} missing: {missingDocs.map(d => d.name).join(", ")}</span>
            </div>
          )}

          {/* Visa breach */}
          <VisaRulesAlert worker={worker} />

          {/* Absence alert */}
          {longAbsence && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-2.5 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span><strong>Absence monitoring:</strong> {longAbsence.workingDays} consecutive working days absent ({new Date(longAbsence.startDate).toLocaleDateString("en-GB")}–{new Date(longAbsence.endDate).toLocaleDateString("en-GB")}) — reporting obligation may apply</span>
            </div>
          )}

          {/* Compliance Alerts */}
          <div className="space-y-2">
            {daysToVisa !== null && daysToVisa < 90 && (
              <div className={cn("flex items-center gap-2 rounded-lg p-2.5 text-sm", daysToVisa < 30 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Visa expires in {daysToVisa} day{daysToVisa !== 1 ? "s" : ""} ({worker.visaExpiry && new Date(worker.visaExpiry).toLocaleDateString("en-GB")})
              </div>
            )}
            {daysToPassport !== null && daysToPassport < 90 && (
              <div className={cn("flex items-center gap-2 rounded-lg p-2.5 text-sm", daysToPassport < 30 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Passport expires in {daysToPassport} day{daysToPassport !== 1 ? "s" : ""} ({worker.passportExpiry && new Date(worker.passportExpiry).toLocaleDateString("en-GB")})
              </div>
            )}
          </div>

          {/* Personal Details */}
          <section>
            <h3 className="font-semibold text-sm mb-3 border-b pb-2">Personal Details</h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {[
                ["Full Name", `${worker.givenName} ${worker.familyName}`],
                ["Nationality", worker.nationality],
                ["Date of Birth", worker.dateOfBirth ? new Date(worker.dateOfBirth).toLocaleDateString("en-GB") : "—"],
                ["NI Number", worker.niNumber || "—"],
                ["Passport No.", worker.passportNumber || "—"],
                ["Passport Expiry", worker.passportExpiry ? new Date(worker.passportExpiry).toLocaleDateString("en-GB") : "—"],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-muted-foreground text-xs">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </section>

          {/* Sponsorship Details */}
          <section>
            <h3 className="font-semibold text-sm mb-3 border-b pb-2">Sponsorship</h3>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              {[
                ["CoS Reference", worker.cosReference || "—"],
                ["Visa Type", worker.visaType || "—"],
                ["Visa Expiry", worker.visaExpiry ? new Date(worker.visaExpiry).toLocaleDateString("en-GB") : "—"],
                ["Start Date", worker.startDate ? new Date(worker.startDate).toLocaleDateString("en-GB") : "—"],
                ["SOC Code", worker.socCode || "—"],
                ["Weekly Hours", worker.weeklyHours ? `${worker.weeklyHours}h` : "—"],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-muted-foreground text-xs">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
              <div className="col-span-2"><dt className="text-muted-foreground text-xs">Salary</dt><dd className="font-medium">{worker.salary ? `£${worker.salary.toLocaleString()} per ${worker.salaryPeriod}` : "—"}</dd></div>
            </dl>
          </section>

          {/* Document Vault */}
          <section>
            <div className="flex items-center justify-between mb-3 border-b pb-2">
              <h3 className="font-semibold text-sm">Document Vault</h3>
              {!isLeaver && <Button size="sm" variant="outline" className="h-7 text-xs"><Upload className="h-3 w-3 mr-1" />Upload</Button>}
            </div>
            <div className="space-y-2">
              {DEMO_DOCS.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      {doc.expiry && <p className="text-xs text-muted-foreground">Expires {new Date(doc.expiry).toLocaleDateString("en-GB")}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.required && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded">Required</span>}
                    <StatusBadge status={doc.status === "expiring_soon" ? "submitted" : doc.status === "present" ? "approved" : "cancelled"} />
                  </div>
                </div>
              ))}
            </div>
          </section>
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

  const workers = DEMO_WORKERS.filter(w => currentTenant ? w.tenantId === currentTenant.id : true);
  const today = new Date();
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

  const filtered = workers.filter(w => {
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

  return (
    <div className="space-y-5 animate-fade-in">
      {selectedWorker && <WorkerDetail worker={selectedWorker} onClose={() => setSelectedWorker(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">People</h1>
          <p className="text-sm text-muted-foreground">Sponsored workers and compliance files</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Worker</Button>
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
              <th className="text-left p-3 font-medium text-muted-foreground">CoS Reference</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Visa Expiry</th>
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
              return (
                <tr key={w.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedWorker(w)}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                        isLeaver ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
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
                  <td className="p-3 font-mono text-xs">{w.cosReference || "—"}</td>
                  <td className="p-3">
                    {visaExpiry ? (
                      <span className={cn("text-sm", daysVisa !== null && daysVisa < 30 ? "text-destructive font-medium" : daysVisa !== null && daysVisa < 90 ? "text-warning" : "")}>
                        {visaExpiry.toLocaleDateString("en-GB")}
                        {daysVisa !== null && daysVisa < 90 && <span className="ml-1 text-xs">({daysVisa}d)</span>}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="p-3"><WorkerScoreBadge worker={w} /></td>
                  <td className="p-3"><StatusBadge status={w.status} /></td>
                  <td className="p-3 text-right"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground">{filtered.length} of {workers.length} workers</div>
      </div>
    </div>
  );
}
