import { useSession } from '@/lib/auth-client'
import { useAuthStore } from '@/store/auth.store'
import { Navigate, Outlet } from 'react-router-dom'

export function PrivateRoute() {
  const { data: session, isPending } = useSession()
  const { hasCompletedOnboarding } = useAuthStore()

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary
          border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}