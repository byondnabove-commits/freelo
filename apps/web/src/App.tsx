import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { GuestRoute } from "@/components/layout/GuestRoute";
import { OrganizationGuard } from "@/components/layout/OrganizationGuard";
import AppShell from "@/components/layout/AppShell";

// Guest Authentication Views
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Tenant Onboarding Flow Wizard Module
import OnboardingWizard from "@/pages/auth/onboarding";

// Core Panel Subview Screens
import DashboardOverview from "@/pages/dashboard/Overview";
import ProjectsPage from "@/pages/dashboard/Projects";
import CRMPage from "@/pages/dashboard/CRM";
import KanbanPage from "@/pages/dashboard/Kanban";
import ProposalsPage from "@/pages/dashboard/Proposals";
import ContractsPage from "@/pages/dashboard/Contracts";
import FormsPage from "@/pages/dashboard/Forms";
import SettingsPage from "@/pages/dashboard/Settings";
import ProfilePage from "@/pages/dashboard/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Guest Routes --- */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* --- Guard Layer 1: Requires Authenticated Session --- */}
        <Route element={<PrivateRoute />}>
          <Route path="/onboarding" element={<OnboardingWizard />} />

          {/* --- Guard Layer 2: Requires Active Selected Workspace --- */}
          <Route element={<OrganizationGuard />}>
            {/* Navigational Shell routes downstream view stages perfectly */}
            <Route path="/dashboard" element={<AppShell />}>
              <Route index element={<DashboardOverview />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="crm" element={<CRMPage />} />
              <Route path="kanban" element={<KanbanPage />} />
              <Route path="proposals" element={<ProposalsPage />} />
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="forms" element={<FormsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* Redirect root domain requests straight to active analytics board */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Global Fallback Route Redirect Engine */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}