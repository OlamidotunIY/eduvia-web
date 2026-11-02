import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";
import { Button } from "@/shared/ui/button";
import { authStore } from "@/shared/store";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import { beginGoogleOAuth, useLoginMutation } from "../../application";
import { AuthErrorBanner } from "../components";
import { loginSchema } from "../schemas";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLoginMutation();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <section className="my-8 py-6 sm:py-10">
      <header className="mb-10 space-y-3">
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Eduvia account</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">Sign in to continue learning with Eduvia.</p>
      </header>
        <form
          onSubmit={form.handleSubmit((input) =>
            login.mutate(input, {
              onSuccess: (session) => {
                authStore.getState().setSession({
                  accessToken: session.props.accessToken,
                  refreshToken: session.props.refreshToken,
                  expiresAt: session.props.accessTokenExpiresAt,
                  sessionId: session.props.sessionId,
                });
                navigate(APP_ROUTES.DASHBOARD, { replace: true });
              },
            }),
          )}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <FieldLabel className="text-xs font-semibold tracking-wide uppercase" htmlFor="email">Email address</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(form.formState.errors.email)}
                className="h-12 rounded-xl bg-transparent px-4"
                {...form.register("email")}
              />
              <FieldError errors={[form.formState.errors.email]} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel className="text-xs font-semibold tracking-wide uppercase" htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                className="h-12 rounded-xl bg-transparent px-4"
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
            <AuthErrorBanner error={login.error} />
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign in"}
            </Button>
            <div className="flex items-center gap-3 py-1"><Separator /><span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">or continue with</span><Separator /></div>
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              type="button"
              onClick={() => beginGoogleOAuth("login")}
            >
              Continue with Google
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Eduvia?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            to={APP_ROUTES.REGISTRATION}
          >
            Create an account
          </Link>
        </p>
    </section>
  );
}
