import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  CalendarDays, CheckCircle2, XCircle, Plus, FileText, Upload, Clock,
} from "lucide-react";

type LeaveType = { id: string; name: string; paidDays: number; carryOver: boolean; description: string };
type LeaveRequest = {
  id: string; employeeName: string; type: string; from: string; to: string;
  days: number; status: "pending" | "approved" | "rejected"; reason?: string;
  documents?: string[];
};

const INITIAL_LEAVE_TYPES: LeaveType[] = [
  { id: "lt1", name: "Annual Leave", paidDays: 28, carryOver: true, description: "Statutory + contractual annual leave entitlement" },
  { id: "lt2", name: "Sick Leave", paidDays: 10, carryOver: false, description: "Paid sick days before moving to SSP" },
  { id: "lt3", name: "Maternity / Paternity", paidDays: 10, carryOver: false, description: "Enhanced family leave beyond statutory minimum" },
  { id: "lt4", name: "Compassionate Leave", paidDays: 5, carryOver: false, description: "Bereavement and compassionate circumstances" },
  { id: "lt5", name: "Study / Training Leave", paidDays: 3, carryOver: false, description: "For approved qualifications and training" },
];

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  { id: "lr1", employeeName: "Priya Sharma", type: "Annual Leave", from: "2026-03-10", to: "2026-03-14", days: 5, status: "pending", reason: "Family holiday" },
  { id: "lr2", employeeName: "James Okafor", type: "Sick Leave", from: "2026-03-03", to: "2026-03-04", days: 2, status: "approved", reason: "Illness", documents: ["Sick_note_03032026.pdf"] },
  { id: "lr3", employeeName: "Maria Kowalski", type: "Annual Leave", from: "2026-03-17", to: "2026-03-19", days: 3, status: "pending" },
  { id: "lr4", employeeName: "David Owusu", type: "Compassionate Leave", from: "2026-02-28", to: "2026-02-28", days: 1, status: "approved", reason: "Bereavement", documents: [] },
  { id: "lr5", employeeName: "Tom Hutchins", type: "Annual Leave", from: "2026-04-07", to: "2026-04-11", days: 5, status: "pending", reason: "Easter break" },
  { id: "lr6", employeeName: "Lakshmi Nair", type: "Sick Leave", from: "2026-02-25", to: "2026-02-25", days: 1, status: "rejected", reason: "No supporting documentation provided" },
];

const LEAVE_DOCS = [
  { id: "ld1", name: "Holiday Request Form", description: "Completed and signed annual leave request form", status: "present" },
  { id: "ld2", name: "Medical Certificate / Fit Note", description: "For sick leave exceeding 7 consecutive days", status: "missing" },
  { id: "ld3", name: "MATB1 Certificate", description: "Required for maternity leave claims", status: "missing" },
  { id: "ld4", name: "Training Approval Letter", description: "Manager sign-off for study leave", status: "present" },
  { id: "ld5", name: "Bereavement Declaration Form", description: "Supporting form for compassionate leave", status: "missing" },
];

const WORKER_BALANCES = [
  { name: "Priya Sharma", annualUsed: 8, annualTotal: 28, sickUsed: 2, sickTotal: 10 },
  { name: "James Okafor", annualUsed: 12, annualTotal: 28, sickUsed: 4, sickTotal: 10 },
  { name: "Maria Kowalski", annualUsed: 5, annualTotal: 28, sickUsed: 0, sickTotal: 10 },
  { name: "David Owusu", annualUsed: 3, annualTotal: 28, sickUsed: 1, sickTotal: 10 },
  { name: "Lakshmi Nair", annualUsed: 15, annualTotal: 28, sickUsed: 1, sickTotal: 10 },
  { name: "Tom Hutchins", annualUsed: 0, annualTotal: 28, sickUsed: 0, sickTotal: 10 },
];

