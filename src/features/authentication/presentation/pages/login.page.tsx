import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { authStore } from '@/shared/store'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { beginGoogleOAuth, useLoginMutation } from '../../application'
import { AuthErrorBanner } from '../components'
import { loginSchema } from '../schemas'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLoginMutation()
  const form = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  return <Card className="my-8 border-0 shadow-none sm:border sm:shadow-xs"><CardHeader><CardTitle className="text-2xl">Welcome back</CardTitle><CardDescription>Sign in to continue learning with Eduvia.</CardDescription></CardHeader><CardContent><form onSubmit={form.handleSubmit((input) => login.mutate(input, { onSuccess: (session) => { authStore.getState().setSession({ accessToken: session.props.accessToken, refreshToken: session.props.refreshToken, expiresAt: session.props.accessTokenExpiresAt, sessionId: session.props.sessionId }); navigate(APP_ROUTES.DASHBOARD, { replace: true }) } }))}><FieldGroup><Field data-invalid={Boolean(form.formState.errors.email)}><FieldLabel htmlFor="email">Email address</FieldLabel><Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register('email')} /><FieldError errors={[form.formState.errors.email]} /></Field><Field data-invalid={Boolean(form.formState.errors.password)}><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register('password')} /><FieldError errors={[form.formState.errors.password]} /></Field><AuthErrorBanner error={login.error} /><Button className="w-full" size="lg" type="submit" disabled={login.isPending}>{login.isPending ? 'Signing in…' : 'Sign in'}</Button><FieldSeparator>or continue with</FieldSeparator><Button className="w-full" variant="outline" size="lg" type="button" onClick={() => beginGoogleOAuth('login')}>Continue with Google</Button></FieldGroup></form><p className="mt-6 text-center text-sm text-muted-foreground">New to Eduvia? <Link className="font-medium text-primary hover:underline" to={APP_ROUTES.REGISTRATION}>Create an account</Link></p></CardContent></Card>
}
