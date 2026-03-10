import { Link } from "react-router-dom";
import { Activity, ArrowRight, UserPlus, Upload, FileCheck, CalendarCheck, Shield, UserCog, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedItem {
  id: string;
  icon: React.FC<{ className?: string }>;
  iconBg: string;
  message: string;
  user: string;
  timestamp: string;
}

const FEED: FeedItem[] = [
  { id: "1", icon: Shield, iconBg: "bg-primary/10 text-primary", message: "CoS assigned to Ahmed Khan", user: "James Adebayo", timestamp: "2 min ago" },
  { id: "2", icon: Upload, iconBg: "bg-info/10 text-info", message: "Maria Silva uploaded passport document", user: "Maria Silva", timestamp: "18 min ago" },
  { id: "3", icon: CalendarCheck, iconBg: "bg-success/10 text-success", message: "Leave approved for John Smith (15–17 Mar)", user: "Sarah Johnson", timestamp: "45 min ago" },
  { id: "4", icon: AlertTriangle, iconBg: "bg-warning/10 text-warning", message: "Visa expiry alert triggered for Raj Patel", user: "System", timestamp: "1 hr ago" },
  { id: "5", icon: UserPlus, iconBg: "bg-secondary/10 text-secondary", message: "New employee Blessing Chukwu added", user: "Mark Thompson", timestamp: "2 hrs ago" },
  { id: "6", icon: FileCheck, iconBg: "bg-success/10 text-success", message: "Right to Work verified – Kwame Mensah", user: "Sarah Johnson", timestamp: "3 hrs ago" },
  { id: "7", icon: UserCog, iconBg: "bg-muted text-muted-foreground", message: "Role updated for Chioma Okonkwo → Senior", user: "Mark Thompson", timestamp: "5 hrs ago" },
  { id: "8", icon: Upload, iconBg: "bg-info/10 text-info", message: "BRP document uploaded for Tariq Rahman", user: "Tariq Rahman", timestamp: "Yesterday" },
];

export function ActivityFeedWidget() {
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-4 h-full" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-sm">Activity Feed</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin" className="flex items-center gap-1 text-xs">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="space-y-0 relative">
        {/* Timeline line */}
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-border" />

        {FEED.map((item, i) => (
          <div key={item.id} className={cn("flex items-start gap-3 py-2.5 relative", i < FEED.length - 1 ? "" : "")}>
            <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0 z-10", item.iconBg)}>
              <item.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-xs leading-snug">{item.message}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-muted-foreground font-medium">{item.user}</span>
                <span className="text-[10px] text-muted-foreground/50">·</span>
                <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
