import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMeQuery } from "@/features/authentication";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { SplashScreen } from "@/shared/composites";
import { authStore, sessionStore } from "@/shared/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthHydrated = authStore((state) => state.isHydrated);
  const isSessionHydrated = sessionStore((state) => state.isHydrated);
  const isHydrated = isAuthHydrated && isSessionHydrated;

  const isAuthenticated = authStore((state) => state.isAuthenticated());
  const hasRefreshSession = authStore((state) =>
    Boolean(state.sessionId && state.refreshToken),
  );
  const currentUser = sessionStore((state) => state.currentUser);
  const isRestoringSession =
    isHydrated && !isAuthenticated && hasRefreshSession;

  // Only fetch /me when we are authenticated and DO NOT already have a currentUser loaded
  const shouldFetchMe = Boolean(
    isHydrated && isAuthenticated && !isRestoringSession && !currentUser,
  );
  const me = useMeQuery(shouldFetchMe);

  useEffect(() => {
    if (me.data) {
      sessionStore.getState().setCurrentUser(me.data);
    }
  }, [me.data]);

  // 1. While waiting for localStorage to hydrate
  if (!isHydrated) return <SplashScreen />;

  // 2. If definitely unauthenticated with no refresh session to restore
  if (!isAuthenticated && !hasRefreshSession) {
    return (
      <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
    );
  }

  // 3. If restoring session on cold start and we don't have currentUser yet
  if (isRestoringSession && !currentUser) return <SplashScreen />;

  // 4. If we already have currentUser in store, render children immediately!
  // No splash screen, no blocking during ongoing session, no redundant fetches.
  if (currentUser) {
    return <>{children}</>;
  }

  // 5. If we don't have currentUser yet, but me query is pending
  if (me.isPending && shouldFetchMe) {
    return <SplashScreen />;
  }

  // 6. If we don't have currentUser and me query failed
  if (me.isError) {
    authStore.getState().clear();
    sessionStore.getState().clearCurrentUser();
    return (
      <Navigate to={APP_ROUTES.LOGIN} replace state={{ from: location }} />
    );
  }

  return <SplashScreen />;
}
