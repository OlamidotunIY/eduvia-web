import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CurrentUserBootstrap } from '@/shared/domain'

interface SessionState {
  currentUser: CurrentUserBootstrap | null
  isHydrated: boolean
  markHydrated: () => void
  setCurrentUser: (currentUser: CurrentUserBootstrap | null) => void
  clearCurrentUser: () => void
}

export const sessionStore = create<SessionState>()(
  persist(
    (set) => ({
      currentUser: null,
      isHydrated: false,
      markHydrated: () => set({ isHydrated: true }),
      setCurrentUser: (currentUser) => set({ currentUser }),
      clearCurrentUser: () => set({ currentUser: null }),
    }),
    {
      name: 'eduvia-user-session',
      partialize: (state) => ({ currentUser: state.currentUser }),
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => state?.markHydrated(),
    }
  )
)
