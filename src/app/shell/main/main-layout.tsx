import { Outlet } from "react-router-dom";
import { MainHeader, MainHeaderSlotProvider } from "./header";
import { MainSidebar } from "./sidebar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";

export function MainLayout() {
  return (
    <SidebarProvider>
      <MainHeaderSlotProvider>
        <MainSidebar />
        <SidebarInset>
          <MainHeader />
          <main className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </MainHeaderSlotProvider>
    </SidebarProvider>
  );
}
