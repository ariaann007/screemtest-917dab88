import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DEMO_CASES, DEMO_WORKERS } from "@/data/demo";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { SLATimer } from "@/components/SLATimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Case } from "@/types";
import CosWizard from "@/components/sponsorship/CosWizard";

export default function SponsorshipPage() {
  const { currentTenant } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  const cases = DEMO_CASES.filter(c =>
    c.type === "cos_draft" &&
    (currentTenant ? c.tenantId === currentTenant.id : true)
  );

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (showWizard) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setShowWizard(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Sponsorship
        </button>
        <CosWizard onComplete={() => setShowWizard(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sponsorship</h1>
          <p className="text-sm text-muted-foreground">CoS drafts and sponsorship management</p>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="h-4 w-4 mr-2" /> New CoS Draft
        </Button>
      </div>

      {/* Filters */}
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

      {/* Cases table */}
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
                    {worker ? (
                      <span className="text-sm">{worker.givenName} {worker.familyName}</span>
                    ) : <span className="text-muted-foreground">—</span>}
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
