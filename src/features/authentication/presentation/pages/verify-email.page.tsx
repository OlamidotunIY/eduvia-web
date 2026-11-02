import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui/input-otp";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { authStore } from "@/shared/store";
import {
  useRegistrationStatusQuery,
  useVerifyEmailMutation,
} from "../../application";
import { AuthErrorBanner } from "../components";
import { verifyEmailSchema } from "../schemas";

export function VerifyEmailPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const request = search.get("request");
  const continuation = search.get("continuation");
  const email = search.get("email");
  const registration = useRegistrationStatusQuery(request, continuation);
  const verify = useVerifyEmailMutation();
  const form = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { code: "" },
  });
  const isReady = registration.data?.nextAction === "verify_email";
  const hasContext = Boolean(request && continuation && email);

  return (
    <Card className="my-8 border-0 shadow-none sm:border sm:shadow-xs">
      <CardHeader>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          {isReady
            ? `Enter the six-digit code sent to ${email}.`
            : "Creating your account securely."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasContext && (
          <AuthErrorBanner
            error={
              new Error("This verification link is invalid or has expired.")
            }
          />
        )}
        {hasContext && registration.isAwaitingCompletion && (
          <p className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            Creating your profile and preparing your verification code…
          </p>
        )}
        {registration.error && <AuthErrorBanner error={registration.error} />}
        {isReady && email && (
          <form
            className="mt-5"
            onSubmit={form.handleSubmit((input) =>
              verify.mutate(
                { email, code: input.code },
                {
                  onSuccess: (session) => {
                    authStore
                      .getState()
                      .setSession({
                        accessToken: session.props.accessToken,
                        refreshToken: session.props.refreshToken,
                        expiresAt: session.props.accessTokenExpiresAt,
                        sessionId: session.props.sessionId,
                      });
                    navigate(APP_ROUTES.ONBOARDING, { replace: true });
                  },
                },
              ),
            )}
          >
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.code)}>
                <FieldLabel>Verification code</FieldLabel>
                <Controller
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      aria-invalid={Boolean(form.formState.errors.code)}
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }, (_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  )}
                />
                <FieldError errors={[form.formState.errors.code]} />
              </Field>
              <AuthErrorBanner error={verify.error} />
              <Button
                className="w-full"
                size="lg"
                type="submit"
                disabled={verify.isPending}
              >
                {verify.isPending ? "Verifying…" : "Verify email"}
              </Button>
            </FieldGroup>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            className="font-medium text-primary hover:underline"
            to={APP_ROUTES.LOGIN}
          >
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
