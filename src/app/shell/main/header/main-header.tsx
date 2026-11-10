import { useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { useMainHeaderSlot } from "./main-header-slot";
import { useLayout } from "@/app/providers/layout-provider";

export function MainHeader() {
  const { setElement } = useMainHeaderSlot();
  const { isSidebarLocked } = useLayout();
  const { pathname } = useLocation();
  const isMembersPage = pathname.startsWith("/organization/members");

  if (isSidebarLocked) {
    return (
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b border-border/80 bg-background/95 backdrop-blur-xs px-4 md:px-5">
        <div ref={setElement} className="flex h-full w-full min-w-0 items-center" />
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center border-b border-border/80 bg-background/95 backdrop-blur-xs pr-4 md:pr-6 pl-0">
      <div className="flex h-full items-center px-3.5 shrink-0">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      </div>
      <Separator orientation="vertical" className="h-full" />
      <div ref={setElement} className="flex h-full flex-1 min-w-0 items-center px-3.5" />

      {isMembersPage && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            title="Help & documentation"
          >
            <HelpCircle className="size-3.5" />
          </Button>
        </div>
      )}
    </header>
  );
}
