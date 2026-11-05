import { useEffect, type ReactNode } from "react";
import { refreshAuthSession } from "@/shared/api";
import { authStore } from "@/shared/store";

interface AuthSessionProviderProps {
  children: ReactNode;
}

/** Restores an expired access token before any route decides where to navigate. */
export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  const isHydrated = authStore((state) => state.isHydrated);
  const isAuthenticated = authStore((state) => state.isAuthenticated());
  const hasRefreshSession = authStore((state) =>
    Boolean(state.sessionId && state.refreshToken),
  );

  useEffect(() => {
    if (!isHydrated || isAuthenticated || !hasRefreshSession) return;
    void refreshAuthSession();
  }, [hasRefreshSession, isAuthenticated, isHydrated]);

  return <>{children}</>;
}
