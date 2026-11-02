import { BookOpen, CalendarDays, ClipboardList, GraduationCap, LayoutDashboard, Settings, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { EduviaRole } from '@/shared/domain'
import { APP_ROUTES } from '@/shared/constant/routes.constants'

const navigationByRole: Record<Exclude<EduviaRole, 'pending'>, Array<{ label: string; to: string; icon: typeof LayoutDashboard }>> = {
  teacher: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Classrooms', to: '/classrooms', icon: Users },
    { label: 'Curriculum', to: '/curriculum', icon: BookOpen },
    { label: 'Schedule', to: '/schedule', icon: CalendarDays },
  ],
  parent: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'My children', to: '/children', icon: GraduationCap },
    { label: 'Schedule', to: '/schedule', icon: CalendarDays },
  ],
  student: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'My learning', to: '/learning', icon: BookOpen },
    { label: 'Assignments', to: '/assignments', icon: ClipboardList },
  ],
  admin: [
    { label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: 'Organizations', to: '/organizations', icon: Users },
    { label: 'Settings', to: '/settings', icon: Settings },
  ],
}

export function SidebarNavigation({ role }: { role: Exclude<EduviaRole, 'pending'> }) {
  return <nav className="space-y-1">{navigationByRole[role].map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}><Icon className="size-4" />{label}</NavLink>)}</nav>
}
