import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/Dashboard";
import SponsorshipPage from "@/pages/Sponsorship";
import ReportingPage from "@/pages/Reporting";
import PeoplePage from "@/pages/People";
import RequestsPage from "@/pages/Requests";
import RecruitmentPage from "@/pages/Recruitment";
import SettingsPage from "@/pages/Settings";
import AdminPage from "@/pages/Admin";
import LeaveManagementPage from "@/pages/LeaveManagement";
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
              <Route path="/sponsorship/cos" element={<SponsorshipPage tab="cos" />} />
              <Route path="/sponsorship/cos-list" element={<SponsorshipPage tab="cos-list" />} />
              <Route path="/sponsorship/report-migrant" element={<SponsorshipPage tab="migrant" />} />
              <Route path="/sponsorship/report-business" element={<SponsorshipPage tab="business" />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/recruitment" element={<RecruitmentPage />} />
              <Route path="/leave" element={<LeaveManagementPage />} />
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
