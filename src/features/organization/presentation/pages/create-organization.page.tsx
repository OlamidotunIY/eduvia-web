import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { sessionStore } from '@/shared/store'
import { useCreateOrganizationMutation } from '../../application'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your organization name.'),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only.'),
  contactEmail: z.email('Enter a valid contact email.'),
  country: z.string().trim().length(2, 'Use a two-letter country code, for example NG.'),
})

export function CreateOrganizationPage() {
  const navigate = useNavigate()
  const currentUser = sessionStore((state) => state.currentUser)
  const createOrganization = useCreateOrganizationMutation()
  const [isWaitingForWorkspace, setIsWaitingForWorkspace] = useState(false)
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', contactEmail: '', country: 'NG' },
  })
  const nameField = form.register('name')

  useEffect(() => {
    if (isWaitingForWorkspace && currentUser?.activeOrganization) {
      navigate(APP_ROUTES.DASHBOARD, { replace: true })
    }
  }, [currentUser?.activeOrganization, isWaitingForWorkspace, navigate])

  if (isWaitingForWorkspace) {
    return (
      <section className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="mt-7 text-sm font-medium text-primary">Organization created</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold">Setting up your workspace</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">We are assigning you as the organization owner. This screen will continue automatically as soon as the secure workspace event arrives.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl py-10">
      <Link className="text-sm text-primary hover:underline" to={APP_ROUTES.ONBOARDING}>← Back</Link>
      <h1 className="mt-5 font-heading text-3xl font-semibold">Create your organization</h1>
      <p className="mt-3 text-muted-foreground">You will become the first administrator. You can add subjects and invite your team from the workspace.</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={form.handleSubmit((input) => createOrganization.mutate(
          { ...input, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
          { onSuccess: () => setIsWaitingForWorkspace(true) },
        ))}
      >
        <label className="grid gap-2 text-sm font-medium">Organization name
          <input className="h-10 rounded-md border bg-background px-3" {...nameField} onBlur={(event) => {
            nameField.onBlur(event)
            if (!form.getValues('slug')) form.setValue('slug', event.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
          }} />
          <span className="text-xs text-destructive">{form.formState.errors.name?.message}</span>
        </label>
        <label className="grid gap-2 text-sm font-medium">Organization URL slug
          <input className="h-10 rounded-md border bg-background px-3" {...form.register('slug')} />
          <span className="text-xs text-destructive">{form.formState.errors.slug?.message}</span>
        </label>
        <label className="grid gap-2 text-sm font-medium">Contact email
          <input className="h-10 rounded-md border bg-background px-3" type="email" {...form.register('contactEmail')} />
          <span className="text-xs text-destructive">{form.formState.errors.contactEmail?.message}</span>
        </label>
        <label className="grid gap-2 text-sm font-medium">Country code
          <input className="h-10 rounded-md border bg-background px-3 uppercase" maxLength={2} {...form.register('country')} />
          <span className="text-xs text-destructive">{form.formState.errors.country?.message}</span>
        </label>
        {createOrganization.error && <p className="text-sm text-destructive">{createOrganization.error instanceof Error ? createOrganization.error.message : 'We could not create your organization.'}</p>}
        <Button className="w-full" size="lg" type="submit" disabled={createOrganization.isPending}>{createOrganization.isPending ? 'Creating organization…' : 'Create organization'}</Button>
      </form>
    </section>
  )
}
