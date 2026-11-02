import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Spinner } from "@/shared/ui/spinner";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { authStore } from "@/shared/store";
import {
  useGoogleExchangeMutation,
  useRegistrationStatusQuery,
} from "../../application";
import { AuthErrorBanner } from "../components";

export function AuthCallbackPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const exchange = useGoogleExchangeMutation();
  const started = useRef(false);
  const oauthCode = search.get("oauthCode");
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
      sessionId: session.props.sessionId,
    });
    navigate(APP_ROUTES.ONBOARDING, { replace: true });
  }, [navigate, registration.data?.session]);

  const error =
    !oauthCode && !registrationRequestId
      ? new Error("This sign-in link is invalid or has expired.")
      : registration.data?.nextAction === "sign_in"
        ? new Error(
            "This Google sign-up link has already been used. Please sign in instead.",
          )
        : (exchange.error ?? registration.error);

  return (
    <Card className="my-8 border-0 shadow-none sm:border sm:shadow-xs">
      <CardHeader>
        <CardTitle className="text-2xl">Completing sign in</CardTitle>
        <CardDescription>
          Securely connecting your Google account to Eduvia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <AuthErrorBanner error={error} />
        ) : (
          <div className="flex items-center gap-3 rounded-md bg-muted p-4 text-sm text-muted-foreground">
            <Spinner />
            {registration.isAwaitingCompletion
              ? "Creating your Eduvia account…"
              : "Please wait…"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
