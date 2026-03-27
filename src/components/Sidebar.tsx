import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Award, Users, InboxIcon,
  Settings, ShieldCheck, Building2, UserPlus, CalendarDays, Clock,
  ChevronDown, ChevronRight, ClipboardList, DollarSign, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  subItems?: { label: string; href: string }[];
  badge?: string;
}

const buildNav = (isInternal: boolean): NavItem[] => {
  const items: NavItem[] = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Onboarding", href: "/onboarding", icon: ClipboardList },
    { label: "People", href: "/people", icon: Users },
    { label: "Time", href: "/time", icon: Clock, subItems: [
      { label: "Leave", href: "/leave" },
      { label: "Attendance", href: "/attendance" },
    ]},
    { label: "Payroll", href: "/payroll", icon: DollarSign },
    { label: "Performance & Training", href: "/performance", icon: GraduationCap },
    { label: "Sponsorship", href: "/sponsorship", icon: Award, subItems: [
      { label: "CoS & Reporting", href: "/sponsorship" },
      { label: "Requests", href: "/requests" },
    ]},
    { label: "Organisation", href: "/organisation", icon: Building2, subItems: [
      { label: "Organisation Profile", href: "/organisation/profile" },
      { label: "Legal Entities", href: "/organisation/legal-entities" },
      { label: "Group Structure", href: "/organisation/group-structure" },
      { label: "Sites & Branches", href: "/organisation/sites" },
      { label: "Sponsor Licences", href: "/organisation/licences" },
      { label: "Compliance", href: "/organisation/compliance" },
      { label: "Roles & Access", href: "/organisation/roles" },
    ]},
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  if (isInternal) {
    items.push({ label: "Admin", href: "/admin", icon: ShieldCheck, badge: "INT" });
  }

  return items;
};

function ExpandableNavItem({ item, location }: { item: NavItem; location: ReturnType<typeof useLocation> }) {
  const isActive = item.href === "/"
    ? location.pathname === "/"
    : location.pathname.startsWith(item.href) ||
      (item.subItems?.some(s => location.pathname.startsWith(s.href)) ?? false);

  const [expanded, setExpanded] = useState(isActive);

  const hasSubItems = item.subItems && item.subItems.length > 0;

  return (
    <li>
      {hasSubItems ? (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] bg-secondary/20 text-secondary rounded px-1">{item.badge}</span>
            )}
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
          {expanded && (
            <ul className="mt-1 ml-9 space-y-1 border-l border-sidebar-border/30 pl-3">
              {item.subItems!.map(sub => (
                <li key={sub.href}>
                  <Link
                    to={sub.href}
                    className={cn(
                      "block text-xs py-1.5 transition-colors",
                      location.pathname === sub.href
                        ? "text-sidebar-primary-foreground font-semibold"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                    )}
                  >
                    {sub.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <Link
          to={item.href}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {item.label}
          {item.badge && (
            <span className="ml-auto text-[10px] bg-secondary/20 text-secondary rounded px-1">{item.badge}</span>
          )}
        </Link>
      )}
    </li>
  );
}

export function Sidebar() {
  const { currentUser, currentTenant, isInternal, setCurrentTenant, availableTenants } = useApp();
  const location = useLocation();

  const navItems = buildNav(isInternal);

  return (
    <aside className="w-60 shrink-0 flex flex-col h-full" style={{ background: "var(--gradient-hero)" }}>
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(267 80% 57%)" }}>
            <span className="text-white font-black text-xs tracking-tighter">SC</span>
          </div>
          <span className="font-black text-base tracking-tight" style={{ color: "hsl(74 100% 56%)" }}>SCREEM</span>
        </div>
      </div>

      {/* Tenant Selector */}
      <div className="px-3 py-2 border-b border-sidebar-border">
        {isInternal ? (
          <div className="space-y-1">
            <p className="text-xs text-sidebar-foreground/50 px-2 uppercase tracking-wider font-medium mb-1">View as</p>
            {availableTenants.map(t => (
              <button
                key={t.id}
                onClick={() => setCurrentTenant(currentTenant?.id === t.id ? null : t)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors text-left",
                  currentTenant?.id === t.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{t.name}</span>
              </button>
            ))}
            <button
              onClick={() => setCurrentTenant(null)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors text-left",
                !currentTenant && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span>All Tenants</span>
            </button>
          </div>
        ) : currentTenant ? (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-6 w-6 rounded bg-secondary/20 flex items-center justify-center shrink-0">
              <Building2 className="h-3 w-3 text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{currentTenant.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{currentTenant.sponsorLicenceNumber}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3">
        <ul className="space-y-0.5">
          {navItems.map(item => (
            <ExpandableNavItem key={item.label} item={item} location={location} />
          ))}
        </ul>
      </nav>

      {/* User foot */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              {isInternal ? "SCREEM Staff" : currentTenant?.name}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
