import { useEffect, type ReactNode } from 'react'
import {
  activeOrganizationChangedHandler,
} from '@/features/authentication'
import { buildUserSocketAuth, userWsConnection } from '@/shared/api'
import { authStore } from '@/shared/store'

interface UserSocketProviderProps {
  children: ReactNode
}

/** Starts and stops the authenticated shared websocket transport with the session lifecycle. */
export function UserSocketProvider({ children }: UserSocketProviderProps) {
  const accessToken = authStore((state) => state.accessToken)
  const isHydrated = authStore((state) => state.isHydrated)

  useEffect(() => {
    if (!isHydrated || !accessToken) return

    const unregister = activeOrganizationChangedHandler.register()
    userWsConnection.connect({ namespace: '/user', auth: buildUserSocketAuth(accessToken) })

    return () => {
      unregister()
      userWsConnection.disconnect()
    }
  }, [accessToken, isHydrated])

  return <>{children}</>
}
