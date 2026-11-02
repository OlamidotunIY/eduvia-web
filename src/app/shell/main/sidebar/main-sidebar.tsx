import { Logo } from '@/shared/ui/logo'
import { sessionStore } from '@/shared/store'
import { OrganizationSwitcher } from './organization-switcher'
import { SidebarNavigation } from './sidebar-navigation'
import { UserMenu } from './user-menu'

export function MainSidebar() {
  const currentUser = sessionStore((state) => state.currentUser)
  const role = currentUser?.user.userType
  if (!role || role === 'pending') return null
  return <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar p-4"><Logo size="lg" className="mb-8 px-2" /><OrganizationSwitcher /><SidebarNavigation role={role} /><UserMenu /></aside>
}
