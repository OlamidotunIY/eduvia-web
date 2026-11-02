import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { authStore } from '@/shared/store'
import { useRegistrationStatusQuery, useVerifyEmailMutation } from '../../application'
import { AuthErrorBanner, AuthFormHeader } from '../components'
import { verifyEmailSchema } from '../schemas'

export function VerifyEmailPage() {
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const request = search.get('request')
  const continuation = search.get('continuation')
  const email = search.get('email')
  const registration = useRegistrationStatusQuery(request, continuation)
  const verify = useVerifyEmailMutation()
  const form = useForm({ resolver: zodResolver(verifyEmailSchema), defaultValues: { code: '' } })
  const isReady = registration.data?.nextAction === 'verify_email'
  const hasContext = Boolean(request && continuation && email)

  return (
    <div className="py-8 sm:py-14">
      <AuthFormHeader title="Verify your email" description={isReady ? `Enter the six-digit code sent to ${email}.` : 'Creating your account securely.'} />
      {!hasContext && <AuthErrorBanner error={new Error('This verification link is invalid or has expired.')} />}
      {hasContext && registration.isAwaitingCompletion && <div className="rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground">Creating your profile and preparing your verification code…</div>}
      {registration.error && <AuthErrorBanner error={registration.error} />}
      {isReady && email && (
        <form className="space-y-5" onSubmit={form.handleSubmit((input) => verify.mutate({ email, code: input.code }, { onSuccess: (session) => {
          authStore.getState().setSession({ accessToken: session.props.accessToken, refreshToken: session.props.refreshToken, expiresAt: session.props.accessTokenExpiresAt, sessionId: session.props.sessionId })
          navigate(APP_ROUTES.ONBOARDING, { replace: true })
        }}))}>
          <label className="grid gap-2 text-sm font-medium">Verification code
            <input className="h-11 rounded-md border bg-background px-3 tracking-[0.35em]" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...form.register('code')} />
            <span className="text-xs text-destructive">{form.formState.errors.code?.message}</span>
          </label>
          <AuthErrorBanner error={verify.error} />
          <Button className="w-full" size="lg" type="submit" disabled={verify.isPending}>{verify.isPending ? 'Verifying…' : 'Verify email'}</Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground"><Link className="font-medium text-primary hover:underline" to={APP_ROUTES.LOGIN}>Back to sign in</Link></p>
    </div>
  )
}
