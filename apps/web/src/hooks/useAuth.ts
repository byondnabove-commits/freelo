import { useSession, signOut } from '@/lib/auth-client'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { data: session, isPending } = useSession()
  const { hasCompletedOnboarding, clear } = useAuthStore()
  const navigate = useNavigate()

  const logout = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          clear()
          navigate('/login')
        },
      },
    })
  }

  return {
    user:                   session?.user ?? null,
    session:                session?.session ?? null,
    isPending,
    isAuthenticated:        !!session?.user,
    hasCompletedOnboarding,
    logout,
  }
}