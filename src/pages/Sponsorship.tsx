import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DEMO_CASES, DEMO_WORKERS } from "@/data/demo";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { SLATimer } from "@/components/SLATimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ChevronRight, ArrowLeft, Award, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Case } from "@/types";
import CosWizard from "@/components/sponsorship/CosWizard";
import ReportingPage from "@/pages/Reporting";

export default function SponsorshipPage({ tab }: { tab?: "cos" | "cos-list" | "migrant" | "business" }) {
  const { currentTenant } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  // If a specific ID is in the URL, we're viewing a case detail
  const { id } = useParams();

  const cases = DEMO_CASES.filter(c =>
    c.type === "cos_draft" &&
    (currentTenant ? c.tenantId === currentTenant.id : true)
  );

  const filtered = cases.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (id) {
    // Basic detail view placeholder for now
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => navigate("/sponsorship/cos")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </button>
        <div className="rounded-xl border bg-card p-6">
          <h1 className="text-2xl font-bold">Case Detail: {id}</h1>
          <p className="text-muted-foreground">Detail view is under construction.</p>
        </div>
      </div>
    );
  }

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

  // Render CoS Wizard directly for the 'cos' tab
  if (tab === "cos" && !showWizard) {
    setShowWizard(true);
  }

  if (showWizard) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button 
          onClick={() => {
            if (tab === "cos") navigate("/sponsorship");
            else setShowWizard(false);
          }} 
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sponsorship
        </button>
        <CosWizard onComplete={() => {
          setShowWizard(false);
          if (tab === "cos") navigate("/sponsorship");
        }} />
        
        {tab === "cos" && (
          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground mb-4">Need to see your existing drafts?</p>
            <Button variant="outline" onClick={() => { setShowWizard(false); navigate("/sponsorship/cos-list"); }}>
              View Case History & Drafts
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Render CoS List (as a secondary view now)
  if (tab === "cos-list") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/sponsorship")} className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Case History</h1>
              <p className="text-sm text-muted-foreground">Manage your CoS drafts and submissions</p>
            </div>
          </div>
          <Button onClick={() => navigate("/sponsorship/cos")}>
            <Plus className="h-4 w-4 mr-2" /> New CoS Draft
          </Button>
        </div>

        {/* Filters and Table as before... */}
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

  // Handle Reporting views
  if (tab === "migrant" || tab === "business") {
    // For now, redirect or render the ReportingPage component logic
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => navigate("/sponsorship")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Sponsorship
        </button>
        <ReportingPage initialView={tab} />
      </div>
    );
  }

  // Default Landing View
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sponsorship</h1>
        <p className="text-muted-foreground">Manage UKVI sponsorship obligations and reporting</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <button 
          onClick={() => navigate("/sponsorship/cos")}
          className="group relative flex flex-col items-start p-6 bg-card rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all text-left shadow-sm"
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
          onClick={() => navigate("/sponsorship/report-migrant")}
          className="group relative flex flex-col items-start p-6 bg-card rounded-2xl border-2 border-transparent hover:border-secondary/20 hover:bg-secondary/[0.02] transition-all text-left shadow-sm"
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
          onClick={() => navigate("/sponsorship/report-business")}
          className="group relative flex flex-col items-start p-6 bg-card rounded-2xl border-2 border-transparent hover:border-accent/20 hover:bg-accent/[0.02] transition-all text-left shadow-sm"
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
