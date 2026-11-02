import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { authStore } from '@/shared/store'
import { useGoogleExchangeMutation, useRegistrationStatusQuery } from '../../application'
import { AuthErrorBanner, AuthFormHeader } from '../components'

export function AuthCallbackPage() {
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const exchange = useGoogleExchangeMutation()
  const started = useRef(false)
  const oauthCode = search.get('oauthCode')
  const registrationRequestId = search.get('registrationRequestId')
  const registrationContinuation = search.get('registrationContinuation')
  const registration = useRegistrationStatusQuery(registrationRequestId, registrationContinuation)

  useEffect(() => {
    if (started.current) return
    if (registrationRequestId && registrationContinuation) return
    if (!oauthCode) return
    started.current = true
    exchange.mutate(oauthCode, {
      onSuccess: (session) => {
        authStore.getState().setSession({ accessToken: session.props.accessToken, refreshToken: session.props.refreshToken, expiresAt: session.props.accessTokenExpiresAt, sessionId: session.props.sessionId })
        navigate(APP_ROUTES.DASHBOARD, { replace: true })
      },
    })
  }, [exchange, navigate, oauthCode, registrationContinuation, registrationRequestId])

  useEffect(() => {
    const session = registration.data?.session
    if (!session || started.current) return
    started.current = true
    authStore.getState().setSession({
      accessToken: session.props.accessToken,
      refreshToken: session.props.refreshToken,
      expiresAt: session.props.accessTokenExpiresAt,
      sessionId: session.props.sessionId,
    })
    navigate(APP_ROUTES.ONBOARDING, { replace: true })
  }, [navigate, registration.data?.session])

  const invalidCallback = !oauthCode && !registrationRequestId
  const registrationRequiresSignIn = registration.data?.nextAction === 'sign_in'
  return <div className="py-8 sm:py-14"><AuthFormHeader title="Completing sign in" description="Securely connecting your Google account to Eduvia." />{invalidCallback ? <AuthErrorBanner error={new Error('This sign-in link is invalid or has expired.')} /> : registrationRequiresSignIn ? <AuthErrorBanner error={new Error('This Google sign-up link has already been used. Please sign in instead.')} /> : exchange.error || registration.error ? <AuthErrorBanner error={exchange.error ?? registration.error} /> : registration.isAwaitingCompletion ? <p className="rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground">Creating your Eduvia account…</p> : <p className="text-sm text-muted-foreground">Please wait…</p>}</div>
}
