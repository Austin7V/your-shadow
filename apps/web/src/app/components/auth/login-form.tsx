"use client";

import Link from "next/link";
import { CircleAlert, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { getAuthErrorMessage, loginUser } from "@/lib/api/auth-api";
import { AuthCard } from "./auth-card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";
import { getSafeReturnTo } from "@/lib/auth/get-safe-return-to";

type LoginFormProps = {
  registrationCompleted: boolean;
};

type LoginField = "email" | "password";

type LoginFieldErrors = Partial<Record<LoginField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ registrationCompleted }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (field: LoginField) => {
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      delete nextErrors[field];

      return nextErrors;
    });
  };

  const validateForm = (): LoginFieldErrors => {
    const errors: LoginFieldErrors = {};

    if (!emailPattern.test(email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      errors.password = "Password must contain at least 8 characters.";
    } else if (password.length > 128) {
      errors.password = "Password must not exceed 128 characters.";
    } else if (!/\S/.test(password)) {
      errors.password = "Password must contain a non-whitespace character.";
    }

    return errors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();

    setFieldErrors(validationErrors);
    setFormError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      const searchParams = new URLSearchParams(window.location.search);
      const returnTo = getSafeReturnTo(searchParams.get("returnTo"));

      router.replace(returnTo);
      router.refresh();
    } catch (error: unknown) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      description="Log in to pick up from your next useful step."
      footer={
        <>
          Do not have an account?{" "}
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center rounded-compact font-semibold text-primary-content hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-6" onSubmit={handleSubmit} noValidate>
        {registrationCompleted ? (
          <div
            className="flex items-start gap-3 rounded-control border border-success/40 bg-success/10 p-4 text-sm leading-6 text-foreground"
            role="status"
          >
            <CircleCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-success-content"
              strokeWidth={2}
            />
            <p>Your account was created successfully. You can now log in.</p>
          </div>
        ) : null}

        {formError ? (
          <div
            className="flex items-start gap-3 rounded-control border border-error/40 bg-error/10 p-4 text-sm leading-6 text-foreground"
            role="alert"
          >
            <CircleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-error-content"
              strokeWidth={2}
            />
            <p>{formError}</p>
          </div>
        ) : null}

        <Input
          id="login-email"
          name="email"
          type="email"
          label="Email address"
          autoComplete="email"
          value={email}
          error={fieldErrors.email}
          disabled={isSubmitting}
          onChange={(event) => {
            setEmail(event.target.value);
            clearFieldError("email");
          }}
        />

        <PasswordInput
          id="login-password"
          name="password"
          label="Password"
          autoComplete="current-password"
          value={password}
          error={fieldErrors.password}
          disabled={isSubmitting}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
        />

        <Button
          type="submit"
          className="min-h-12 w-full"
          loading={isSubmitting}
          loadingLabel="Logging in..."
        >
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
