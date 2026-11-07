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
  /** The effective sidebar open state (always false on locked pages like /messages) */
  isSidebarOpen: boolean;
  /** The user's persisted preferred sidebar open state */
  persistedSidebarOpen: boolean;
  /** True when the current route forces the sidebar to be collapsed and locks it */
  isSidebarLocked: boolean;
  /** Set sidebar open state. No-op if currently on a locked page */
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  /** Toggle sidebar open state. No-op if currently on a locked page */
  toggleSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  // Route condition: /messages is strictly locked to minimized/icon sidebar
  const isMessagesPage = pathname.startsWith("/messages");
  const isSidebarLocked = isMessagesPage;

  // Read initial preference from localStorage
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

  // When locked on messages, sidebar is always collapsed (icon mode)
  const isSidebarOpen = isSidebarLocked ? false : persistedSidebarOpen;

  const setSidebarOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (isSidebarLocked) return; // Prevent any expansion when locked
      setPersistedSidebarOpen((prev) => {
        const next = typeof value === "function" ? value(prev) : value;
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [isSidebarLocked],
  );

  const toggleSidebar = useCallback(() => {
    if (isSidebarLocked) return;
    setSidebarOpen((prev) => !prev);
  }, [isSidebarLocked, setSidebarOpen]);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      persistedSidebarOpen,
      isSidebarLocked,
      setSidebarOpen,
      toggleSidebar,
    }),
    [isSidebarOpen, persistedSidebarOpen, isSidebarLocked, setSidebarOpen, toggleSidebar],
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
