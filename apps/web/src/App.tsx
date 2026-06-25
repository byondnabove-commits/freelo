import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { GuestRoute } from "@/components/layout/GuestRoute";
import { OrganizationGuard } from "@/components/layout/OrganizationGuard";
import AppShell from "@/components/layout/AppShell";

// Guest Authentication Views
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import VerifyEmail from "@/features/auth/pages/VerifyEmail";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";

// Tenant Onboarding Flow Wizard Module
import OnboardingWizard from "@/features/auth/onboarding";

// Core Panel Subview Feature Folders (Resolves directly to index.tsx entries)
import DashboardOverview from "@/features/overview";
import ProjectsPage from "@/features/projects";
import CRMPage from "@/features/CRM"; // Kept uppercase to match image_b9607.png exactly
import LeadsPage from "@/features/leads"; // Added to handle your prospecting views
import KanbanPage from "@/features/kanban";
import ProposalsPage from "@/features/proposals";
import ContractsPage from "@/features/contracts";
import FormsPage from "@/features/forms";
import SettingsPage from "@/features/settings";
import ProfilePage from "@/features/profile";

// External Client Facing Secure Portal Space
import PortalPage from "@/features/portal";

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

        {/* --- Public / Secure Token Client Portal Pipeline --- */}
        {/* This sits completely outside the internal AppShell sidebar navigation framework */}
        <Route path="/portal/:portalId" element={<PortalPage />} />
        <Route path="/portal" element={<PortalPage />} />

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
              <Route path="leads" element={<LeadsPage />} />
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
