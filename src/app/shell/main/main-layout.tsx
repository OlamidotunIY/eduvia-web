import { Outlet } from "react-router-dom";
import { MainHeader, MainHeaderSlotProvider } from "./header";
import { MainSidebar } from "./sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";

export function MainLayout() {
  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <MainHeaderSlotProvider>
        <MainSidebar />
        <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden">
          <MainHeader />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </MainHeaderSlotProvider>
    </SidebarProvider>
  );
}
