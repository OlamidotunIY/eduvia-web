import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
          <FieldGroup className="gap-5">
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <FieldLabel className="text-xs font-semibold tracking-wide uppercase" htmlFor="email">Email address</FieldLabel>
              <div className="relative"><Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(form.formState.errors.email)} className="h-10 rounded-lg bg-transparent pr-3 pl-10" {...form.register("email")} /></div>
              <FieldError errors={[form.formState.errors.email]} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel className="text-xs font-semibold tracking-wide uppercase" htmlFor="password">Password</FieldLabel>
              <div className="relative"><LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="password" type={isPasswordVisible ? "text" : "password"} autoComplete="current-password" aria-invalid={Boolean(form.formState.errors.password)} className="h-10 rounded-lg bg-transparent pr-10 pl-10" {...form.register("password")} /><Button type="button" variant="ghost" size="icon-sm" className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground" aria-label={isPasswordVisible ? "Hide password" : "Show password"} onClick={() => setIsPasswordVisible((visible) => !visible)}>{isPasswordVisible ? <EyeOff /> : <Eye />}</Button></div>
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
            <div className="flex w-full items-center gap-3 py-1"><Separator className="w-auto flex-1" /><span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">or continue with</span><Separator className="w-auto flex-1" /></div>
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
