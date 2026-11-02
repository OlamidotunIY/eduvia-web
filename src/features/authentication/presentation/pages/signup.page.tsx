import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { beginGoogleOAuth, useEmailRegistrationMutation } from '../../application'
import { AuthErrorBanner } from '../components'
import { registrationSchema } from '../schemas'

export function SignUpPage() {
  const navigate = useNavigate()
  const registration = useEmailRegistrationMutation()
  const form = useForm({ resolver: zodResolver(registrationSchema), defaultValues: { firstName: '', lastName: '', email: '', password: '' } })

  return <Card className="my-8 border-0 shadow-none sm:border sm:shadow-xs"><CardHeader><CardTitle className="text-2xl">Create your Eduvia account</CardTitle><CardDescription>Start with your details. You will choose your role after registration.</CardDescription></CardHeader><CardContent><form onSubmit={form.handleSubmit((input) => registration.mutate({ ...input, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }, { onSuccess: (status) => { const search = new URLSearchParams({ request: status.registrationRequestId, continuation: status.registrationContinuation, email: input.email }); navigate(`${APP_ROUTES.VERIFY_EMAIL}?${search.toString()}`, { replace: true }) } }))}><FieldGroup><div className="grid gap-4 sm:grid-cols-2"><Field data-invalid={Boolean(form.formState.errors.firstName)}><FieldLabel htmlFor="first-name">First name</FieldLabel><Input id="first-name" autoComplete="given-name" aria-invalid={Boolean(form.formState.errors.firstName)} {...form.register('firstName')} /><FieldError errors={[form.formState.errors.firstName]} /></Field><Field data-invalid={Boolean(form.formState.errors.lastName)}><FieldLabel htmlFor="last-name">Last name</FieldLabel><Input id="last-name" autoComplete="family-name" aria-invalid={Boolean(form.formState.errors.lastName)} {...form.register('lastName')} /><FieldError errors={[form.formState.errors.lastName]} /></Field></div><Field data-invalid={Boolean(form.formState.errors.email)}><FieldLabel htmlFor="email">Email address</FieldLabel><Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} {...form.register('email')} /><FieldError errors={[form.formState.errors.email]} /></Field><Field data-invalid={Boolean(form.formState.errors.password)}><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" type="password" autoComplete="new-password" aria-invalid={Boolean(form.formState.errors.password)} {...form.register('password')} /><FieldError errors={[form.formState.errors.password]} /></Field><AuthErrorBanner error={registration.error} /><Button className="w-full" size="lg" type="submit" disabled={registration.isPending}>{registration.isPending ? 'Creating account…' : 'Create account'}</Button><FieldSeparator>or continue with</FieldSeparator><Button className="w-full" variant="outline" size="lg" type="button" onClick={() => beginGoogleOAuth('signup')}>Continue with Google</Button></FieldGroup></form><p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <Link className="font-medium text-primary hover:underline" to={APP_ROUTES.LOGIN}>Sign in</Link></p></CardContent></Card>
}
