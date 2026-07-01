import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSession } from '@/lib/auth-client';
import { Navigate, Outlet } from 'react-router-dom';

export function GuestRoute() {
  const { data: session, isPending: sessionPending } = useSession()
  const { isOnboarded, isPending: authPending } = useAuth()

  if (sessionPending || authPending) return null;

  if (session?.user) {
    return <Navigate to={isOnboarded ? "/dashboard" : "/onboarding"} replace />;
  }

  return <Outlet />;
}