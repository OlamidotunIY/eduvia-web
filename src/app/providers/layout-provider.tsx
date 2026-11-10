import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  const { pathname } = useLocation();

  // Route condition: /messages starts minimized to give space for chat layout
  const isMessagesPage = pathname.startsWith("/messages");

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

  // Sidebar state on messages page: starts minimized (false)
  const [messagesSidebarOpen, setMessagesSidebarOpen] = useState<boolean>(false);

  // When entering /messages, default to minimized
  useEffect(() => {
    if (isMessagesPage) {
      setMessagesSidebarOpen(false);
    }
  }, [isMessagesPage]);

  // When on messages, use messagesSidebarOpen; otherwise use persisted preference
  const isSidebarOpen = isMessagesPage ? messagesSidebarOpen : persistedSidebarOpen;

  const setSidebarOpen = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      if (isMessagesPage) {
        setMessagesSidebarOpen((prev) =>
          typeof value === "function" ? value(prev) : value,
        );
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
    [isMessagesPage],
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
