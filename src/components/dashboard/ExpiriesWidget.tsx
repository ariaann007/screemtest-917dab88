import { Link } from "react-router-dom";
import { CalendarX, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Worker } from "@/types";

interface ExpiryItem {
  name: string;
  docType: string;
  expiryDate: string;
  daysLeft: number;
}

interface Props {
  workers: Worker[];
}

export function ExpiriesWidget({ workers }: Props) {
  const today = new Date();
  const in90 = new Date(today.getTime() + 90 * 86400000);

  const items: ExpiryItem[] = [];

  workers.forEach(w => {
    const name = `${w.givenName} ${w.familyName}`;
    if (w.visaExpiry) {
      const d = new Date(w.visaExpiry);
      if (d > today && d < in90) {
        items.push({ name, docType: "Visa", expiryDate: w.visaExpiry, daysLeft: Math.ceil((d.getTime() - today.getTime()) / 86400000) });
      }
    }
    if (w.passportExpiry) {
      const d = new Date(w.passportExpiry);
      if (d > today && d < in90) {
        items.push({ name, docType: "Passport", expiryDate: w.passportExpiry, daysLeft: Math.ceil((d.getTime() - today.getTime()) / 86400000) });
      }
    }
    if (w.brpExpiry) {
      const d = new Date(w.brpExpiry);
      if (d > today && d < in90) {
        items.push({ name, docType: "BRP", expiryDate: w.brpExpiry, daysLeft: Math.ceil((d.getTime() - today.getTime()) / 86400000) });
      }
    }
  });

  items.sort((a, b) => a.daysLeft - b.daysLeft);

  function statusColor(days: number) {
    if (days <= 30) return { dot: "bg-destructive", text: "text-destructive", badge: "bg-destructive/10 text-destructive border-destructive/20" };
    if (days <= 90) return { dot: "bg-warning", text: "text-warning", badge: "bg-warning/10 text-warning border-warning/20" };
    return { dot: "bg-success", text: "text-success", badge: "bg-success/10 text-success border-success/20" };
  }

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 h-full" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
            <CalendarX className="h-4 w-4 text-warning" />
          </div>
          <h2 className="font-semibold text-sm">Expiries</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/people" className="flex items-center gap-1 text-xs">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive inline-block" /> &lt;30 days</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning inline-block" /> 30–90 days</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success inline-block" /> &gt;90 days</span>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="text-left pb-2 font-medium">Employee</th>
              <th className="text-left pb-2 font-medium">Document</th>
              <th className="text-left pb-2 font-medium">Expiry Date</th>
              <th className="text-right pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 7).map((item, i) => {
              const colors = statusColor(item.daysLeft);
              return (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 font-medium">{item.name}</td>
                  <td className="py-2.5 text-muted-foreground">{item.docType}</td>
                  <td className="py-2.5 text-muted-foreground">
                    {new Date(item.expiryDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-2.5 text-right">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold", colors.badge)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
                      {item.daysLeft}d
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No upcoming expiries in the next 90 days</p>
        )}
      </div>
    </div>
  );
}