const STATUS_COLORS = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function LeaveManagementPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>(INITIAL_LEAVE_TYPES);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [docStatuses, setDocStatuses] = useState<Record<string, string>>(
    Object.fromEntries(LEAVE_DOCS.map(d => [d.id, d.status]))
  );
  const [activeTab, setActiveTab] = useState<"requests" | "policy" | "balances" | "documents">("requests");

  const pending = leaveRequests.filter(r => r.status === "pending").length;

  const handleApprove = (id: string) => setLeaveRequests(p => p.map(r => r.id === id ? { ...r, status: "approved" } : r));
  const handleReject = (id: string) => setLeaveRequests(p => p.map(r => r.id === id ? { ...r, status: "rejected" } : r));

  const tabs = [
    { id: "requests", label: `Leave Requests${pending > 0 ? ` (${pending})` : ""}` },
    { id: "policy", label: "Leave Policy" },
    { id: "balances", label: "Employee Balances" },
    { id: "documents", label: "Documents" },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage employee leave requests, balances and policy</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-1.5" />Log Leave
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pending Requests", value: pending, color: "text-warning" },
          { label: "Approved This Month", value: leaveRequests.filter(r => r.status === "approved").length, color: "text-success" },
          { label: "Rejected", value: leaveRequests.filter(r => r.status === "rejected").length, color: "text-destructive" },
          { label: "Total Employees", value: WORKER_BALANCES.length, color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border bg-card p-4">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Leave Requests ── */}
      {activeTab === "requests" && (
        <div className="space-y-3">
          {leaveRequests.map(req => (
            <div key={req.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm">{req.employeeName}</p>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", STATUS_COLORS[req.status])}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{req.type}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{new Date(req.from).toLocaleDateString("en-GB")} – {new Date(req.to).toLocaleDateString("en-GB")}</span>
                    <span className="font-semibold text-foreground">{req.days} day{req.days !== 1 ? "s" : ""}</span>
                  </div>
                  {req.reason && <p className="text-xs text-muted-foreground mt-1">Reason: {req.reason}</p>}
                  {req.documents && req.documents.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      {req.documents.map(d => (
                        <button key={d} className="text-xs text-primary underline">{d}</button>
                      ))}
                    </div>
                  )}
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="ghost"
                      className="h-8 text-xs gap-1 text-success border border-success/30 hover:bg-success/10"
                      onClick={() => handleApprove(req.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5" />Approve
                    </Button>
                    <Button size="sm" variant="ghost"
                      className="h-8 text-xs gap-1 text-destructive border border-destructive/20 hover:bg-destructive/10"
                      onClick={() => handleReject(req.id)}>
                      <XCircle className="h-3.5 w-3.5" />Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Leave Policy ── */}
      {activeTab === "policy" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Leave Entitlements</h3>
              <p className="text-xs text-muted-foreground">Configure paid leave allowances per leave type</p>
            </div>
            <Button size="sm"><Plus className="h-3.5 w-3.5 mr-1" />Add Type</Button>
          </div>
          <div className="space-y-3">
            {leaveTypes.map(lt => (
              <div key={lt.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{lt.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lt.description}</p>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <Input
                        type="number"
                        className="h-8 w-20 text-sm text-right"
                        value={lt.paidDays}
                        onChange={e => setLeaveTypes(p => p.map(l => l.id === lt.id ? { ...l, paidDays: parseInt(e.target.value) || 0 } : l))}
                      />
                      <p className="text-[10px] text-muted-foreground mt-0.5">paid days/year</p>
                    </div>
                    <div className="text-center">
                      <Switch
                        checked={lt.carryOver}
                        onCheckedChange={v => setLeaveTypes(p => p.map(l => l.id === lt.id ? { ...l, carryOver: v } : l))}
                      />
                      <p className="text-[10px] text-muted-foreground mt-0.5">carry over</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
            <h4 className="font-semibold text-sm">Excess Leave Rules</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Leave Exceeding Paid Entitlement</Label>
                <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm">
                  <option>Allow as unpaid — manager approval required</option>
                  <option>Not permitted</option>
                  <option>Case by case basis</option>
                </select>
              </div>
              <div>
                <Label className="text-xs">Maximum Annual Carry-Over Days</Label>
                <Input type="number" defaultValue={5} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Min. Notice for Annual Leave (days)</Label>
                <Input type="number" defaultValue={14} className="mt-1 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Max Consecutive Sick Days (before fit note)</Label>
                <Input type="number" defaultValue={7} className="mt-1 h-8 text-sm" />
              </div>
            </div>
          </div>
          <Button>Save Leave Policy</Button>
        </div>
      )}

      {/* ── Employee Balances ── */}
      {activeTab === "balances" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Year-to-date leave usage per employee.</p>
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="grid grid-cols-5 text-xs font-semibold text-muted-foreground px-4 py-2.5 border-b bg-muted/30">
              <div className="col-span-2">Employee</div>
              <div>Annual Used</div>
              <div>Annual Remaining</div>
              <div>Sick Days Used</div>
            </div>
            {WORKER_BALANCES.map((w, i) => {
              const annualRemaining = w.annualTotal - w.annualUsed;
              const annualPct = Math.round((w.annualUsed / w.annualTotal) * 100);
              return (
                <div key={i} className="grid grid-cols-5 items-center px-4 py-3 border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {w.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <p className="text-sm font-medium">{w.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{w.annualUsed}<span className="text-muted-foreground font-normal">/{w.annualTotal}</span></p>
                    <div className="w-16 h-1.5 bg-muted rounded-full mt-1">
                      <div
                        className={cn("h-1.5 rounded-full", annualPct > 80 ? "bg-destructive" : annualPct > 60 ? "bg-warning" : "bg-success")}
                        style={{ width: `${annualPct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className={cn("text-sm font-semibold", annualRemaining < 5 ? "text-destructive" : "text-success")}>
                      {annualRemaining} days
                    </span>
                  </div>
                  <div>
                    <span className={cn("text-sm font-semibold", w.sickUsed > 7 ? "text-destructive" : w.sickUsed > 3 ? "text-warning" : "text-foreground")}>
                      {w.sickUsed}<span className="text-muted-foreground font-normal">/{w.sickTotal}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Documents ── */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Leave-related document templates required for different types of leave applications.</p>
          <div className="rounded-xl border bg-card divide-y overflow-hidden">
            {LEAVE_DOCS.map(doc => {
              const s = docStatuses[doc.id];
              return (
                <div key={doc.id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full border",
                      s === "present" ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {s === "present" ? "Template Available" : "Not Uploaded"}
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                      onClick={() => s !== "present" && setDocStatuses(p => ({ ...p, [doc.id]: "present" }))}>
                      {s === "present" ? "View" : <><Upload className="h-3 w-3" />Upload</>}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border bg-muted/30 p-4">
            <h4 className="font-semibold text-sm mb-3">Document Requirements by Leave Type</h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li><span className="font-medium text-foreground">Annual Leave:</span> Holiday request form signed by line manager</li>
              <li><span className="font-medium text-foreground">Sick Leave (7+ days):</span> GP fit note / medical certificate required</li>
              <li><span className="font-medium text-foreground">Maternity / Paternity:</span> MATB1 certificate + 28 days written notice</li>
              <li><span className="font-medium text-foreground">Compassionate Leave:</span> Supporting documentation where appropriate</li>
              <li><span className="font-medium text-foreground">Study Leave:</span> Course enrolment confirmation + manager approval letter</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
