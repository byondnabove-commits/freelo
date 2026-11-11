import "./index.css";
import "./i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";

import { Spinner } from "@/components/ui";
import { useMe } from "@/lib/me";
import { AppShell, MembersPage, TodayPage } from "@/pages/app";
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage, VerifyEmailPage } from "@/pages/auth";
import { CreateWorkspacePage, InvitationPage, SelectWorkspacePage } from "@/pages/workspace";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

/** Auth pages: a signed-in user goes to the app. */
function GuestOnly() {
  const me = useMe();
  if (me.isPending) return <Spinner />;
  return me.data ? <Navigate to="/app" replace /> : <Outlet />;
}

function RequireAuth() {
  const me = useMe();
  const location = useLocation();
  if (me.isPending) return <Spinner />;
  if (!me.data) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <Outlet />;
}

/** No workspace → onboarding; several and none active → picker (03-s1 §4). */
function RequireWorkspace() {
  const me = useMe().data!;
  if (me.memberships.length === 0) return <Navigate to="/onboarding" replace />;
  if (!me.activeOrganizationId) return <Navigate to="/workspace/select" replace />;
  return <Outlet />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/invitations/:id" element={<InvitationPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/onboarding" element={<CreateWorkspacePage />} />
            <Route path="/workspace/select" element={<SelectWorkspacePage />} />
            <Route element={<RequireWorkspace />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<TodayPage />} />
                <Route path="settings/members" element={<MembersPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
