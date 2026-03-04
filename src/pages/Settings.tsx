import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_TENANTS, DEMO_WORK_LOCATIONS, DEMO_SPONSOR_LICENCES } from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Building2, MapPin, Bell, FileText, Plus, ShieldCheck, CreditCard, Upload, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const LICENCE_DOCS = [
  { id: "ld1", name: "Sponsor Application Bundle", description: "Original application documents submitted to UKVI", status: "present" },
  { id: "ld2", name: "Approval Letters", description: "Home Office approval letters for sponsor licence", status: "present" },
  { id: "ld3", name: "Action Plans", description: "Any compliance action plans issued by UKVI", status: "missing" },
  { id: "ld4", name: "Compliance Visit Letters", description: "Correspondence from compliance visits", status: "missing" },
  { id: "ld5", name: "Home Office Correspondence", description: "All other HO correspondence", status: "present" },
];

function SponsorLicenceTab() {
  const { currentTenant } = useApp();
  const licence = DEMO_SPONSOR_LICENCES.find(l => l.tenantId === currentTenant?.id) ?? DEMO_SPONSOR_LICENCES[0];
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [applied, setApplied] = useState(false);

  const cosTotal = licence.cosDefinedAvailable + licence.cosUndefinedAvailable;
  const cosRemaining = cosTotal - licence.cosUsed;
  const usedPct = Math.round((licence.cosUsed / cosTotal) * 100);
  const daysToExpiry = Math.ceil((new Date(licence.expiryDate).getTime() - Date.now()) / 86400000);

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="apply">Apply</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview">
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Licence Details</h2>
              <span className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full",
                licence.rating === "A" ? "bg-success/10 text-success border border-success/30" : "bg-warning/10 text-warning border border-warning/30"
              )}>
                {licence.type}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["Licence Number", licence.licenceNumber],
                ["Rating", `${licence.rating}-Rated`],
                ["Issue Date", new Date(licence.issueDate).toLocaleDateString("en-GB")],
                ["Expiry Date", new Date(licence.expiryDate).toLocaleDateString("en-GB")],
                ["Renewal Due", licence.renewalDate ? new Date(licence.renewalDate).toLocaleDateString("en-GB") : "—"],
                ["Days to Expiry", daysToExpiry > 0 ? `${daysToExpiry} days` : "Expired"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className={cn("font-medium mt-0.5", k === "Days to Expiry" && daysToExpiry < 90 ? "text-destructive" : "")}>{v}</dd>
                </div>
              ))}
            </div>
          </div>

          {/* CoS Allocation */}
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-semibold mb-4">CoS Allocation</h2>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Defined Available", value: licence.cosDefinedAvailable, color: "text-primary" },
                { label: "Undefined Available", value: licence.cosUndefinedAvailable, color: "text-secondary" },
                { label: "Used", value: licence.cosUsed, color: "text-muted-foreground" },
                { label: "Remaining", value: cosRemaining, color: cosRemaining < 5 ? "text-destructive" : "text-success" },
              ].map(item => (
                <div key={item.label} className="text-center rounded-lg border bg-muted/20 p-3">
                  <div className={cn("text-2xl font-bold", item.color)}>{item.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Allocation usage</span>
                <span>{licence.cosUsed} of {cosTotal} used ({usedPct}%)</span>
              </div>
              <Progress value={usedPct} className={cn("h-2", usedPct > 80 ? "[&>div]:bg-destructive" : usedPct > 60 ? "[&>div]:bg-warning" : "")} />
            </div>
            {cosRemaining < 5 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Only {cosRemaining} CoS remaining — consider requesting additional allocation
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Documents */}
      <TabsContent value="documents">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Licence Documents</h2>
            <Button size="sm" variant="outline"><Upload className="h-3.5 w-3.5 mr-1.5" />Upload</Button>
          </div>
          <div className="space-y-3">
            {LICENCE_DOCS.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3">
                  {doc.status === "present"
                    ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                    : <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  }
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    doc.status === "present" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {doc.status === "present" ? "Uploaded" : "Missing"}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs">{doc.status === "present" ? "View" : "Upload"}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      {/* Apply */}
      <TabsContent value="apply">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold mb-2">Apply for Sponsor Licence / Renewal</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Create a new Licence Application Case. Denizns will guide you through the process and prepare your application.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {[
              { title: "New Application", desc: "Apply for a new sponsor licence for your organisation", badge: "~3–6 months", icon: "🏢" },
              { title: "Licence Renewal", desc: "Renew an existing sponsor licence before it expires", badge: "Apply 3 months early", icon: "🔄" },
              { title: "Rating Upgrade (B→A)", desc: "Apply to upgrade from B-rated to A-rated licence", badge: "Requires action plan", icon: "⬆️" },
              { title: "Add Route", desc: "Add a new immigration route to an existing licence", badge: "e.g. Graduate route", icon: "➕" },
            ].map(opt => (
              <button key={opt.title} className="text-left rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors p-4">
                <div className="text-2xl mb-2">{opt.icon}</div>
                <h3 className="font-semibold text-sm">{opt.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                <span className="inline-block mt-2 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{opt.badge}</span>
              </button>
            ))}
          </div>
          {applied ? (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 border border-success/30 p-3 text-success text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Licence application case created — Denizns has been notified and will be in touch within 24 hours.</span>
            </div>
          ) : showApplyConfirm ? (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-3">
              <p className="text-sm font-medium">Confirm: Create a Licence Application Case?</p>
              <p className="text-xs text-muted-foreground">A new case will be raised and assigned to the Denizns compliance team. You will be notified of next steps.</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { setApplied(true); setShowApplyConfirm(false); }}>Confirm</Button>
                <Button size="sm" variant="outline" onClick={() => setShowApplyConfirm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowApplyConfirm(true)}>
              <CreditCard className="h-4 w-4 mr-1.5" />
              Create Licence Application Case
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default function SettingsPage() {
  const { currentTenant, isInternal } = useApp();
  const locations = DEMO_WORK_LOCATIONS.filter(l => currentTenant ? l.tenantId === currentTenant.id : true);

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">{currentTenant?.name ?? "System"} configuration</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="company"><Building2 className="h-3.5 w-3.5 mr-1.5" />Company</TabsTrigger>
          <TabsTrigger value="licence"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />Sponsor Licence</TabsTrigger>
          <TabsTrigger value="locations"><MapPin className="h-3.5 w-3.5 mr-1.5" />Locations</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-3.5 w-3.5 mr-1.5" />Notifications</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="h-3.5 w-3.5 mr-1.5" />Documents</TabsTrigger>
          {isInternal && <TabsTrigger value="system"><ShieldCheck className="h-3.5 w-3.5 mr-1.5" />System</TabsTrigger>}
        </TabsList>

        <TabsContent value="company" className="mt-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Company Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Company Name</Label><Input defaultValue={currentTenant?.name} className="mt-1" /></div>
              <div><Label>Sponsor Licence Number</Label><Input defaultValue={currentTenant?.sponsorLicenceNumber} className="mt-1" /></div>
              <div><Label>Address</Label><Input defaultValue={currentTenant?.address} className="mt-1" /></div>
              <div><Label>City</Label><Input defaultValue={currentTenant?.city} className="mt-1" /></div>
              <div><Label>Postcode</Label><Input defaultValue={currentTenant?.postcode} className="mt-1" /></div>
            </div>
            <Button>Save Changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="licence" className="mt-5">
          <SponsorLicenceTab />
        </TabsContent>

        <TabsContent value="locations" className="mt-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Work Locations</h2>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Location</Button>
            </div>
            <div className="space-y-3">
              {locations.map(l => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.addressLine1}, {l.city}, {l.postcode}</p>
                    </div>
                    {l.isPrimary && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Primary</span>}
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Notification Preferences</h2>
            {[
              { label: "Visa expiry reminders", desc: "Alert when worker visa expires within 90 days", defaultChecked: true },
              { label: "Passport expiry reminders", desc: "Alert when worker passport expires within 90 days", defaultChecked: true },
              { label: "Missing document alerts", desc: "Notify when required documents are missing", defaultChecked: true },
              { label: "Case deadline reminders", desc: "Reminders 7 days, 3 days, and 1 day before due date", defaultChecked: true },
              { label: "Overdue case alerts", desc: "Daily alerts for overdue cases", defaultChecked: false },
              { label: "Invoice due reminders", desc: "Reminder 7 days before invoice due date", defaultChecked: true },
              { label: "Retention expiry alerts", desc: "Alert 30 days before 12-month leaver retention period ends", defaultChecked: true },
              { label: "Compliance score drops", desc: "Alert when a worker's compliance score falls below 60%", defaultChecked: true },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{n.label}</p>
                  <p className="text-xs text-muted-foreground">{n.desc}</p>
                </div>
                <Switch defaultChecked={n.defaultChecked} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Mandatory Document Templates</h2>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
            <p className="text-sm text-muted-foreground">Configure required documents for all sponsored workers.</p>
            {["Passport", "Visa/BRP", "Right to Work Evidence", "Contract", "Offer Letter", "DBS Certificate"].map(doc => (
              <div key={doc} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{doc}</span></div>
                <Switch defaultChecked={["Passport", "Visa/BRP", "Right to Work Evidence", "Contract"].includes(doc)} />
              </div>
            ))}
          </div>
        </TabsContent>

        {isInternal && (
          <TabsContent value="system" className="mt-5">
            <div className="rounded-xl border bg-card p-5 space-y-5">
              <h2 className="font-semibold">Global Fee Defaults</h2>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>CoS Fee (£)</Label><Input type="number" defaultValue={525} className="mt-1" /></div>
                <div><Label>ISC per year (£)</Label><Input type="number" defaultValue={480} className="mt-1" /></div>
                <div><Label>Service Fee (£)</Label><Input type="number" defaultValue={600} className="mt-1" /></div>
              </div>
              <h2 className="font-semibold pt-2">SLA Defaults (days)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>CoS Draft</Label><Input type="number" defaultValue={10} className="mt-1" /></div>
                <div><Label>Migrant Report</Label><Input type="number" defaultValue={5} className="mt-1" /></div>
                <div><Label>Business Report</Label><Input type="number" defaultValue={7} className="mt-1" /></div>
                <div><Label>Support Request</Label><Input type="number" defaultValue={3} className="mt-1" /></div>
              </div>
              <Button>Save System Settings</Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
