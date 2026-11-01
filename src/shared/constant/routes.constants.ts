export const APP_ROUTES = {
  LOGIN: "/login",
  REGISTRATION: "/register",
  AUTH_CALLBACK: "/auth/callback",
  CALLBACK: "/callback",
  TWO_FACTOR_AUTH: "/auth/2fa",
  VERIFY_EMAIL: "/auth/verify-email",
  SETUP_PASSWORD: "/auth/setup-password",
  ONBOARDING: "/onboarding/organization",

  DASHBOARD: "/dashboard",
  NOTIFICATIONS: "/notifications",
} as const

export const ADMIN_ROUTES = {
  LOGIN: "/admin/login",
  DASHBOARD: "/admin/dashboard",
  SETTINGS: "/admin/settings",
} as const
