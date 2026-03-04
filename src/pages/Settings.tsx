import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_TENANTS, DEMO_WORK_LOCATIONS } from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Building2, MapPin, Bell, FileText, Plus, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <TabsList>
          <TabsTrigger value="company"><Building2 className="h-3.5 w-3.5 mr-1.5" />Company</TabsTrigger>
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
