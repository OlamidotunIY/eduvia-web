import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";
import { APP_ROUTES } from "@/shared/constant/routes.constants";
import {
  beginGoogleOAuth,
  useEmailRegistrationMutation,
} from "../../application";
import { AuthErrorBanner } from "../components";
import { registrationSchema } from "../schemas";

export function SignUpPage() {
  const navigate = useNavigate();
  const registration = useEmailRegistrationMutation();
  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
  });

  return (
    <section className="my-8 py-6 sm:py-10">
      <header className="mb-10 space-y-3"><p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Get started</p><h1 className="font-heading text-3xl font-semibold tracking-tight">Create your Eduvia account</h1><p className="max-w-md text-sm leading-6 text-muted-foreground">Start with your details. You will choose your role after registration.</p></header>
        <form
          onSubmit={form.handleSubmit((input) =>
            registration.mutate(
              {
                ...input,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              },
              {
                onSuccess: (status) => {
                  const search = new URLSearchParams({
                    request: status.registrationRequestId,
                    continuation: status.registrationContinuation,
                    email: input.email,
                  });
                  navigate(`${APP_ROUTES.VERIFY_EMAIL}?${search.toString()}`, {
                    replace: true,
                  });
                },
              },
            ),
          )}
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(form.formState.errors.firstName)}>
              <FieldLabel className="text-xs font-semibold tracking-wide uppercase" htmlFor="first-name">First name</FieldLabel>
                <Input
                  id="first-name"
                  autoComplete="given-name"
                  aria-invalid={Boolean(form.formState.errors.firstName)}
                className="h-12 rounded-xl bg-transparent px-4"
                  {...form.register("firstName")}
                />
                <FieldError errors={[form.formState.errors.firstName]} />
              </Field>
              <Field data-invalid={Boolean(form.formState.errors.lastName)}>
              <FieldLabel className="text-xs font-semibold tracking-wide uppercase" htmlFor="last-name">Last name</FieldLabel>
                <Input
                  id="last-name"
                  autoComplete="family-name"
                  aria-invalid={Boolean(form.formState.errors.lastName)}
                className="h-12 rounded-xl bg-transparent px-4"
                  {...form.register("lastName")}
                />
                <FieldError errors={[form.formState.errors.lastName]} />
              </Field>
            </div>
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
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                className="h-12 rounded-xl bg-transparent px-4"
                {...form.register("password")}
              />
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
            <AuthErrorBanner error={registration.error} />
            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={registration.isPending}
            >
              {registration.isPending ? "Creating account…" : "Create account"}
            </Button>
            <div className="flex items-center gap-3 py-1"><Separator /><span className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">or continue with</span><Separator /></div>
            <Button
              className="w-full"
              variant="outline"
              size="lg"
              type="button"
              onClick={() => beginGoogleOAuth("signup")}
            >
              Continue with Google
            </Button>
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-primary hover:underline"
            to={APP_ROUTES.LOGIN}
          >
            Sign in
          </Link>
        </p>
    </section>
  );
}
