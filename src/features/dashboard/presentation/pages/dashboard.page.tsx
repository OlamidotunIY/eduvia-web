import { Link } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { sessionStore } from '@/shared/store'

const copyByRole = {
  teacher: { title: 'Teaching workspace', detail: 'Plan lessons, manage classrooms, and follow learner progress from your organization.' },
  parent: { title: 'Family learning hub', detail: 'Keep up with your children’s learning, schedules, and progress.' },
  student: { title: 'Your learning space', detail: 'Continue your learning journey and stay on top of your assignments.' },
  admin: { title: 'Eduvia administration', detail: 'Manage the platform and its organizations.' },
} as const

export function DashboardPage() {
  const currentUser = sessionStore((state) => state.currentUser)
  const role = currentUser?.user.userType
  const copy = role && role !== 'pending' ? copyByRole[role] : copyByRole.student
  return <section className="max-w-4xl"><p className="text-sm font-medium text-primary">Welcome back, {currentUser?.user.firstName}</p><h1 className="mt-2 font-heading text-3xl font-semibold">{copy.title}</h1><p className="mt-3 max-w-2xl text-muted-foreground">{copy.detail}</p>{role === 'teacher' && !currentUser?.activeOrganization && <Link className="mt-6 inline-block text-sm font-medium text-primary hover:underline" to={APP_ROUTES.ONBOARDING_ORGANIZATION}>Finish organization setup →</Link>}<div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Active organization</p><p className="mt-2 font-medium">{currentUser?.activeOrganization?.name ?? 'Not selected'}</p></div><div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Account role</p><p className="mt-2 font-medium capitalize">{role ?? 'Loading'}</p></div><div className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Organizations</p><p className="mt-2 font-medium">{currentUser?.organizations.length ?? 0}</p></div></div></section>
}
