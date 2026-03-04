import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Priority } from "@/types";

const TICKET_TYPES = [
  "Allocation Request", "Urgent Reporting Help", "Compliance Question",
  "Document Issue", "Other",
];

interface Ticket {
  id: string;
  tenantId: string;
  type: string;
  title: string;
  description: string;
  priority: Priority;
  status: string;
  createdAt: string;
  assignedTo?: string;
}

const DEMO_TICKETS: Ticket[] = [
  { id: "t1", tenantId: "t1", type: "Document Issue", title: "Missing RTW evidence for Amrit Singh", description: "We cannot locate the RTW document for this worker.", priority: "high", status: "in_progress", createdAt: "2024-01-10T10:00:00Z", assignedTo: "James Adebayo" },
  { id: "t2", tenantId: "t1", type: "Compliance Question", title: "ISC exemption query for PhD holders", description: "Can you confirm if our physiotherapist with an overseas PhD qualifies for ISC exemption?", priority: "medium", status: "open", createdAt: "2024-01-08T14:00:00Z" },
  { id: "t3", tenantId: "t2", type: "Allocation Request", title: "CoS allocation top-up needed", description: "Our current allocation is almost exhausted. Please advise on requesting additional CoS.", priority: "urgent", status: "open", createdAt: "2024-01-12T09:00:00Z" },
];

export default function RequestsPage() {
  const { currentTenant } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ type: "", title: "", description: "", priority: "medium" as Priority });

  const tickets = DEMO_TICKETS.filter(t => currentTenant ? t.tenantId === currentTenant.id : true)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  if (submitted) {
    return (
      <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-success-light flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-xl font-bold mb-2">Request Submitted</h2>
        <p className="text-muted-foreground text-sm mb-6">Your request has been submitted. A Denizns caseworker will respond shortly.</p>
        <Button onClick={() => { setSubmitted(false); setShowForm(false); setFormData({ type: "", title: "", description: "", priority: "medium" }); }}>
          Back to Requests
        </Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-lg space-y-5 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">New Request</h1>
          <p className="text-sm text-muted-foreground">Submit a support ticket to Denizns</p>
        </div>
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <div><Label>Request Type *</Label>
            <Select value={formData.type} onValueChange={v => setFormData(p => ({ ...p, type: v }))}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select type…" /></SelectTrigger>
              <SelectContent>{TICKET_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Subject *</Label><Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="mt-1" placeholder="Brief description of your request" /></div>
          <div><Label>Description *</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={5} placeholder="Provide as much detail as possible…" /></div>
          <div><Label>Priority</Label>
            <Select value={formData.priority} onValueChange={v => setFormData(p => ({ ...p, priority: v as Priority }))}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
            <p className="text-sm text-muted-foreground">📎 Attach files (optional)</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
          <Button className="flex-1" disabled={!formData.type || !formData.title || !formData.description} onClick={() => setSubmitted(true)}>Submit Request</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requests</h1>
          <p className="text-sm text-muted-foreground">Support tickets and compliance queries</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Request
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open", value: tickets.filter(t => t.status === "open").length, color: "text-info" },
          { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length, color: "text-warning" },
          { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length, color: "text-success" },
        ].map(s => (
          <div key={s.label} className="card-stat text-center">
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search requests…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {tickets.length === 0 && <div className="rounded-xl border bg-card p-8 text-center text-muted-foreground">No requests found</div>}
        {tickets.map(t => (
          <div key={t.id} className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={t.status} />
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                    t.priority === "urgent" ? "bg-destructive/10 text-destructive" :
                    t.priority === "high" ? "bg-warning-light text-warning" :
                    "bg-muted text-muted-foreground"
                  )}>{t.priority}</span>
                  <span className="text-xs text-muted-foreground">{t.type}</span>
                </div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{new Date(t.createdAt).toLocaleDateString("en-GB")}</span>
                  {t.assignedTo && <span>Assigned to {t.assignedTo}</span>}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
