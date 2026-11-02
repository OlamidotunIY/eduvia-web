import { LogOut, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authRepository } from '@/features/authentication'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { useTheme } from '@/app/providers/theme-provider'
import { authStore, sessionStore } from '@/shared/store'

export function UserMenu() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const currentUser = sessionStore((state) => state.currentUser)
  const signOut = async () => {
    try { await authRepository.logout() } finally { authStore.getState().clear(); sessionStore.getState().clearCurrentUser(); navigate(APP_ROUTES.LOGIN, { replace: true }) }
  }
  return <div className="mt-auto border-t pt-4"><div className="mb-3 px-2"><p className="truncate text-sm font-medium">{currentUser?.user.firstName} {currentUser?.user.lastName}</p><p className="truncate text-xs text-muted-foreground">{currentUser?.user.email}</p></div><button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}Toggle theme</button><button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={signOut}><LogOut className="size-4" />Sign out</button></div>
}
