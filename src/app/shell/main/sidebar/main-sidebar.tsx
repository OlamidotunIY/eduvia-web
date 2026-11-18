import { sessionStore } from "@/shared/store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/shared/ui/sidebar";
import { OrganizationSwitcher } from "./organization-switcher";
import { PlatformLogoHeader } from "./platform-logo-header";
import {
  SidebarNavigation,
  SidebarProductNavigation,
} from "./sidebar-navigation";
import { UserMenu } from "./user-menu";

export function MainSidebar() {
  const currentUser = sessionStore((state) => state.currentUser);
  const role = currentUser?.user.userType;
  if (!role || role === "pending") return null;

  const showOrganizationSwitcher =
    Boolean(currentUser.activeOrganization) &&
    (role === "teacher" || role === "admin");

  const portalSubtitle =
    role === "parent"
      ? "Parent Workspace"
      : role === "student"
        ? "Student Workspace"
        : "Eduvia Platform";

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="overflow-hidden"
    >
      <SidebarHeader>
        {showOrganizationSwitcher ? (
          <OrganizationSwitcher />
        ) : (
          <PlatformLogoHeader subtitle={portalSubtitle} />
        )}
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
