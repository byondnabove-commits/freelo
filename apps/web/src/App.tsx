import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { GuestRoute } from "@/components/layout/GuestRoute";
import AppShell from "@/components/layout/AppShell";

import Login from "@/features/auth/pages/Login";
import Signup from "@/features/auth/pages/Signup";
import VerifyEmail from "@/features/auth/pages/VerifyEmail";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";

import OnboardingWizard from "@/features/onboarding";

import DashboardOverview from "@/features/overview";
import ProjectsPage from "@/features/projects";
import CRMPage from "@/features/CRM";
import LeadsPage from "@/features/leads";
import KanbanPage from "@/features/kanban";
import ProposalsPage from "@/features/proposals";
import ContractsPage from "@/features/contracts";
import FormsPage from "@/features/forms";
import SettingsPage from "@/features/settings";
import ProfilePage from "@/features/profile";

import PortalPage from "@/features/portal";
import { AuthOnlyRoute } from "./components/layout/AuthOnlyRoute";

// Public form intake page — NOT under PrivateRoute, no auth required
import PublicFormPage from "@/features/forms/pages/PublicFormPage";

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

        {/* Public intake form — fully public, no auth, no org context */}
        <Route path="/f/:slug" element={<PublicFormPage />} />

        <Route element={<AuthOnlyRoute />}>
          <Route path="/onboarding" element={<OnboardingWizard />} />
        </Route>

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
