import { create } from 'zustand'
import type { CurrentUserBootstrap } from '@/shared/domain'

interface SessionState {
  currentUser: CurrentUserBootstrap | null
  setCurrentUser: (currentUser: CurrentUserBootstrap) => void
  clearCurrentUser: () => void
}

export const sessionStore = create<SessionState>()((set) => ({
  currentUser: null,
  setCurrentUser: (currentUser) => set({ currentUser }),
  clearCurrentUser: () => set({ currentUser: null }),
}))
