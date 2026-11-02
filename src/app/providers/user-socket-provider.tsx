import { useEffect, type ReactNode } from 'react'
import { io } from 'socket.io-client'
import { refreshCurrentUser } from '@/features/authentication'
import { WS_BASE_URL } from '@/shared/constant/api-constant'
import { authStore } from '@/shared/store'

interface UserSocketProviderProps {
  children: ReactNode
}

/** Applies authenticated user-domain events to the local current-user projection. */
export function UserSocketProvider({ children }: UserSocketProviderProps) {
  const accessToken = authStore((state) => state.accessToken)
  const isHydrated = authStore((state) => state.isHydrated)

  useEffect(() => {
    if (!isHydrated || !accessToken) return

    const socket = io(`${WS_BASE_URL}/user`, {
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    socket.on('user:active_organization_changed', () => {
      void refreshCurrentUser()
    })

    return () => {
      socket.disconnect()
    }
  }, [accessToken, isHydrated])

  return <>{children}</>
}
