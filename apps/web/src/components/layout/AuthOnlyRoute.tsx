// components/layout/AuthOnlyRoute.tsx
import { useSession } from '@/lib/auth-client'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Navigate, Outlet } from 'react-router-dom'

export function AuthOnlyRoute() {
  const { data: session, isPending: sessionPending } = useSession()
  const { isOnboarded, isLoading: authLoading } = useAuth()

  if (sessionPending || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />
  }

  if (isOnboarded) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}