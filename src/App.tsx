import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/Dashboard";
import SponsorshipPage from "@/pages/Sponsorship";
import PeoplePage from "@/pages/People";
import RequestsPage from "@/pages/Requests";
import RecruitmentPage from "@/pages/Recruitment";

// Onboarding uses the Recruitment page (which contains the full onboarding workflow)
const OnboardingPage = RecruitmentPage;
import SettingsPage from "@/pages/Settings";
import AttendancePage from "@/pages/Attendance";
import OrganisationPage from "@/pages/Organisation";
import LeaveManagementPage from "@/pages/LeaveManagement";
import AdminPage from "@/pages/Admin";
import NotFound from "./pages/NotFound";

import { SuperAdminProvider } from "@/context/SuperAdminContext";
import { SuperAdminLayout } from "@/components/super-admin/SuperAdminLayout";
import SuperAdminLoginPage from "@/pages/super-admin/Login";
import SuperAdminDashboard from "@/pages/super-admin/Dashboard";
import SuperAdminTenants from "@/pages/super-admin/Tenants";
import SuperAdminAlerts from "@/pages/super-admin/Alerts";
import SuperAdminAudit from "@/pages/super-admin/Audit";
import SuperAdminSupport from "@/pages/super-admin/Support";
import SuperAdminBilling from "@/pages/super-admin/Billing";
import SuperAdminHealth from "@/pages/super-admin/Health";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SuperAdminProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Super Admin Module */}
              <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
              <Route path="/super-admin" element={<SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout>} />
              <Route path="/super-admin/dashboard" element={<SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout>} />
              <Route path="/super-admin/tenants" element={<SuperAdminLayout><SuperAdminTenants /></SuperAdminLayout>} />
              <Route path="/super-admin/alerts" element={<SuperAdminLayout><SuperAdminAlerts /></SuperAdminLayout>} />
              <Route path="/super-admin/audit" element={<SuperAdminLayout><SuperAdminAudit /></SuperAdminLayout>} />
              <Route path="/super-admin/support" element={<SuperAdminLayout><SuperAdminSupport /></SuperAdminLayout>} />
              <Route path="/super-admin/billing" element={<SuperAdminLayout><SuperAdminBilling /></SuperAdminLayout>} />
              <Route path="/super-admin/health" element={<SuperAdminLayout><SuperAdminHealth /></SuperAdminLayout>} />

              {/* Main App Module */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="/sponsorship" element={<SponsorshipPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/requests" element={<RequestsPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/organisation/*" element={<OrganisationPage />} />
                <Route path="/recruitment" element={<RecruitmentPage />} />
                <Route path="/leave" element={<LeaveManagementPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </SuperAdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
