import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { GuestRoute } from "@/components/layout/GuestRoute";
// import { OrganizationGuard } from "@/components/layout/OrganizationGuard";
import AppShell from "@/components/layout/AppShell";

// Guest Authentication Views
import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import VerifyEmail from "@/features/auth/pages/VerifyEmail";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";

// Tenant Onboarding Flow Wizard Module
import OnboardingWizard from "@/features/onboarding";

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
import { AuthOnlyRoute } from "./components/layout/AuthOnlyRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/portal/:portalId" element={<PortalPage />} />
        <Route path="/portal" element={<PortalPage />} />

        {/* Auth-only gate — onboarding lives here, requires login but NOT isOnboarded */}
        <Route element={<AuthOnlyRoute />}>
          <Route path="/onboarding" element={<OnboardingWizard />} />
        </Route>

        {/* Auth + onboarded gate — everything else */}
        <Route element={<PrivateRoute />}>
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
