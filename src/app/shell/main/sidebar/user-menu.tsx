import { LogOut, Monitor, Moon, Palette, Settings, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authRepository } from '@/features/authentication'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { useTheme } from '@/app/providers/theme-provider'
import { authStore, sessionStore } from '@/shared/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar'

export function UserMenu() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { isMobile } = useSidebar()
  const currentUser = sessionStore((state) => state.currentUser)
  const name = [currentUser?.user.firstName, currentUser?.user.lastName].filter(Boolean).join(' ') || 'Eduvia user'
  const initials = [currentUser?.user.firstName, currentUser?.user.lastName]
    .filter(Boolean)
    .map((value) => value?.charAt(0).toUpperCase())
    .join('') || 'ED'
  const signOut = async () => {
    try { await authRepository.logout() } finally { authStore.getState().clear(); sessionStore.getState().clearCurrentUser(); navigate(APP_ROUTES.LOGIN, { replace: true }) }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="sm" className="group-data-[collapsible=icon]:p-1! hover:!bg-transparent hover:!text-sidebar-foreground active:!bg-transparent active:!text-sidebar-foreground" />}>
            <Avatar className="size-6 rounded-sm">
              <AvatarImage src={currentUser?.user.image ?? undefined} alt={name} />
              <AvatarFallback className="rounded-sm bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 items-center text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Avatar className="rounded-lg">
                    <AvatarImage src={currentUser?.user.image ?? undefined} alt={name} />
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">{currentUser?.user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger><Palette />Theme</DropdownMenuSubTrigger>
                <DropdownMenuSubContent side="right">
                  <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                    <DropdownMenuRadioItem value="system"><Monitor />System</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="light"><Sun />Light</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark"><Moon />Dark</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => navigate('/settings')}><Settings />Settings</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={signOut}><LogOut />Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
