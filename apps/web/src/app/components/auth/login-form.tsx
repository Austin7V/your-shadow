"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { getAuthErrorMessage, loginUser } from "@/lib/api/auth-api";
import { AuthCard } from "./auth-card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

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

      router.replace("/dashboard");
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
      description="Log in to continue with Your Shadow."
      footer={
        <>
          Do not have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {registrationCompleted ? (
          <div
            className="rounded-md border border-primary bg-primary/10 px-4 py-3 text-sm text-foreground"
            role="status"
          >
            Your account was created successfully. You can now log in.
          </div>
        ) : null}

        {formError ? (
          <div
            className="rounded-md border border-error bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {formError}
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

        <Input
          id="login-password"
          name="password"
          type="password"
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

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
