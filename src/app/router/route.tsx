import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { authRoutes } from './routes/auth.routes'
import { onboardingRoutes } from './routes/onboarding.routes'
import { workspaceRoutes } from './routes/workspace.routes'
import { APP_ROUTES } from '@/shared/constant/routes.constants'

export const router = createBrowserRouter([
  {
    element: <Outlet />,
    children: [
      { path: '/', element: <Navigate to={APP_ROUTES.LOGIN} replace /> },
      ...authRoutes,
      ...onboardingRoutes,
      ...workspaceRoutes,
      { path: '*', element: <Navigate to={APP_ROUTES.DASHBOARD} replace /> },
    ],
  },
])
