import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  PlatformTenant, PlatformAlert, PlatformAuditLog, 
  ImpersonationSession, SuperAdminSession, PlatformPlan 
} from "@/types/super-admin";
import { useToast } from "@/hooks/use-toast";

interface SuperAdminContextType {
  tenants: PlatformTenant[];
  alerts: PlatformAlert[];
  auditLogs: PlatformAuditLog[];
  activeSessions: ImpersonationSession[];
  currentSession: SuperAdminSession | null;
  login: (email: string) => void;
  logout: () => void;
  createTenant: (tenant: Partial<PlatformTenant>) => void;
  updateTenant: (id: string, updates: Partial<PlatformTenant>) => void;
  suspendTenant: (id: string, reason: string, notes: string) => void;
  impersonate: (tenantId: string, duration: number, reason: string, notes: string) => void;
  changePlan: (id: string, plan: "Starter" | "Pro" | "Enterprise", price?: number) => void;
  logAction: (action: string, actionType: PlatformAuditLog["actionType"], details: string, tenantId?: string) => void;
  currentTime: string;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

const INITIAL_TENANTS: PlatformTenant[] = [
  {
    id: "t1",
    name: "Acme Group Holdings Ltd",
    subdomain: "acme",
    sponsorLicenceNumber: "123456789",
    address: "14 Portman Square",
    city: "London",
    postcode: "W1H 6LW",
    createdAt: "2023-01-15T10:00:00Z",
    plan: "Enterprise",
    status: "Active",
    entityCount: 3,
    workerCount: 45,
    healthScore: 92,
    lastLogin: "2024-03-24T08:30:00Z",
    mrr: 2450,
    adminEmail: "admin@acme.com",
    adminName: "Sarah Jones",
    country: "United Kingdom",
    industry: "Recruitment & Staffing",
    trialPeriodDays: 30,
    limits: { entities: 10, sites: 10, workers: 250 }
  },
  {
    id: "t2",
    name: "Tech Solutions Global",
    subdomain: "techsol",
    sponsorLicenceNumber: "987654321",
    address: "Tech Plaza",
    city: "Manchester",
    postcode: "M1 1AB",
    createdAt: "2023-11-20T14:30:00Z",
    plan: "Pro",
    status: "Trial",
    entityCount: 1,
    workerCount: 12,
    healthScore: 78,
    lastLogin: "2024-03-23T16:45:00Z",
    mrr: 450,
    adminEmail: "mark@techsol.io",
    adminName: "Mark Webber",
    country: "United Kingdom",
    industry: "Technology",
    trialPeriodDays: 14,
    limits: { entities: 2, sites: 2, workers: 50 }
  },
  {
    id: "t3",
    name: "Global Logistics UK",
    subdomain: "globallog",
    sponsorLicenceNumber: "555666777",
    address: "Logistics Hub",
    city: "Birmingham",
    postcode: "B1 2CC",
    createdAt: "2022-05-10T09:00:00Z",
    plan: "Starter",
    status: "Suspended",
    entityCount: 1,
    workerCount: 5,
    healthScore: 45,
    lastLogin: "2024-02-15T11:20:00Z",
    mrr: 150,
    adminEmail: "safety@globallog.co.uk",
    adminName: "David Brown",
    country: "United Kingdom",
    industry: "Logistics",
    trialPeriodDays: 30,
    limits: { entities: 1, sites: 1, workers: 10 }
  }
];

const INITIAL_ALERTS: PlatformAlert[] = [
  { id: "a1", tenantId: "t1", tenantName: "Acme Group", severity: "Warning", description: "Visa expiry for 3 workers within 30 days", timestamp: "2024-03-24T07:15:00Z", isRead: false },
  { id: "a2", tenantId: "t3", tenantName: "Global Logistics", severity: "Critical", description: "Mandatory reporting event overdue by 5 days", timestamp: "2024-03-23T14:20:00Z", isRead: false },
];

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<PlatformTenant[]>(INITIAL_TENANTS);
  const [alerts, setAlerts] = useState<PlatformAlert[]>(INITIAL_ALERTS);
  const [auditLogs, setAuditLogs] = useState<PlatformAuditLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<ImpersonationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<SuperAdminSession | null>(null);

