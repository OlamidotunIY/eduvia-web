import { Navigate } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { isOnboardingComplete } from '@/shared/domain'
import { SplashScreen } from '@/shared/composites'
import { sessionStore } from '@/shared/store'

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const currentUser = sessionStore((state) => state.currentUser)
  if (!currentUser) return <SplashScreen />
  if (!isOnboardingComplete(currentUser)) return <Navigate to={APP_ROUTES.ONBOARDING} replace />
  if (currentUser.user.userType === 'teacher' && !currentUser.activeOrganization) {
    return <Navigate to={APP_ROUTES.ONBOARDING_ORGANIZATION} replace />
  }
  return <>{children}</>
}
