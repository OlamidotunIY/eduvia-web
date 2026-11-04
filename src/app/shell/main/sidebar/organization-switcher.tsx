import { useEffect, useState } from 'react'
import { Building2, Check, ChevronRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSwitchOrganizationMutation } from '@/features/organization'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { sessionStore } from '@/shared/store'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/shared/ui/sidebar'

export function OrganizationSwitcher() {
  const navigate = useNavigate()
  const { isMobile } = useSidebar()
  const currentUser = sessionStore((state) => state.currentUser)
  const switchOrganization = useSwitchOrganizationMutation()
  const [requestedOrganizationId, setRequestedOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    if (requestedOrganizationId === currentUser?.activeOrganization?.id) {
      setRequestedOrganizationId(null)
    }
  }, [currentUser?.activeOrganization?.id, requestedOrganizationId])

  const organizations = currentUser?.organizations ?? []
  const activeOrganization = currentUser?.activeOrganization ?? organizations[0]
  if (!activeOrganization) return null

  const isSwitching = switchOrganization.isPending || Boolean(requestedOrganizationId)
  const selectOrganization = (organizationId: string) => {
    if (organizationId === activeOrganization.id) return
    switchOrganization.mutate(organizationId, {
      onSuccess: () => setRequestedOrganizationId(organizationId),
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="hover:!bg-transparent hover:!text-sidebar-foreground active:!bg-transparent active:!text-sidebar-foreground"
                disabled={isSwitching}
              />
            }
          >
            <Avatar className="rounded-md">
              <AvatarFallback className="rounded-md bg-primary text-primary-foreground">
                <Building2 className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeOrganization.name}</span>
              <span className="truncate text-xs">{activeOrganization.role}</span>
            </div>
            <ChevronRight className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side={isMobile ? 'bottom' : 'right'} sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Your organizations</DropdownMenuLabel>
              {organizations.map((organization) => (
                <DropdownMenuItem
                  key={organization.id}
                  disabled={isSwitching}
                  onClick={() => selectOrganization(organization.id)}
                >
                  <Avatar size="sm" className="rounded-md">
                    <AvatarFallback className="rounded-md bg-muted text-muted-foreground">
                      {organization.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{organization.name}</span>
                  {organization.id === activeOrganization.id ? <Check /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(APP_ROUTES.ONBOARDING_ORGANIZATION)}>
              <div className="mr-1 flex size-6 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                <Plus className="size-3.5" />
              </div>
              Add organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
