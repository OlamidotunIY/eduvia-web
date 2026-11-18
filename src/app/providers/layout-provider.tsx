import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

const SIDEBAR_STORAGE_KEY = "eduvia-sidebar-state";

interface LayoutContextValue {
  /** The effective sidebar open state */
  isSidebarOpen: boolean;
  /** The user's persisted preferred sidebar open state on standard pages */
  persistedSidebarOpen: boolean;
  /** True when the current route forces the sidebar to be collapsed and locks it */
  isSidebarLocked: boolean;
  /** Set sidebar open state */
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  /** Toggle sidebar open state */
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { pathname, key: locationKey } = useLocation();

  // Route condition: split-pane workspaces (/messages and Command Center) start with main sidebar minimized
  const splitRouteKey = pathname.startsWith("/messages")
    ? `messages:${locationKey}`
    : pathname === "/dashboard" || pathname === "/"
      ? `command-center:${locationKey}`
      : null;
  const isSplitWorkspaceRoute = splitRouteKey !== null;

  // Read initial preference from localStorage for standard pages
  const [persistedSidebarOpen, setPersistedSidebarOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved !== null) {
        return saved === "true" || saved === "expanded";
      }
    } catch {
      // ignore localStorage errors (e.g. incognito/disabled)
    }
    return true; // default expanded
  });

  // Per-visit sidebar override on split-pane workspaces; defaults to minimized (false)
  const [splitSidebarOverride, setSplitSidebarOverride] = useState<{
    routeKey: string;
    open: boolean;
  } | null>(null);

  const splitSidebarOpen =
    splitRouteKey && splitSidebarOverride?.routeKey === splitRouteKey
      ? splitSidebarOverride.open
      : false;

  // When on a split-pane route, use transient splitSidebarOpen; otherwise use persisted preference
  const isSidebarOpen = isSplitWorkspaceRoute
    ? splitSidebarOpen
    : persistedSidebarOpen;

  const setSidebarOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (splitRouteKey) {
        setSplitSidebarOverride((prev) => {
          const currentOpen =
            prev?.routeKey === splitRouteKey ? prev.open : false;
          const next = typeof value === "function" ? value(currentOpen) : value;
          return { routeKey: splitRouteKey, open: next };
        });
      } else {
        setPersistedSidebarOpen((prev) => {
          const next = typeof value === "function" ? value(prev) : value;
          try {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    },
    [splitRouteKey],
  );

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, [setSidebarOpen]);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      persistedSidebarOpen,
      isSidebarLocked: false,
      setSidebarOpen,
      toggleSidebar,
    }),
    [isSidebarOpen, persistedSidebarOpen, setSidebarOpen, toggleSidebar],
  );

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider.");
  }
  return context;
}
