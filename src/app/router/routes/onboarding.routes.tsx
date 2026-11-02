import type { RouteObject } from 'react-router-dom'
import { AuthGuard, OnboardingGuard } from '@/app/guard'
import { OnboardingLayout } from '@/app/shell'
import { OrganizationChoicePage, CreateOrganizationPage, MarketplacePage } from '@/features/organization'
import { RoleSelectionPage } from '@/features/onboarding'
import { APP_ROUTES } from '@/shared/constant/routes.constants'

export const onboardingRoutes: RouteObject[] = [
  {
    element: <AuthGuard><OnboardingGuard><OnboardingLayout /></OnboardingGuard></AuthGuard>,
    children: [
      { path: APP_ROUTES.ONBOARDING, element: <RoleSelectionPage /> },
      { path: APP_ROUTES.ONBOARDING_ORGANIZATION, element: <OrganizationChoicePage /> },
      { path: `${APP_ROUTES.ONBOARDING_ORGANIZATION}/create`, element: <CreateOrganizationPage /> },
      { path: APP_ROUTES.ONBOARDING_MARKETPLACE, element: <MarketplacePage /> },
    ],
  },
]
