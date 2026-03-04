import { useApp } from "@/context/AppContext";
import { DEMO_CASES, DEMO_WORKERS, DEMO_INVOICES, DEMO_SPONSOR_LICENCES } from "@/data/demo";
import { StatusBadge } from "@/components/StatusBadge";
import { SLATimer } from "@/components/SLATimer";
import { Link } from "react-router-dom";
import {
  AlertTriangle, Clock, FileText, Users,
  CreditCard, ArrowRight, Shield, Briefcase, TrendingDown, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScoreGauge, calcLicenceScore, calcWorkerScore, ragBg, ragColor } from "@/components/compliance/ComplianceScore";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { currentTenant, isInternal } = useApp();

  const tenantId = currentTenant?.id;
  const cases = tenantId ? DEMO_CASES.filter(c => c.tenantId === tenantId) : DEMO_CASES;
  const workers = tenantId ? DEMO_WORKERS.filter(w => w.tenantId === tenantId) : DEMO_WORKERS;
  const invoices = tenantId ? DEMO_INVOICES.filter(i => i.tenantId === tenantId) : DEMO_INVOICES;
  const licence = tenantId ? DEMO_SPONSOR_LICENCES.find(l => l.tenantId === tenantId) : DEMO_SPONSOR_LICENCES[0];

  const today = new Date();
  const in90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const overdueCases = cases.filter(c => c.isOverdue);
  const openCases = cases.filter(c => !["closed", "cancelled", "filed"].includes(c.status));
  const unpaidInvoices = invoices.filter(i => i.status === "unpaid");
  const totalUnpaid = unpaidInvoices.reduce((s, i) => s + i.total, 0);

  // Compliance
  const activeWorkers = workers.filter(w => w.status === "active");
  const licenceScore = calcLicenceScore(activeWorkers);
  const workersAtRisk = activeWorkers.filter(w => (w.complianceScore ?? calcWorkerScore(w)) < 60);
  const leavers = workers.filter(w => w.leaverStatus === "leaver");

  const expiringVisas = workers.filter(w => w.visaExpiry && new Date(w.visaExpiry) < in90 && new Date(w.visaExpiry) > today);
  const expiringPassports = workers.filter(w => w.passportExpiry && new Date(w.passportExpiry) < in90 && new Date(w.passportExpiry) > today);

  // CoS allocation
  const cosTotal = licence ? licence.cosDefinedAvailable + licence.cosUndefinedAvailable : 0;
  const cosRemaining = licence ? cosTotal - licence.cosUsed : 0;
  const cosUsedPct = cosTotal > 0 ? Math.round((licence!.cosUsed / cosTotal) * 100) : 0;

  // Upcoming reporting deadlines (cases due within 14 days)
  const reportingDeadlines = cases.filter(c =>
    c.type === "migrant_reporting" && c.dueDate &&
    new Date(c.dueDate) < new Date(today.getTime() + 14 * 86400000) &&
    !["closed", "filed"].includes(c.status)
  );

  const statusGroups = openCases.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
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
          <Button asChild variant="outline" size="sm"><Link to="/reporting">+ New Report</Link></Button>
          <Button asChild size="sm"><Link to="/sponsorship">+ New CoS Draft</Link></Button>
        </div>
      </div>

      {/* Overdue banner */}
      {overdueCases.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{overdueCases.length} overdue case{overdueCases.length !== 1 ? "s" : ""} require immediate attention</span>
          <Button variant="destructive" size="sm" className="ml-auto h-7 text-xs" asChild>
            <Link to="/sponsorship?filter=overdue">View Overdue</Link>
          </Button>
        </div>
      )}

      {/* Primary compliance row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Licence Health Score */}
        <div className={cn("rounded-xl border p-4 flex items-center gap-4", ragBg(licenceScore))}>
          <ScoreGauge score={licenceScore} size={72} />
          <div>
            <p className="text-xs text-muted-foreground font-medium">Licence Health</p>
            <p className={cn("text-sm font-bold mt-0.5", ragColor(licenceScore))}>
              {licenceScore >= 80 ? "Good Standing" : licenceScore >= 60 ? "Action Required" : "High Risk"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{activeWorkers.length} workers scored</p>
          </div>
        </div>

        {/* CoS Allocation */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">CoS Allocation</p>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          {licence ? (
            <>
              <div className="text-2xl font-bold">{cosRemaining}<span className="text-sm font-normal text-muted-foreground">/{cosTotal}</span></div>
              <p className="text-xs text-muted-foreground mb-2">remaining ({licence.cosUsed} used)</p>
              <Progress value={cosUsedPct} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">{cosUsedPct}% allocated</p>
            </>
          ) : <p className="text-sm text-muted-foreground">No licence data</p>}
        </div>

        {/* Sponsored Workers */}
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Sponsored Workers</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{activeWorkers.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Active sponsored employees</p>
          <p className="text-xs text-muted-foreground">{leavers.length} leaver{leavers.length !== 1 ? "s" : ""} (last 12mo)</p>
        </div>

        {/* Workers at Risk */}
        <div className={cn("rounded-xl border p-4", workersAtRisk.length > 0 ? "border-destructive/30 bg-destructive/5" : "bg-card")}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Workers at Risk</p>
            <TrendingDown className={cn("h-4 w-4", workersAtRisk.length > 0 ? "text-destructive" : "text-muted-foreground")} />
          </div>
          <div className={cn("text-2xl font-bold", workersAtRisk.length > 0 ? "text-destructive" : "")}>{workersAtRisk.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Compliance score &lt; 60%</p>
          {workersAtRisk.length > 0 && (
            <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-destructive mt-1">
              <Link to="/people">View workers →</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Upcoming Expiries</p>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className={cn("text-2xl font-bold", (expiringVisas.length + expiringPassports.length) > 0 ? "text-warning" : "")}>{expiringVisas.length + expiringPassports.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">{expiringVisas.length} visa · {expiringPassports.length} passport (90d)</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Reporting Deadlines</p>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className={cn("text-2xl font-bold", reportingDeadlines.length > 0 ? "text-warning" : "")}>{reportingDeadlines.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Due within 14 days</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Leavers (12 months)</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{leavers.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">In retention period</p>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Open Cases</p>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{openCases.length}</div>
          <p className={cn("text-xs mt-0.5", overdueCases.length > 0 ? "text-destructive font-medium" : "text-muted-foreground")}>{overdueCases.length} overdue</p>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cases by status */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Active Cases</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sponsorship" className="flex items-center gap-1 text-xs">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
            {Object.entries(statusGroups).map(([status, count]) => (
              <div key={status} className="text-center rounded-lg bg-muted/50 p-3">
                <div className="text-xl font-bold">{count}</div>
                <StatusBadge status={status} className="mt-1 text-[10px]" />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {cases.filter(c => !["closed", "cancelled"].includes(c.status)).slice(0, 5).map(c => (
              <Link key={c.id} to={`/sponsorship/${c.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className={cn("h-2 w-2 rounded-full shrink-0", c.isOverdue ? "bg-destructive" : "bg-secondary")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.caseNumber}</p>
                </div>
                <StatusBadge status={c.status} />
                {c.dueDate && <SLATimer dueDate={c.dueDate} isOverdue={c.isOverdue} compact />}
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming expiries */}
          <div className="rounded-xl border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Upcoming Expiries</h2>
              <Button variant="ghost" size="sm" asChild><Link to="/people" className="text-xs">View all</Link></Button>
            </div>
            {[...expiringVisas.map(w => ({ worker: w, type: "Visa", expiry: w.visaExpiry! })),
              ...expiringPassports.map(w => ({ worker: w, type: "Passport", expiry: w.passportExpiry! }))
            ].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()).slice(0, 5).map(item => {
              const diff = Math.ceil((new Date(item.expiry).getTime() - today.getTime()) / 86400000);
              return (
                <div key={`${item.worker.id}-${item.type}`} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{item.worker.givenName} {item.worker.familyName}</p>
                    <p className="text-xs text-muted-foreground">{item.type} · expires {new Date(item.expiry).toLocaleDateString("en-GB")}</p>
                  </div>
                  <span className={cn("text-xs font-medium", diff <= 30 ? "text-destructive" : diff <= 60 ? "text-warning" : "text-muted-foreground")}>
                    {diff}d
                  </span>
                </div>
              );
            })}
            {expiringVisas.length + expiringPassports.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming expiries</p>
            )}
          </div>

          {/* Invoices (secondary) */}
          <div className="rounded-xl border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm">Unpaid Invoices</h2>
              <Button variant="ghost" size="sm" asChild><Link to="/billing" className="text-xs">View all</Link></Button>
            </div>
            {unpaidInvoices.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-3">All invoices paid ✓</p>
              : <>
                  <div className="text-lg font-bold text-destructive mb-1">£{totalUnpaid.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mb-3">{unpaidInvoices.length} outstanding invoice{unpaidInvoices.length !== 1 ? "s" : ""}</p>
                  {unpaidInvoices.slice(0, 2).map(inv => (
                    <div key={inv.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                      <div>
                        <p className="text-xs font-medium">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">Due {new Date(inv.dueDate).toLocaleDateString("en-GB")}</p>
                      </div>
                      <p className="text-xs font-bold text-destructive">£{inv.total.toLocaleString()}</p>
                    </div>
                  ))}
                </>
            }
          </div>
        </div>
      </div>

      {/* Internal: cross-tenant */}
      {isInternal && (
        <div className="rounded-xl border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <h2 className="font-semibold mb-4">Caseworker Workload</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "James Adebayo", active: 3, overdue: 1 },
              { label: "Deniz Yilmaz", active: 2, overdue: 0 },
            ].map(cw => (
              <div key={cw.label} className="rounded-lg border p-4">
                <p className="font-medium text-sm">{cw.label}</p>
                <div className="flex gap-4 mt-2">
                  <div><p className="text-xl font-bold">{cw.active}</p><p className="text-xs text-muted-foreground">Active</p></div>
                  <div><p className={cn("text-xl font-bold", cw.overdue > 0 ? "text-destructive" : "")}>{cw.overdue}</p><p className="text-xs text-muted-foreground">Overdue</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
