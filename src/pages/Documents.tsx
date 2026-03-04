import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  FileText, Upload, Search, CheckCircle2, XCircle, AlertTriangle,
  Clock, Plus, FolderOpen, Eye,
} from "lucide-react";

type DocStatus = "present" | "missing" | "expired" | "expiring_soon" | "pending";
type DocCategory = "onboarding" | "compliance" | "leave" | "training" | "contract";

interface Doc {
  id: string;
  name: string;
  employee: string;
  category: DocCategory;
  status: DocStatus;
  expiryDate?: string;
  uploadedAt?: string;
  required: boolean;
  fileName?: string;
}

const CATEGORY_LABELS: Record<DocCategory, string> = {
  onboarding: "Onboarding",
  compliance: "Compliance",
  leave: "Leave",
  training: "Training",
  contract: "Contract",
};

const CATEGORY_COLORS: Record<DocCategory, string> = {
  onboarding: "bg-primary/10 text-primary border-primary/20",
  compliance: "bg-secondary/10 text-secondary border-secondary/20",
  leave: "bg-warning/10 text-warning border-warning/20",
  training: "bg-success/10 text-success border-success/20",
  contract: "bg-muted text-muted-foreground border-border",
};

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: "Present", color: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  missing: { label: "Missing", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <XCircle className="h-3.5 w-3.5" /> },
  expired: { label: "Expired", color: "bg-destructive/10 text-destructive border-destructive/20", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  expiring_soon: { label: "Expiring Soon", color: "bg-warning/10 text-warning border-warning/20", icon: <Clock className="h-3.5 w-3.5" /> },
  pending: { label: "Pending Review", color: "bg-warning/10 text-warning border-warning/20", icon: <Clock className="h-3.5 w-3.5" /> },
};

