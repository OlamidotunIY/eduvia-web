import { sessionStore } from '@/shared/store'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/shared/ui/sidebar'
import { OrganizationSwitcher } from './organization-switcher'
import { SidebarNavigation, SidebarProductNavigation } from './sidebar-navigation'
import { SidebarUtilityNavigation } from './sidebar-utility-navigation'
import { UserMenu } from './user-menu'

export function MainSidebar() {
  const currentUser = sessionStore((state) => state.currentUser)
  const role = currentUser?.user.userType
  if (!role || role === 'pending') return null

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation role={role} />
        <SidebarProductNavigation role={role} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUtilityNavigation />
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
