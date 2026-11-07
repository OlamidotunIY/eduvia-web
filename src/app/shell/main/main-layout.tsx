import { Outlet, useLocation } from "react-router-dom";
import { MainHeader, MainHeaderSlotProvider } from "./header";
import { MainSidebar } from "./sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";

export function MainLayout() {
  const { pathname } = useLocation();
  const isCalendarPage = pathname.endsWith("/calendar");

  return (
    <SidebarProvider className="fixed inset-0 h-svh min-h-0! w-full overflow-hidden">
      <MainHeaderSlotProvider>
        <MainSidebar />
        <SidebarInset className="h-svh min-h-0 w-0 min-w-0 overflow-hidden md:h-[calc(100svh-1rem)]">
          <MainHeader />
          <main
            className={`flex min-h-0 min-w-0 flex-1 flex-col p-4 md:p-6 ${
              isCalendarPage ? "overflow-hidden" : "overflow-auto"
            }`}
          >
            <Outlet />
          </main>
        </SidebarInset>
      </MainHeaderSlotProvider>
    </SidebarProvider>
  );
}
