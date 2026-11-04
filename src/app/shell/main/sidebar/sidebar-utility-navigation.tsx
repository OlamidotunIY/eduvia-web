import { Bell, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/shared/ui/sidebar'

const utilityItems = [
  { label: 'Notifications', to: APP_ROUTES.NOTIFICATIONS, icon: Bell },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function SidebarUtilityNavigation() {
  return (
    <SidebarMenu>
      {utilityItems.map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton render={<NavLink to={item.to} />} tooltip={item.label}>
            <item.icon />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}