  // Persistence for session
  useEffect(() => {
    const saved = localStorage.getItem("superAdminSession");
    if (saved) {
      setCurrentSession(JSON.parse(saved));
    }
  }, []);

  const login = (email: string) => {
    const session: SuperAdminSession = {
      email,
      name: "Super Admin",
      token: "mock-token-" + Date.now(),
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("superAdminSession", JSON.stringify(session));
    setCurrentSession(session);
    logAction("Login", "Login", "Super Admin logged in from portal", undefined);
  };

  const logout = () => {
    localStorage.removeItem("superAdminSession");
    setCurrentSession(null);
  };

  const logAction = (action: string, actionType: PlatformAuditLog["actionType"], details: string, tenantId?: string) => {
    const tenantName = tenants.find(t => t.id === tenantId)?.name;
    const newLog: PlatformAuditLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString(),
      agentName: "Super Admin",
      agentEmail: "admin@screem.io",
      action,
      actionType,
      targetTenantId: tenantId,
      targetTenantName: tenantName,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const createTenant = (tenantData: Partial<PlatformTenant>) => {
    const newTenant: PlatformTenant = {
      ...tenantData as PlatformTenant,
      id: "t" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "Active",
      healthScore: 100,
      limits: { entities: 1, sites: 1, workers: 10 },
      entityCount: 0,
      workerCount: 0,
      mrr: tenantData.plan === "Starter" ? 150 : tenantData.plan === "Pro" ? 450 : 2500,
      lastLogin: new Date().toISOString()
    };
    setTenants(prev => [...prev, newTenant]);
    logAction("Created tenant", "Create", `New tenant ${newTenant.name} created.`, newTenant.id);
  };

  const updateTenant = (id: string, updates: Partial<PlatformTenant>) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    logAction("Updated tenant", "Update", "Tenant metadata modified.", id);
  };

  const suspendTenant = (id: string, reason: string, notes: string) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: "Suspended", internalNotes: notes } : t));
    logAction("Suspended tenant", "Suspend", `Reason: ${reason}. Notes: ${notes}`, id);
  };

  const impersonate = (tenantId: string, duration: number, reason: string, notes: string) => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const tenant = tenants.find(t => t.id === tenantId);
    
    const newSession: ImpersonationSession = {
      id: "sess-" + Date.now(),
      tenantId,
      tenantName: tenant?.name || "Unknown",
      adminName: "Super Admin",
      adminEmail: "admin@screem.io",
      startTime: startTime.toISOString(),
      durationMinutes: duration,
      endTime: endTime.toISOString(),
      reason,
      notes,
      status: "Active"
    };

    setActiveSessions(prev => [newSession, ...prev]);
    logAction("Impersonated user", "Impersonate", `Session duration: ${duration}min. Reason: ${reason}.`, tenantId);
    
    toast({
      title: "Support session started",
      description: `Viewing as ${tenant?.name}. Session ends in ${duration} minutes.`,
    });
  };

  const changePlan = (id: string, plan: PlatformPlan, price?: number) => {
    const mrr = price || (plan === "Starter" ? 150 : plan === "Pro" ? 450 : 2500);
    setTenants(prev => prev.map(t => t.id === id ? { ...t, plan, mrr } : t));
    logAction("Changed plan", "PlanChange", `Plan changed to ${plan} with MRR £${mrr}`, id);
  };

  return (
    <SuperAdminContext.Provider value={{
      tenants, alerts, auditLogs, activeSessions, currentSession,
      login, logout, createTenant, updateTenant, suspendTenant,
      impersonate, changePlan, logAction,
      currentTime: new Date().toISOString()
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
}
