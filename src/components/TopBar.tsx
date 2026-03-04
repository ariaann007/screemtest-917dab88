import { Search, Bell, ChevronDown, LogOut, Settings, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";
import { DEMO_NOTIFICATIONS, DEMO_USERS } from "@/data/demo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  client_ao: "Authorising Officer",
  client_hr: "HR User",
  denizns_caseworker: "Caseworker",
  denizns_manager: "Compliance Manager",
  super_admin: "Super Admin",
};

export function TopBar() {
  const { currentUser, setCurrentUser, setCurrentTenant, availableTenants, isInternal } = useApp();

  const unreadCount = DEMO_NOTIFICATIONS.filter(n => n.userId === currentUser.id && !n.isRead).length;
  const notifications = DEMO_NOTIFICATIONS.filter(n => n.userId === currentUser.id).slice(0, 5);

  return (
    <header className="h-14 border-b bg-card flex items-center gap-3 px-4 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workers, cases, invoices…"
            className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Switch persona (demo) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <User className="h-3 w-3" />
              Demo: {ROLE_LABELS[currentUser.role]}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Persona (Demo)</DropdownMenuLabel>
            {DEMO_USERS.map(u => (
              <DropdownMenuItem
                key={u.id}
                onClick={() => {
                  setCurrentUser(u);
                  if (u.tenantId) {
                    const tenant = availableTenants.find(t => t.id === u.tenantId) ?? null;
                    setCurrentTenant(tenant);
                  } else {
                    setCurrentTenant(null);
                  }
                }}
                className={cn("flex flex-col items-start gap-0.5 cursor-pointer", currentUser.id === u.id && "bg-accent")}
              >
                <span className="font-medium text-sm">{u.name}</span>
                <span className="text-xs text-muted-foreground">{ROLE_LABELS[u.role]} {u.tenantId ? "" : "· Denizns"}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">No notifications</div>
            ) : notifications.map(n => (
              <DropdownMenuItem key={n.id} className={cn("flex flex-col items-start gap-1 cursor-pointer py-3", !n.isRead && "bg-accent/50")}>
                <div className="flex items-center gap-2 w-full">
                  <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", n.type === "warning" ? "bg-warning" : n.type === "error" ? "bg-destructive" : "bg-info")} />
                  <span className="font-medium text-sm flex-1">{n.title}</span>
                  {!n.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground ml-3.5 leading-snug">{n.body}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2">
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <span className="text-sm font-medium hidden md:block">{currentUser.name.split(" ")[0]}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{currentUser.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{currentUser.email}</span>
                <span className="text-xs font-normal text-secondary mt-0.5">{ROLE_LABELS[currentUser.role]}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="h-4 w-4 mr-2" />Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="h-4 w-4 mr-2" />Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive"><LogOut className="h-4 w-4 mr-2" />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
