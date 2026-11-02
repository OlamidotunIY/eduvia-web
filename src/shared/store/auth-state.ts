import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  sessionId: string | null
  isHydrated: boolean
  markHydrated: () => void
  setSession: (input: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    sessionId: string
  }) => void
  clear: () => void
  isAuthenticated: () => boolean
  isExpired: () => boolean
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        sessionId: null,
        isHydrated: false,

        markHydrated: () => set({ isHydrated: true }),

        setSession: ({ accessToken, refreshToken, expiresAt, sessionId }) => {
            set({ accessToken, refreshToken, expiresAt, sessionId });
        },

        clear: () => {
            set({ accessToken: null, refreshToken: null, expiresAt: null, sessionId: null });
        },

        isAuthenticated: () => {
            const { accessToken, expiresAt } = get();
            return !!accessToken && !!expiresAt && expiresAt > Date.now();
        },

        isExpired: () => {
            const { expiresAt } = get();
            return !expiresAt || expiresAt <= Date.now();
        }
    }),
    {
        name: 'eduvia-auth-session',
        partialize: (state) => ({
            accessToken: state.accessToken,
            refreshToken: state.refreshToken,
            expiresAt: state.expiresAt,
            sessionId: state.sessionId,
        }),
        storage: createJSONStorage(() => localStorage),
        version: 1,
        onRehydrateStorage: () => (state) => state?.markHydrated(),
    }
  )
)
