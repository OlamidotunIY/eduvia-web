import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useMeQuery } from '@/features/authentication'
import { refreshAuthSession } from '@/shared/api'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { SplashScreen } from '@/shared/composites'
import { authStore, sessionStore } from '@/shared/store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHydrated = authStore((state) => state.isHydrated)
  const isAuthenticated = authStore((state) => state.isAuthenticated())
  const hasRefreshSession = authStore((state) => Boolean(state.sessionId && state.refreshToken))
  const currentUser = sessionStore((state) => state.currentUser)
  const [isRestoringSession, setIsRestoringSession] = useState(true)
  const me = useMeQuery(isHydrated && isAuthenticated && !isRestoringSession)

  useEffect(() => {
    if (!isHydrated) return
    if (isAuthenticated || !hasRefreshSession) {
      setIsRestoringSession(false)
      return
    }

    let active = true
    void refreshAuthSession().finally(() => {
      if (active) setIsRestoringSession(false)
    })
    return () => {
      active = false
    }
  }, [hasRefreshSession, isAuthenticated, isHydrated])

  useEffect(() => {
    if (me.data) sessionStore.getState().setCurrentUser(me.data)
  }, [me.data])

  if (!isHydrated || isRestoringSession) return <SplashScreen />
  if (!isAuthenticated) return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
  if (me.isPending || (me.data && currentUser?.user.id !== me.data.user.id)) return <SplashScreen />
  if (me.isError || !me.data) {
    authStore.getState().clear()
    sessionStore.getState().clearCurrentUser()
    return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
  }
  return <>{children}</>
}
