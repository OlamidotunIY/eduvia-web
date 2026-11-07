import { useLocation } from "react-router-dom";
import { Building2, Check, ChevronDown, HelpCircle, RefreshCw } from "lucide-react";
import { SidebarTrigger } from "@/shared/ui/sidebar";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useMainHeaderSlot } from "./main-header-slot";
import { useLayout } from "@/app/providers/layout-provider";
import { sessionStore } from "@/shared/store";
import { useSwitchOrganizationMutation } from "@/features/organization";

export function MainHeader() {
  const { setElement } = useMainHeaderSlot();
  const { isSidebarLocked } = useLayout();
  const { pathname } = useLocation();
  const currentUser = sessionStore((state) => state.currentUser);
  const switchOrganization = useSwitchOrganizationMutation();

  const organizations = currentUser?.organizations ?? [];
  const activeOrganization = currentUser?.activeOrganization ?? organizations[0];
  const isMembersPage = pathname.startsWith("/organization/members");

  const handleReload = () => {
    window.location.reload();
  };

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
          {activeOrganization && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 rounded-lg border-border/70 bg-card/60 px-3 text-xs font-medium text-foreground hover:bg-card hover:text-foreground"
                  >
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span className="truncate max-w-[140px]">{activeOrganization.name}</span>
                    <ChevronDown className="size-3 opacity-60 ml-0.5" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => switchOrganization.mutate(org.id)}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{org.name}</span>
                    </div>
                    {org.id === activeOrganization.id && (
                      <Check className="size-3.5 text-emerald-400 shrink-0 ml-2" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="icon-xs"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={handleReload}
            title="Refresh application"
          >
            <RefreshCw className="size-3.5" />
          </Button>

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
