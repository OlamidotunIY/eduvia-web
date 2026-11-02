import { Bell } from 'lucide-react'
import { sessionStore } from '@/shared/store'

export function MainHeader() {
  const currentUser = sessionStore((state) => state.currentUser)
  const organizationName = currentUser?.activeOrganization?.name
  return <header className="flex h-16 shrink-0 items-center justify-between border-b px-5 sm:px-6"><div><p className="text-sm font-medium">{organizationName ?? 'Eduvia'}</p><p className="text-xs text-muted-foreground">{currentUser?.user.userType ?? 'account'} workspace</p></div><button className="grid size-9 place-items-center rounded-md hover:bg-muted" aria-label="Notifications"><Bell className="size-4" /></button></header>
}
