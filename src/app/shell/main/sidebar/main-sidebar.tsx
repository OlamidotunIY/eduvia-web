import { sessionStore } from "@/shared/store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/ui/sidebar";
import { OrganizationSwitcher } from "./organization-switcher";
import {
  SidebarNavigation,
  SidebarProductNavigation,
} from "./sidebar-navigation";
import { UserMenu } from "./user-menu";

export function MainSidebar() {
  const currentUser = sessionStore((state) => state.currentUser);
  const role = currentUser?.user.userType;
  if (!role || role === "pending") return null;

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="overflow-hidden"
    >
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation
          role={role}
          permissions={currentUser.activeOrganization?.permissions}
        />
        <SidebarProductNavigation
          role={role}
          permissions={currentUser.activeOrganization?.permissions}
        />
      </SidebarContent>
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
