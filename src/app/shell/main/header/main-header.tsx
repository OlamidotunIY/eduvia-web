import { Bell } from 'lucide-react'
import { sessionStore } from '@/shared/store'
import { Separator } from '@/shared/ui/separator'
import { SidebarTrigger } from '@/shared/ui/sidebar'

export function MainHeader() {
  const currentUser = sessionStore((state) => state.currentUser)
  const organizationName = currentUser?.activeOrganization?.name
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
      <div className="flex min-w-0 items-center">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-3 h-4" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{organizationName ?? 'Eduvia'}</p>
          <p className="truncate text-xs capitalize text-muted-foreground">
            {currentUser?.user.userType ?? 'account'} workspace
          </p>
        </div>
      </div>
      <button className="grid size-9 place-items-center rounded-md hover:bg-muted" aria-label="Notifications">
        <Bell className="size-4" />
      </button>
    </header>
  )
}
