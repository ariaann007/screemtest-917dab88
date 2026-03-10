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
import EmployeeProfile from "@/pages/EmployeeProfile";
import RequestsPage from "@/pages/Requests";
import RecruitmentPage from "@/pages/Recruitment";
import SettingsPage from "@/pages/Settings";
import AdminPage from "@/pages/Admin";
import LeaveManagementPage from "@/pages/LeaveManagement";
import OnboardingPage from "@/pages/Onboarding";
import OnboardingCasePage from "@/pages/OnboardingCase";
import TimePage from "@/pages/Time";
import PayrollPage from "@/pages/Payroll";
import PerformancePage from "@/pages/Performance";
import OrganisationPage from "@/pages/Organisation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/sponsorship" element={<SponsorshipPage />} />
              <Route path="/sponsorship/:id" element={<SponsorshipPage />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/people/:id" element={<EmployeeProfile />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/recruitment" element={<RecruitmentPage />} />
              <Route path="/leave" element={<LeaveManagementPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/onboarding/:id" element={<OnboardingCasePage />} />
              <Route path="/time" element={<TimePage />} />
              <Route path="/payroll" element={<PayrollPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/organisation" element={<OrganisationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
