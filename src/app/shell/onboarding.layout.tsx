import { Outlet } from 'react-router-dom'
import { Logo } from '@/shared/ui/logo'

export function OnboardingLayout() {
  return <main className="min-h-svh bg-muted/40"><header className="mx-auto flex max-w-5xl p-5 sm:p-8"><Logo size="lg" /></header><section className="mx-auto max-w-3xl px-5 pb-12 sm:px-8"><Outlet /></section></main>
}
