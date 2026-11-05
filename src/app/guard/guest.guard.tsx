import { Navigate } from "react-router-dom";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { SplashScreen } from "@/shared/composites";
import { authStore } from "@/shared/store";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isHydrated = authStore((state) => state.isHydrated);
  const isAuthenticated = authStore((state) => state.isAuthenticated());
  const hasRefreshSession = authStore((state) =>
    Boolean(state.sessionId && state.refreshToken),
  );
  if (!isHydrated || (!isAuthenticated && hasRefreshSession))
    return <SplashScreen />;
  if (isAuthenticated) return <Navigate to={APP_ROUTES.DASHBOARD} replace />;
  return <>{children}</>;
}
