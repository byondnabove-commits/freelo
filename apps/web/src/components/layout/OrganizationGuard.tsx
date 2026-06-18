import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export function OrganizationGuard() {
  const { data: activeOrg, isPending } = authClient.useActiveOrganization();

  // Prevent UI flashing or false-positive redirects while fetching the active session
  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F0ECE6]">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  // Strictly redirect to onboarding if no organization context exists
  if (!activeOrg) {
    return <Navigate to="/onboarding" replace />;
  }

  // Type-safe clearance granted; render the nested child routes (like /dashboard)
  return <Outlet />;
}