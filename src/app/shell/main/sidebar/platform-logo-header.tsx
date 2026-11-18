import { Link } from "react-router-dom";
import eduviaLogo from "@/assets/eduvia-logo.png";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

interface PlatformLogoHeaderProps {
  subtitle?: string;
}

export function PlatformLogoHeader({
  subtitle = "Parent Workspace",
}: PlatformLogoHeaderProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          render={<Link to={APP_ROUTES.DASHBOARD} />}
          tooltip="Eduvia"
          className="hover:bg-sidebar-accent/50 active:bg-sidebar-accent transition-colors cursor-pointer"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-primary/10">
            <img
              src={eduviaLogo}
              alt="Eduvia"
              className="size-6 object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-heading font-bold text-foreground tracking-tight">
              Eduvia
            </span>
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