const DEMO_DOCS: Doc[] = [
  // Onboarding
  { id: "d1", name: "Passport Copy", employee: "Priya Sharma", category: "onboarding", status: "present", required: true, uploadedAt: "2025-09-01", fileName: "Priya_Passport.pdf" },
  { id: "d2", name: "Right to Work Evidence", employee: "Priya Sharma", category: "compliance", status: "present", required: true, uploadedAt: "2025-09-01", expiryDate: "2026-08-31", fileName: "Priya_RTW.pdf" },
  { id: "d3", name: "Employment Contract", employee: "Priya Sharma", category: "contract", status: "present", required: true, uploadedAt: "2025-09-01", fileName: "Priya_Contract.pdf" },
  { id: "d4", name: "DBS Certificate", employee: "Priya Sharma", category: "compliance", status: "expiring_soon", required: true, expiryDate: "2026-04-15", fileName: "Priya_DBS.pdf" },
  { id: "d5", name: "NVQ Level 3 Certificate", employee: "Priya Sharma", category: "training", status: "present", required: false, uploadedAt: "2025-09-01", fileName: "Priya_NVQ.pdf" },

  { id: "d6", name: "Passport Copy", employee: "James Okafor", category: "onboarding", status: "present", required: true, uploadedAt: "2025-10-15", fileName: "James_Passport.pdf" },
  { id: "d7", name: "Right to Work Evidence", employee: "James Okafor", category: "compliance", status: "present", required: true, uploadedAt: "2025-10-15" },
  { id: "d8", name: "Employment Contract", employee: "James Okafor", category: "contract", status: "missing", required: true },
  { id: "d9", name: "DBS Certificate", employee: "James Okafor", category: "compliance", status: "present", required: true, expiryDate: "2027-01-10" },
  { id: "d10", name: "Holiday Request Form", employee: "James Okafor", category: "leave", status: "present", required: false, uploadedAt: "2026-03-03" },

  { id: "d11", name: "Passport Copy", employee: "Lakshmi Nair", category: "onboarding", status: "present", required: true, uploadedAt: "2025-08-20" },
  { id: "d12", name: "NMC PIN Certificate", employee: "Lakshmi Nair", category: "compliance", status: "present", required: true, expiryDate: "2027-08-31" },
  { id: "d13", name: "Right to Work Evidence", employee: "Lakshmi Nair", category: "compliance", status: "expiring_soon", required: true, expiryDate: "2026-05-20", fileName: "Lakshmi_RTW.pdf" },
  { id: "d14", name: "Employment Contract", employee: "Lakshmi Nair", category: "contract", status: "pending", required: true, uploadedAt: "2026-02-28" },
  { id: "d15", name: "Induction Training Record", employee: "Lakshmi Nair", category: "training", status: "missing", required: true },

  { id: "d16", name: "Passport Copy", employee: "Maria Kowalski", category: "onboarding", status: "present", required: true, uploadedAt: "2026-01-10" },
  { id: "d17", name: "Right to Work Evidence", employee: "Maria Kowalski", category: "compliance", status: "present", required: true, expiryDate: "2028-12-31" },
  { id: "d18", name: "Employment Contract", employee: "Maria Kowalski", category: "contract", status: "present", required: true },
  { id: "d19", name: "DBS Certificate", employee: "Maria Kowalski", category: "compliance", status: "missing", required: true },

  { id: "d20", name: "Sick Note (March 2026)", employee: "James Okafor", category: "leave", status: "present", required: false, uploadedAt: "2026-03-04", fileName: "Sick_note_03032026.pdf" },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DocCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");

  const employees = [...new Set(DEMO_DOCS.map(d => d.employee))];

  const filtered = DEMO_DOCS.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.employee.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || d.category === categoryFilter;
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const matchEmp = employeeFilter === "all" || d.employee === employeeFilter;
    return matchSearch && matchCat && matchStatus && matchEmp;
  });

  const summary = {
    total: DEMO_DOCS.length,
    present: DEMO_DOCS.filter(d => d.status === "present").length,
    missing: DEMO_DOCS.filter(d => d.status === "missing").length,
    expiring: DEMO_DOCS.filter(d => d.status === "expiring_soon" || d.status === "expired").length,
    pending: DEMO_DOCS.filter(d => d.status === "pending").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All employee documents — onboarding, compliance, contracts and leave</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" /><Upload className="h-4 w-4 mr-1" />Upload Document
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: summary.total, color: "text-foreground", filter: "all" as const },
          { label: "Present", value: summary.present, color: "text-success", filter: "present" as const },
          { label: "Missing", value: summary.missing, color: "text-destructive", filter: "missing" as const },
          { label: "Expiring", value: summary.expiring, color: "text-warning", filter: "expiring_soon" as const },
          { label: "Pending Review", value: summary.pending, color: "text-warning", filter: "pending" as const },
        ].map(s => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.filter)}
            className={cn(
              "rounded-xl border bg-card p-4 text-left transition-all hover:shadow-sm",
              statusFilter === s.filter && "ring-2 ring-primary"
            )}
          >
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search documents or employees…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={employeeFilter}
          onChange={e => setEmployeeFilter(e.target.value)}
        >
          <option value="all">All Employees</option>
          {employees.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setCategoryFilter("all")}
            className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
              categoryFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
            )}
          >All</button>
          {(Object.keys(CATEGORY_LABELS) as DocCategory[]).map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn("text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                categoryFilter === c ? CATEGORY_COLORS[c] : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Documents list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No documents found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="grid grid-cols-12 text-xs font-semibold text-muted-foreground px-4 py-2.5 border-b bg-muted/30">
            <div className="col-span-4">Document</div>
            <div className="col-span-2">Employee</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Expiry / Uploaded</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <div className="divide-y">
            {filtered.map(doc => {
              const sc = STATUS_CONFIG[doc.status];
              return (
                <div key={doc.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/20 transition-colors gap-2">
                  <div className="col-span-4 flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      {doc.fileName && <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm truncate">{doc.employee}</p>
                  </div>
                  <div className="col-span-2">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", CATEGORY_COLORS[doc.category])}>
                      {CATEGORY_LABELS[doc.category]}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {doc.expiryDate && (
                      <p className="text-xs font-medium">Exp: {new Date(doc.expiryDate).toLocaleDateString("en-GB")}</p>
                    )}
                    {doc.uploadedAt && !doc.expiryDate && (
                      <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString("en-GB")}</p>
                    )}
                    {!doc.expiryDate && !doc.uploadedAt && <p className="text-xs text-muted-foreground">—</p>}
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1", sc.color)}>
                      {sc.icon}{sc.label}
                    </span>
                    {doc.status === "present" || doc.status === "expiring_soon" || doc.status === "pending"
                      ? <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                      : <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Upload className="h-3.5 w-3.5" /></Button>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerts */}
      {DEMO_DOCS.filter(d => d.status === "missing" && d.required).length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="font-semibold text-sm text-destructive">
              {DEMO_DOCS.filter(d => d.status === "missing" && d.required).length} required documents missing
            </p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-6">
            {DEMO_DOCS.filter(d => d.status === "missing" && d.required).map(d => (
              <li key={d.id}>• <span className="font-medium text-foreground">{d.employee}</span> — {d.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
