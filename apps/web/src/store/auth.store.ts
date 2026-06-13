import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  hasCompletedOnboarding: boolean
  setHasCompletedOnboarding: (val: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      hasCompletedOnboarding:    false,
      setHasCompletedOnboarding: (val) =>
        set({ hasCompletedOnboarding: val }),
      clear: () => set({ hasCompletedOnboarding: false }),
    }),
    { name: 'freelo-auth' }
  )
)