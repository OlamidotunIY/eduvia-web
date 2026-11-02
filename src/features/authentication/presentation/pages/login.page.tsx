import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { authStore } from '@/shared/store'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { beginGoogleOAuth, useLoginMutation } from '../../application'
import { AuthErrorBanner, AuthFormHeader } from '../components'
import { loginSchema } from '../schemas'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLoginMutation()
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <div className="py-8 sm:py-14">
      <AuthFormHeader title="Welcome back" description="Sign in to continue learning with Eduvia." />
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit((input) =>
          login.mutate(input, {
            onSuccess: (session) => {
              authStore.getState().setSession({
                accessToken: session.props.accessToken,
                refreshToken: session.props.refreshToken,
                expiresAt: session.props.accessTokenExpiresAt,
                sessionId: session.props.sessionId,
              })
              navigate(APP_ROUTES.DASHBOARD, { replace: true })
            },
          }),
        )}
      >
        <label className="grid gap-2 text-sm font-medium">
          Email address
          <input className="h-10 rounded-md border bg-background px-3" type="email" autoComplete="email" {...form.register('email')} />
          <span className="text-xs text-destructive">{form.formState.errors.email?.message}</span>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
          <input className="h-10 rounded-md border bg-background px-3" type="password" autoComplete="current-password" {...form.register('password')} />
          <span className="text-xs text-destructive">{form.formState.errors.password?.message}</span>
        </label>
        <AuthErrorBanner error={login.error} />
        <Button className="w-full" size="lg" type="submit" disabled={login.isPending}>
          {login.isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</div>
      <Button className="w-full" variant="outline" size="lg" onClick={() => beginGoogleOAuth('login')}>
        Continue with Google
      </Button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Eduvia? <Link className="font-medium text-primary hover:underline" to={APP_ROUTES.REGISTRATION}>Create an account</Link>
      </p>
    </div>
  )
}
