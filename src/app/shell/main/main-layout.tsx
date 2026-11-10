import { Outlet, useLocation } from "react-router-dom";
import { MainHeader, MainHeaderSlotProvider } from "./header";
import { MainSidebar } from "./sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { LayoutProvider, useLayout } from "@/app/providers/layout-provider";

function MainLayoutContent() {
  const { pathname } = useLocation();
  const { isSidebarOpen, setSidebarOpen } = useLayout();
  const isCalendarPage = pathname.endsWith("/calendar");
  const isMessagesPage = pathname.startsWith("/messages");

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={setSidebarOpen}
      className="fixed inset-0 h-svh min-h-0! w-full overflow-hidden"
    >
      <MainHeaderSlotProvider>
        <MainSidebar />
        <SidebarInset className="h-svh min-h-0 w-0 min-w-0 overflow-hidden md:h-[calc(100svh-1rem)]">
          <MainHeader />
          <main
            className={`flex min-h-0 min-w-0 flex-1 flex-col ${
              isMessagesPage
                ? "overflow-hidden p-0 m-0"
                : isCalendarPage
                  ? "overflow-hidden p-4 md:p-6"
                  : "overflow-auto p-4 md:p-6"
            }`}
          >
            <Outlet />
          </main>
        </SidebarInset>
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
