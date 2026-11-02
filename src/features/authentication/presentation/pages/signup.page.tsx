import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { beginGoogleOAuth, useEmailRegistrationMutation } from '../../application'
import { AuthErrorBanner, AuthFormHeader } from '../components'
import { registrationSchema } from '../schemas'

export function SignUpPage() {
  const navigate = useNavigate()
  const registration = useEmailRegistrationMutation()
  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
  })

  return (
    <div className="py-8 sm:py-14">
      <AuthFormHeader title="Create your Eduvia account" description="Start with your details. You will choose your role after registration." />
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit((input) =>
          registration.mutate(
            { ...input, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
            {
              onSuccess: (status) => {
                const search = new URLSearchParams({
                  request: status.registrationRequestId,
                  continuation: status.registrationContinuation,
                  email: input.email,
                })
                navigate(`${APP_ROUTES.VERIFY_EMAIL}?${search.toString()}`, { replace: true })
              },
            },
          ),
        )}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium">First name<input className="h-10 rounded-md border bg-background px-3" autoComplete="given-name" {...form.register('firstName')} /><span className="text-xs text-destructive">{form.formState.errors.firstName?.message}</span></label>
          <label className="grid gap-2 text-sm font-medium">Last name<input className="h-10 rounded-md border bg-background px-3" autoComplete="family-name" {...form.register('lastName')} /><span className="text-xs text-destructive">{form.formState.errors.lastName?.message}</span></label>
        </div>
        <label className="grid gap-2 text-sm font-medium">Email address<input className="h-10 rounded-md border bg-background px-3" type="email" autoComplete="email" {...form.register('email')} /><span className="text-xs text-destructive">{form.formState.errors.email?.message}</span></label>
        <label className="grid gap-2 text-sm font-medium">Password<input className="h-10 rounded-md border bg-background px-3" type="password" autoComplete="new-password" {...form.register('password')} /><span className="text-xs text-destructive">{form.formState.errors.password?.message}</span></label>
        <AuthErrorBanner error={registration.error} />
        <Button className="w-full" size="lg" type="submit" disabled={registration.isPending}>{registration.isPending ? 'Creating account…' : 'Create account'}</Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</div>
      <Button className="w-full" variant="outline" size="lg" onClick={() => beginGoogleOAuth('signup')}>Continue with Google</Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link className="font-medium text-primary hover:underline" to={APP_ROUTES.LOGIN}>Sign in</Link></p>
    </div>
  )
}
