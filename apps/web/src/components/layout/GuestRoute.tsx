import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

export function GuestRoute() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}