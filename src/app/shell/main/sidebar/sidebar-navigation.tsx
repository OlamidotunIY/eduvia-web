import { BookOpen, CalendarDays, ClipboardList, GraduationCap, LayoutDashboard, Settings, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import type { EduviaRole } from '@/shared/domain'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/ui/sidebar'

type NavigationItem = { label: string; to: string; icon: LucideIcon }

const navigationByRole: Record<Exclude<EduviaRole, 'pending'>, NavigationItem[]> = {
  teacher: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  ],
  parent: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  ],
  student: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  ],
  admin: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
  ],
}

const workspaceNavigationByRole: Record<Exclude<EduviaRole, 'pending'>, NavigationItem[]> = {
  teacher: [
    { label: 'Classrooms', to: '/classrooms', icon: Users },
    { label: 'Curriculum', to: '/curriculum', icon: BookOpen },
    { label: 'Schedule', to: '/schedule', icon: CalendarDays },
  ],
  parent: [
    { label: 'My children', to: '/children', icon: GraduationCap },
    { label: 'Schedule', to: '/schedule', icon: CalendarDays },
  ],
  student: [
    { label: 'My learning', to: '/learning', icon: BookOpen },
    { label: 'Assignments', to: '/assignments', icon: ClipboardList },
  ],
  admin: [
    { label: 'Organizations', to: '/organizations', icon: Users },
    { label: 'Settings', to: '/settings', icon: Settings },
  ],
}

function SidebarNavigationItem({ item }: { item: NavigationItem }) {
  const { pathname } = useLocation()
  const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<NavLink to={item.to} />} isActive={isActive} tooltip={item.label}>
        <item.icon />
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function SidebarNavigation({ role }: { role: Exclude<EduviaRole, 'pending'> }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationByRole[role].map((item) => <SidebarNavigationItem key={item.to} item={item} />)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function SidebarProductNavigation({ role }: { role: Exclude<EduviaRole, 'pending'> }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {workspaceNavigationByRole[role].map((item) => <SidebarNavigationItem key={item.to} item={item} />)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
