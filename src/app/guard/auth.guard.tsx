import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useMeQuery } from '@/features/authentication'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { SplashScreen } from '@/shared/composites'
import { authStore, sessionStore } from '@/shared/store'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isHydrated = authStore((state) => state.isHydrated)
  const isAuthenticated = authStore((state) => state.isAuthenticated())
  const currentUser = sessionStore((state) => state.currentUser)
  const me = useMeQuery(isHydrated && isAuthenticated)

  useEffect(() => {
    if (me.data) sessionStore.getState().setCurrentUser(me.data)
  }, [me.data])

  if (!isHydrated) return <SplashScreen />
  if (!isAuthenticated) return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
  if (me.isPending || (me.data && currentUser?.user.id !== me.data.user.id)) return <SplashScreen />
  if (me.isError || !me.data) {
    authStore.getState().clear()
    sessionStore.getState().clearCurrentUser()
    return <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
  }
  return <>{children}</>
}
