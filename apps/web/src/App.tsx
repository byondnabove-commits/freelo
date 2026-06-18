import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PrivateRoute } from "@/components/layout/PrivateRoute";
import { GuestRoute } from "@/components/layout/GuestRoute";
import { OrganizationGuard } from "@/components/layout/OrganizationGuard";

// Views
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Dashboard from "@/pages/dashboard/Dashboard";

// Import the new production-grade 4-step modular layout folder
import OnboardingWizard from "@/pages/auth/onboarding";

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
          {/* Accessible only if authenticated but organization is missing */}
          <Route path="/onboarding" element={<OnboardingWizard />} />

          {/* --- Guard Layer 2: Requires Active Selected Workspace --- */}
          <Route element={<OrganizationGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Global Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
