import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEMO_WORKERS, DEMO_WORK_LOCATIONS } from "@/data/demo";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, AlertTriangle, Shield, Clock,
  MapPin, Briefcase, ChevronRight, Users, UserCheck, UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Worker } from "@/types";
import { calcWorkerScore } from "@/components/compliance/ComplianceScore";
import AddWorkerModal from "@/components/people/AddWorkerModal";

function getWorkerBadges(worker: Worker) {
  const badges: { label: string; color: string }[] = [];
  const today = new Date();
  const visaExpiry = worker.visaExpiry ? new Date(worker.visaExpiry) : null;
  const daysToVisa = visaExpiry ? Math.ceil((visaExpiry.getTime() - today.getTime()) / 86400000) : null;

  if (worker.leaverStatus === "leaver") badges.push({ label: "Leaver", color: "bg-muted text-muted-foreground" });
  else if (worker.status === "active") badges.push({ label: "Active", color: "bg-success/10 text-success" });

  if (worker.visaType) badges.push({ label: "Sponsored", color: "bg-primary/10 text-primary" });
  if (daysToVisa !== null && daysToVisa < 90 && daysToVisa >= 0)
    badges.push({ label: "Visa Expiring", color: "bg-warning/10 text-warning" });
  if (daysToVisa !== null && daysToVisa < 0)
    badges.push({ label: "Visa Expired", color: "bg-destructive/10 text-destructive" });

  const score = calcWorkerScore(worker);
  if (score < 60) badges.push({ label: "Compliance Risk", color: "bg-destructive/10 text-destructive" });

  return badges;
}

export default function PeoplePage() {
  const { currentTenant } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [localWorkers, setLocalWorkers] = useState<Worker[]>([]);

  const allWorkers = [...DEMO_WORKERS, ...localWorkers];
  const workers = allWorkers.filter(w => currentTenant ? w.tenantId === currentTenant.id : true);

  const filtered = workers.filter(w => {
    const name = `${w.givenName} ${w.familyName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) ||
      w.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
      w.nationality?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" ||
      (filterStatus === "active" && w.status === "active" && w.leaverStatus !== "leaver") ||
      (filterStatus === "leaver" && w.leaverStatus === "leaver") ||
      (filterStatus === "sponsored" && !!w.visaType) ||
      (filterStatus === "risk" && calcWorkerScore(w) < 60);
    return matchSearch && matchStatus;
  });

  const activeCount = workers.filter(w => w.status === "active" && w.leaverStatus !== "leaver").length;
  const sponsoredCount = workers.filter(w => !!w.visaType).length;
  const riskCount = workers.filter(w => calcWorkerScore(w) < 60).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">People</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Employee directory and HR records</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Employee
        </Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Employees", value: workers.length, icon: Users, color: "text-primary" },
          { label: "Active", value: activeCount, icon: UserCheck, color: "text-success" },
          { label: "Sponsored Workers", value: sponsoredCount, icon: Shield, color: "text-primary" },
          { label: "Compliance Risk", value: riskCount, icon: AlertTriangle, color: "text-destructive" },
        ].map(stat => (
          <Card key={stat.label} className="p-4 flex items-center gap-3">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center bg-muted", stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, nationality…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="sponsored">Sponsored Workers</SelectItem>
            <SelectItem value="leaver">Leavers</SelectItem>
            <SelectItem value="risk">Compliance Risk</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Employee Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Visa / Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Compliance</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tags</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No employees found</td></tr>
              ) : filtered.map(worker => {
                const score = worker.complianceScore ?? calcWorkerScore(worker);
                const location = DEMO_WORK_LOCATIONS.find(l => l.id === worker.workLocationId);
                const badges = getWorkerBadges(worker);
                const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";
                const initials = `${worker.givenName[0]}${worker.familyName[0]}`;

                return (
                  <tr
                    key={worker.id}
                    className="border-b last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/people/${worker.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0",
                          worker.leaverStatus === "leaver"
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        )}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium leading-none">{worker.givenName} {worker.familyName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{worker.nationality}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{worker.jobTitle || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">{location?.city || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {worker.visaType ? (
                        <div>
                          <p className="text-sm font-medium">{worker.visaType}</p>
                          {worker.visaExpiry && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              Exp: {new Date(worker.visaExpiry).toLocaleDateString("en-GB")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Non-sponsored</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-bold", scoreColor)}>{score}%</span>
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive")}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {badges.map(b => (
                          <span key={b.label} className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", b.color)}>
                            {b.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <AddWorkerModal
          onClose={() => setShowAdd(false)}
          onAdd={(w) => { setLocalWorkers(p => [...p, w]); setShowAdd(false); }}
        />
      )}
    </div>
  );
}
