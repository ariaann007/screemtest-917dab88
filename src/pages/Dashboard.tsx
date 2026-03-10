import { useApp } from "@/context/AppContext";
import { DEMO_WORKERS, DEMO_SPONSOR_LICENCES } from "@/data/demo";
import { Link } from "react-router-dom";
import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcLicenceScore, calcWorkerScore } from "@/components/compliance/ComplianceScore";
import { ComplianceScoreWidget } from "@/components/dashboard/ComplianceScoreWidget";
import { ExpiriesWidget } from "@/components/dashboard/ExpiriesWidget";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { AbsenceWidget } from "@/components/dashboard/AbsenceWidget";
import { ActivityFeedWidget } from "@/components/dashboard/ActivityFeedWidget";
import { ServicesWidget } from "@/components/dashboard/ServicesWidget";

export default function DashboardPage() {
  const { currentTenant, isInternal } = useApp();

  const tenantId = currentTenant?.id;
  const workers = tenantId ? DEMO_WORKERS.filter(w => w.tenantId === tenantId) : DEMO_WORKERS;
  const licence = tenantId ? DEMO_SPONSOR_LICENCES.find(l => l.tenantId === tenantId) : DEMO_SPONSOR_LICENCES[0];

  const today = new Date();
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const in30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const activeWorkers = workers.filter(w => w.status === "active");
  const licenceScore = calcLicenceScore(activeWorkers);
  const workersAtRisk = activeWorkers.filter(w => (w.complianceScore ?? calcWorkerScore(w)) < 60);

  const criticalExpiries = activeWorkers.filter(w =>
    (w.visaExpiry && new Date(w.visaExpiry) > today && new Date(w.visaExpiry) < in30) ||
    (w.passportExpiry && new Date(w.passportExpiry) > today && new Date(w.passportExpiry) < in30)
  ).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isInternal ? "Operations Dashboard" : "Compliance Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentTenant ? currentTenant.name : "All Tenants"} · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/reporting"><Plus className="h-3.5 w-3.5 mr-1" />New Report</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/sponsorship"><Plus className="h-3.5 w-3.5 mr-1" />New CoS Draft</Link>
          </Button>
        </div>
      </div>

      {/* Alert banner: at-risk workers */}
      {(workersAtRisk.length > 0 || criticalExpiries > 0) && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">
            {workersAtRisk.length > 0 && `${workersAtRisk.length} worker${workersAtRisk.length !== 1 ? "s" : ""} at compliance risk`}
            {workersAtRisk.length > 0 && criticalExpiries > 0 && " · "}
            {criticalExpiries > 0 && `${criticalExpiries} document${criticalExpiries !== 1 ? "s" : ""} expiring within 30 days`}
          </span>
          <Button variant="destructive" size="sm" className="ml-auto h-7 text-xs" asChild>
            <Link to="/people">View People</Link>
          </Button>
        </div>
      )}

      {/* TOP ROW: Compliance Score | Expiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ComplianceScoreWidget workers={workers} licenceScore={licenceScore} />
        <ExpiriesWidget workers={workers} />
      </div>

      {/* MIDDLE ROW: Tasks & Approvals | Absence Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TasksWidget />
        <AbsenceWidget />
      </div>

      {/* BOTTOM ROW: Activity Feed | Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ActivityFeedWidget />
        </div>
        <div className="flex flex-col gap-4">
          <ServicesWidget />
        </div>
      </div>
    </div>
  );
}
