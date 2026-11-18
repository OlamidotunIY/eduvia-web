import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { MainHeader, MainHeaderSlotProvider } from "./header";
import { MainSidebar } from "./sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { LayoutProvider, useLayout } from "@/app/providers/layout-provider";
import { boardUiStore } from "@/shared/store";
import { SettingsDialog, useSettingsDialog } from "@/features/settings";

function MainLayoutContent() {
  const { pathname } = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useLayout();
  const isBoardFullscreen = boardUiStore((state) => state.isBoardFullscreen);
  const isCalendarPage = pathname.endsWith("/calendar");
  const isMessagesPage = pathname.startsWith("/messages");
  const isBoardPage = /^\/lessons\/[^/]+\/board$/.test(pathname);
  const isCommandCenterPage =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard");
  const hideChrome = isBoardFullscreen && isBoardPage;

  // Global hotkey: Cmd+, or Ctrl+, to toggle Settings dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        useSettingsDialog.getState().openSettings();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
      className="fixed inset-0 h-svh min-h-0! w-full overflow-hidden"
    >
      <MainHeaderSlotProvider>
        {!hideChrome ? <MainSidebar /> : null}
        <SidebarInset
          className={
            hideChrome
              ? "h-svh min-h-0 w-0 min-w-0 overflow-hidden m-0 rounded-none border-0"
              : "h-svh min-h-0 w-0 min-w-0 overflow-hidden md:h-[calc(100svh-1rem)]"
          }
        >
          {!hideChrome ? <MainHeader /> : null}
          <main
            className={`flex min-h-0 min-w-0 flex-1 flex-col ${
              isMessagesPage || isBoardPage || isCommandCenterPage
                ? "overflow-hidden p-0 m-0"
                : isCalendarPage
                  ? "overflow-hidden p-4 md:p-6"
                  : "overflow-auto p-4 md:p-6"
            }`}
          >
            <Outlet />
          </main>
        </SidebarInset>
        {/* Global Settings Dialog Modal */}
        <SettingsDialog />
      </MainHeaderSlotProvider>
    </SidebarProvider>
  );
}

export function MainLayout() {
  return (
    <LayoutProvider>
      <MainLayoutContent />
    </LayoutProvider>
  );
}
