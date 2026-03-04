import { useApp } from "@/context/AppContext";
import { DEMO_CASES, DEMO_AUDIT_LOGS, DEMO_WORKERS, DEMO_INVOICES, DEMO_SOC_CODES } from "@/data/demo";
import { StatusBadge } from "@/components/StatusBadge";
import { SLATimer } from "@/components/SLATimer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, FileText, Users, Activity, Upload, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { isInternal } = useApp();

  if (!isInternal) {
    return <div className="text-center py-16 text-muted-foreground">Access denied. Denizns staff only.</div>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="text-sm text-muted-foreground">System administration — Denizns internal only</p>
        </div>
      </div>

      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates"><FileText className="h-3.5 w-3.5 mr-1.5" />Form Templates</TabsTrigger>
          <TabsTrigger value="soc"><Users className="h-3.5 w-3.5 mr-1.5" />SOC Codes</TabsTrigger>
          <TabsTrigger value="audit"><Activity className="h-3.5 w-3.5 mr-1.5" />Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Form Templates</h2>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />New Template</Button>
            </div>
            {[
              { name: "CoS Pre-Draft", version: "v1", type: "CoS Draft", status: "published", sections: 6 },
              { name: "CoS Request (Assisted)", version: "v1", type: "CoS Draft (Assisted)", status: "published", sections: 2 },
              { name: "Stop Sponsoring", version: "v1", type: "Migrant Report", status: "published", sections: 4 },
              { name: "Continue Sponsoring", version: "v1", type: "Migrant Report", status: "published", sections: 3 },
              { name: "Change Circumstances", version: "v1", type: "Migrant Report", status: "published", sections: 3 },
              { name: "Replace Key Contact", version: "v1", type: "Business Report", status: "published", sections: 5 },
              { name: "Organisation Change", version: "v1", type: "Business Report", status: "published", sections: 4 },
            ].map(t => (
              <div key={t.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                <div>
                  <p className="font-medium text-sm">{t.name} <span className="text-muted-foreground font-normal">{t.version}</span></p>
                  <p className="text-xs text-muted-foreground">{t.type} · {t.sections} sections</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">Version</Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="soc" className="mt-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">SOC Codes</h2>
                <p className="text-sm text-muted-foreground">{DEMO_SOC_CODES.length} codes loaded</p>
              </div>
              <Button size="sm"><Upload className="h-4 w-4 mr-1" />Import CSV</Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Title</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Skill Level</th>
                </tr></thead>
                <tbody>
                  {DEMO_SOC_CODES.slice(0, 15).map(s => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="p-3 font-mono font-medium">{s.code}</td>
                      <td className="p-3">{s.title}</td>
                      <td className="p-3 text-muted-foreground">{s.skillLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-xs text-muted-foreground border-t">Showing 15 of {DEMO_SOC_CODES.length}</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-5">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h2 className="font-semibold">Audit Log</h2>
            <div className="space-y-2">
              {DEMO_AUDIT_LOGS.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/20">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 mt-0.5">
                    {log.userName.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{log.userName}</span>
                      <span className="text-muted-foreground text-sm">{log.action}</span>
                      {log.entityLabel && <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{log.entityLabel}</span>}
                    </div>
                    {log.before && log.after && (
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="bg-destructive/10 text-destructive px-2 py-0.5 rounded">{JSON.stringify(log.before)}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="bg-success-light text-success px-2 py-0.5 rounded">{JSON.stringify(log.after)}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{new Date(log.timestamp).toLocaleString("en-GB")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
