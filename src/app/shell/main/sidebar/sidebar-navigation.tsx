import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LibraryBig,
  MessageSquare,
  ScrollText,
  ShieldCheck,
  UserCheck,
  Users,
  UsersRound,
  WandSparkles,
} from 'lucide-react'
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

type WorkspaceRole = Exclude<EduviaRole, 'pending'>
type NavigationItem = { label: string; to: string; icon: LucideIcon }
type NavigationGroup = { label?: string; items: NavigationItem[] }

const teacherGroups: NavigationGroup[] = [
  { items: [{ label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard }] },
  {
    label: 'Teaching',
    items: [
      { label: 'Classrooms', to: '/classrooms', icon: Users },
      { label: 'Calendar', to: '/calendar', icon: CalendarDays },
      { label: 'Curriculum', to: '/curriculum', icon: BookOpen },
      { label: 'Assessments', to: '/assessments', icon: ClipboardCheck },
      { label: 'Question Bank', to: '/questions', icon: LibraryBig },
      { label: 'Lesson Reports', to: '/lesson-reports', icon: FileText },
    ],
  },
  { label: 'Learners', items: [{ label: 'Student Progress', to: '/student-progress', icon: BarChart3 }] },
  { label: 'Communication', items: [{ label: 'Messages', to: '/messages', icon: MessageSquare }] },
]

const organizationManagementGroup: NavigationGroup = {
  label: 'Organization',
  items: [
    { label: 'Team & Members', to: '/organization/members', icon: UsersRound },
    { label: 'Applications', to: '/organization/applications', icon: UserCheck },
    { label: 'Subjects', to: '/organization/subjects', icon: BookOpen },
    { label: 'Analytics', to: '/organization/analytics', icon: BarChart3 },
  ],
}

const parentGroups: NavigationGroup[] = [
  { items: [{ label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard }] },
  {
    label: 'Children',
    items: [
      { label: 'My Children', to: '/children', icon: GraduationCap },
      { label: 'Progress & Reports', to: '/children/progress', icon: BarChart3 },
    ],
  },
  { label: 'Learning', items: [{ label: 'Calendar', to: '/calendar', icon: CalendarDays }] },
  { label: 'Communication', items: [{ label: 'Messages', to: '/messages', icon: MessageSquare }] },
]

const studentGroups: NavigationGroup[] = [
  { items: [{ label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard }] },
  {
    label: 'Learning',
    items: [
      { label: 'My Learning', to: '/learning', icon: BookOpen },
      { label: 'Calendar', to: '/calendar', icon: CalendarDays },
      { label: 'My Progress', to: '/progress', icon: BarChart3 },
    ],
  },
  { label: 'Communication', items: [{ label: 'Messages', to: '/messages', icon: MessageSquare }] },
]

const adminGroups: NavigationGroup[] = [
  { items: [{ label: 'Dashboard', to: APP_ROUTES.DASHBOARD, icon: LayoutDashboard }] },
  {
    label: 'Administration',
    items: [
      { label: 'Organizations', to: '/admin/organizations', icon: UsersRound },
      { label: 'Approvals', to: '/admin/approvals', icon: ShieldCheck },
      { label: 'Announcements', to: '/admin/announcements', icon: Bell },
      { label: 'Administrators', to: '/admin/administrators', icon: Users },
    ],
  },
  {
    label: 'Platform',
    items: [
      { label: 'AI Configuration', to: '/admin/ai', icon: WandSparkles },
      { label: 'Operations', to: '/admin/operations', icon: ScrollText },
    ],
  },
]

function isOrganizationManager(organizationRole?: string): boolean {
  return organizationRole === 'OrgOwner' || organizationRole === 'OrgAdmin'
}

function groupsForRole(role: WorkspaceRole, organizationRole?: string): NavigationGroup[] {
  if (role === 'teacher') {
    return isOrganizationManager(organizationRole)
      ? [...teacherGroups, organizationManagementGroup]
      : teacherGroups
  }
  if (role === 'parent') return parentGroups
  if (role === 'student') return studentGroups
  return adminGroups
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

export function SidebarNavigation({ role, organizationRole }: { role: WorkspaceRole; organizationRole?: string }) {
  const [mainGroup] = groupsForRole(role, organizationRole)
  return <NavigationGroup group={mainGroup} />
}

export function SidebarProductNavigation({ role, organizationRole }: { role: WorkspaceRole; organizationRole?: string }) {
  return <>{groupsForRole(role, organizationRole).slice(1).map((group) => <NavigationGroup key={group.label} group={group} />)}</>
}

function NavigationGroup({ group }: { group: NavigationGroup }) {
  return (
    <SidebarGroup>
      {group.label ? <SidebarGroupLabel>{group.label}</SidebarGroupLabel> : null}
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => <SidebarNavigationItem key={item.to} item={item} />)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
