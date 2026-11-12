import "./index.css";
import "./i18n";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useSearchParams } from "react-router";

import { Spinner } from "@/components/ui";
import { useMe } from "@/lib/me";
import { AppShell, MembersPage, TodayPage } from "@/pages/app";
import { ForgotPasswordPage, LoginPage, ResetPasswordPage, SignupPage, VerifyEmailPage } from "@/pages/auth";
import { OnboardingPage } from "@/pages/onboarding";
import { InvitationPage, SelectWorkspacePage } from "@/pages/workspace";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

/** Auth pages: a signed-in user goes to `next` (same-site paths only) or the app. */
function GuestOnly() {
  const me = useMe();
  const [params] = useSearchParams();
  if (me.isPending) return <Spinner />;
  const next = params.get("next");
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/app";
  return me.data ? <Navigate to={target} replace /> : <Outlet />;
}

function RequireAuth() {
  const me = useMe();
  const location = useLocation();
  if (me.isPending) return <Spinner />;
  if (!me.data) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <Outlet />;
}

/** No workspace or unfinished onboarding (owners) → onboarding; several and none active → picker. */
function RequireWorkspace() {
  const me = useMe().data!;
  if (me.memberships.length === 0) return <Navigate to="/onboarding" replace />;
  if (!me.activeOrganizationId) return <Navigate to="/workspace/select" replace />;
  if (me.onboarding && !me.onboarding.completed) return <Navigate to="/onboarding" replace />;
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
            <Route path="/onboarding" element={<OnboardingPage />} />
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
