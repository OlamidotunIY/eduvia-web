import type { RouteObject } from 'react-router-dom'
import { AuthGuard, RoleGuard } from '@/app/guard'
import { RoleLayout } from '@/app/shell'
import { DashboardPage, PlaceholderPage } from '@/features/dashboard'
import { APP_ROUTES } from '@/shared/constant/routes.constants'

export const workspaceRoutes: RouteObject[] = [
  {
    element: <AuthGuard><RoleGuard><RoleLayout /></RoleGuard></AuthGuard>,
    children: [
      { path: APP_ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: '*', element: <PlaceholderPage /> },
    ],
  },
]
