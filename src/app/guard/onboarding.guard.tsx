import { Navigate, useLocation } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { isOnboardingComplete } from '@/shared/domain'
import { SplashScreen } from '@/shared/composites'
import { sessionStore } from '@/shared/store'

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const currentUser = sessionStore((state) => state.currentUser)
  if (!currentUser) return <SplashScreen />

  const isOrganizationRoute =
    location.pathname.startsWith(APP_ROUTES.ONBOARDING_ORGANIZATION) ||
    location.pathname === APP_ROUTES.ONBOARDING_MARKETPLACE
  if (!isOnboardingComplete(currentUser)) {
    return location.pathname === APP_ROUTES.ONBOARDING
      ? <>{children}</>
      : <Navigate to={APP_ROUTES.ONBOARDING} replace />
  }

  if (currentUser.user.userType === 'teacher' && !currentUser.activeOrganization) {
    return isOrganizationRoute
      ? <>{children}</>
      : <Navigate to={APP_ROUTES.ONBOARDING_ORGANIZATION} replace />
  }

  return <Navigate to={APP_ROUTES.DASHBOARD} replace />
}
