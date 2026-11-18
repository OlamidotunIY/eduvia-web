import { useLocation, useNavigate } from "react-router-dom";
import { Bell, HelpCircle } from "lucide-react";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { useUnreadNotificationCountQuery } from "@/features/notifications";
import { useMainHeaderSlot } from "./main-header-slot";
import { GlobalBreadcrumbs } from "./global-breadcrumbs";

export function MainHeader() {
  const { setElement } = useMainHeaderSlot();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMembersPage = pathname.startsWith("/organization/members");
  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery();

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur-xs pr-4 md:pr-6 pl-0">
      <div className="flex h-full items-center min-w-0">
        <div className="flex h-full items-center px-3.5 shrink-0">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>
        <Separator orientation="vertical" className="h-full" />
        <div className="flex h-full items-center px-3.5 min-w-0">
          <GlobalBreadcrumbs />
        </div>
      </div>

      <div ref={setElement} className="flex h-full flex-1 min-w-0 items-center justify-end px-3.5" />

      <div className="flex items-center gap-1.5 shrink-0 pl-2">
        <Tooltip>
          <TooltipTrigger
            className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            onClick={() => navigate(APP_ROUTES.NOTIFICATIONS)}
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "Notifications"}
            </p>
          </TooltipContent>
        </Tooltip>

        {isMembersPage && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            title="Help & documentation"
          >
            <HelpCircle className="size-3.5" />
          </Button>
        )}
      </div>
    </header>
  );
}
