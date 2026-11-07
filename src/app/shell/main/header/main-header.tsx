import { SidebarTrigger } from "@/shared/ui/sidebar";
import { useMainHeaderSlot } from "./main-header-slot";

export function MainHeader() {
  const { setElement } = useMainHeaderSlot();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div ref={setElement} className="flex min-w-0 flex-1 items-center" />
    </header>
  );
}
