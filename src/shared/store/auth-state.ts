import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  refreshExpiresAt: number | null
  sessionId: string | null
  isHydrated: boolean
  markHydrated: () => void
  setSession: (input: {
    accessToken: string
    refreshToken: string
    expiresAt: number
    refreshExpiresAt?: number
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
        refreshExpiresAt: null,
        sessionId: null,
        isHydrated: false,

        markHydrated: () => set({ isHydrated: true }),

        setSession: ({ accessToken, refreshToken, expiresAt, refreshExpiresAt, sessionId }) => {
            set({ accessToken, refreshToken, expiresAt, refreshExpiresAt: refreshExpiresAt ?? null, sessionId });
        },

        clear: () => {
            set({ accessToken: null, refreshToken: null, expiresAt: null, refreshExpiresAt: null, sessionId: null });
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
            refreshExpiresAt: state.refreshExpiresAt,
            sessionId: state.sessionId,
        }),
        storage: createJSONStorage(() => localStorage),
        version: 1,
        onRehydrateStorage: () => (state) => state?.markHydrated(),
    }
  )
)
