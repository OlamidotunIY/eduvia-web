import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spinner } from '@/shared/ui/spinner'
import { APP_ROUTES } from '@/shared/constant/routes.constants'
import { authStore } from '@/shared/store'
import {
  useGoogleExchangeMutation,
  useRegistrationStatusQuery,
} from "../../application";
import { AuthErrorBanner } from '../components'

export function AuthCallbackPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const exchange = useGoogleExchangeMutation();
  const started = useRef(false);
  const oauthCode = search.get("oauthCode");
  const oauthError = search.get("oauthError");
  const registrationRequestId = search.get("registrationRequestId");
  const registrationContinuation = search.get("registrationContinuation");
  const registration = useRegistrationStatusQuery(
    registrationRequestId,
    registrationContinuation,
  );

  useEffect(() => {
    if (
      started.current ||
      (registrationRequestId && registrationContinuation) ||
      !oauthCode
    )
      return;
    started.current = true;
    exchange.mutate(oauthCode, {
      onSuccess: (session) => {
        authStore.getState().setSession({
          accessToken: session.props.accessToken,
          refreshToken: session.props.refreshToken,
          expiresAt: session.props.accessTokenExpiresAt,
          refreshExpiresAt: session.props.refreshTokenExpiresAt,
          sessionId: session.props.sessionId,
        });
        navigate(APP_ROUTES.DASHBOARD, { replace: true });
      },
    });
  }, [
    exchange,
    navigate,
    oauthCode,
    registrationContinuation,
    registrationRequestId,
  ]);

  useEffect(() => {
    const session = registration.data?.session;
    if (!session || started.current) return;
    started.current = true;
    authStore.getState().setSession({
      accessToken: session.props.accessToken,
      refreshToken: session.props.refreshToken,
      expiresAt: session.props.accessTokenExpiresAt,
      refreshExpiresAt: session.props.refreshTokenExpiresAt,
      sessionId: session.props.sessionId,
    });
    navigate(APP_ROUTES.ONBOARDING, { replace: true });
  }, [navigate, registration.data?.session]);

  const error =
    oauthError
      ? new Error(oauthError)
      : !oauthCode && !registrationRequestId
      ? new Error("This sign-in link is invalid or has expired.")
      : registration.data?.nextAction === "sign_in"
        ? new Error(
            "This Google sign-up link has already been used. Please sign in instead.",
          )
        : (exchange.error ?? registration.error);

  return (
    <section className="flex min-h-full w-full items-center justify-center py-12 text-center">
      <div className="w-full max-w-md space-y-3 bg-transparent">
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl font-semibold tracking-tight">
            Completing sign in
          </h1>
          <p className="text-sm text-muted-foreground">
            Securely connecting your Google account to Eduvia.
          </p>
        </div>
        {error ? (
          <AuthErrorBanner error={error} />
        ) : (
          <div className="flex items-center justify-center gap-3 py-3 text-sm text-muted-foreground">
            <Spinner />
            {registration.isAwaitingCompletion
              ? 'Creating your Eduvia account…'
              : 'Please wait…'}
          </div>
        )}
      </div>
    </section>
  )
}
