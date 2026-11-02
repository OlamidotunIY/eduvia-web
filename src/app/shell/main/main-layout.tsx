import { Outlet } from 'react-router-dom'
import { MainHeader } from './header'
import { MainSidebar } from './sidebar'

export function MainLayout() {
  return <div className="flex min-h-svh bg-background"><MainSidebar /><div className="flex min-w-0 flex-1 flex-col"><MainHeader /><main className="flex-1 overflow-auto p-5 sm:p-6"><Outlet /></main></div></div>
}
