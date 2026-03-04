import React, { createContext, useContext, useState } from "react";
import { User, Tenant, UserRole } from "@/types";
import { DEMO_USERS, DEMO_TENANTS } from "@/data/demo";

interface AppContextType {
  currentUser: User;
  currentTenant: Tenant | null;
  setCurrentUser: (user: User) => void;
  setCurrentTenant: (tenant: Tenant | null) => void;
  isInternal: boolean;
  canAccess: (roles: UserRole[]) => boolean;
  availableTenants: Tenant[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(DEMO_TENANTS[0]);

  const isInternal = currentUser.tenantId === null;

  const canAccess = (roles: UserRole[]) => roles.includes(currentUser.role);

  const availableTenants = isInternal ? DEMO_TENANTS : DEMO_TENANTS.filter(t => t.id === currentUser.tenantId);

  return (
    <AppContext.Provider value={{ currentUser, currentTenant, setCurrentUser, setCurrentTenant, isInternal, canAccess, availableTenants }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
