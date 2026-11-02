import { GraduationCap, School } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { authStore, sessionStore } from '@/shared/store'
import { refreshCurrentUser } from '@/features/authentication'
import { useCompleteOnboardingMutation } from '../../application'

export function RoleSelectionPage() {
  const navigate = useNavigate()
  const currentUser = sessionStore((state) => state.currentUser)
  const completeOnboarding = useCompleteOnboardingMutation()
  const complete = (userType: 'teacher' | 'parent') => {
    if (!currentUser) return
    completeOnboarding.mutate(
      {
        userType,
        firstName: currentUser.user.firstName,
        lastName: currentUser.user.lastName,
        timezone: currentUser.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      { onSuccess: async () => {
        await refreshCurrentUser()
        navigate(userType === 'teacher' ? APP_ROUTES.ONBOARDING_ORGANIZATION : APP_ROUTES.DASHBOARD, { replace: true })
      } },
    )
  }

  return <section className="mx-auto max-w-2xl py-10"><div className="mb-8"><p className="text-sm font-medium text-primary">Welcome to Eduvia</p><h1 className="mt-2 font-heading text-3xl font-semibold">How will you use Eduvia?</h1><p className="mt-3 text-muted-foreground">Choose your role to configure the right workspace. You can complete your profile later.</p></div><div className="grid gap-4 sm:grid-cols-2"><button className="rounded-xl border bg-card p-6 text-left transition-colors hover:border-primary hover:bg-primary/5" onClick={() => complete('teacher')} disabled={completeOnboarding.isPending}><School className="mb-5 size-7 text-primary" /><h2 className="text-lg font-semibold">I’m a teacher</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Create your tutoring organization or apply to an organization that is hiring.</p></button><button className="rounded-xl border bg-card p-6 text-left transition-colors hover:border-primary hover:bg-primary/5" onClick={() => complete('parent')} disabled={completeOnboarding.isPending}><GraduationCap className="mb-5 size-7 text-primary" /><h2 className="text-lg font-semibold">I’m a parent</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Manage your children’s learning, schedules, and progress in one place.</p></button></div>{completeOnboarding.error && <p className="mt-5 text-sm text-destructive">{completeOnboarding.error instanceof Error ? completeOnboarding.error.message : 'We could not save your role. Please try again.'}</p>}<Button className="mt-8" variant="ghost" onClick={() => { authStore.getState().clear(); sessionStore.getState().clearCurrentUser(); navigate(APP_ROUTES.LOGIN, { replace: true }) }}>Sign out instead</Button></section>
}
