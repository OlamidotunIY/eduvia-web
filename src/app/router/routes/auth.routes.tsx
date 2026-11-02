import type { RouteObject } from 'react-router-dom'
import { GuestGuard } from '@/app/guard'
import { AuthLayout } from '@/app/shell'
import { AuthCallbackPage, LoginPage, SignUpPage, VerifyEmailPage } from '@/features/authentication'
import { APP_ROUTES } from '@/shared/constant/routes.constants'

export const authRoutes: RouteObject[] = [
  {
    element: <GuestGuard><AuthLayout /></GuestGuard>,
    children: [
      { path: APP_ROUTES.LOGIN, element: <LoginPage /> },
      { path: APP_ROUTES.REGISTRATION, element: <SignUpPage /> },
      { path: APP_ROUTES.VERIFY_EMAIL, element: <VerifyEmailPage /> },
      { path: APP_ROUTES.AUTH_CALLBACK, element: <AuthCallbackPage /> },
    ],
  },
]
