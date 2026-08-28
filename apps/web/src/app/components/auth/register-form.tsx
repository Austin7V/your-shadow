"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { registerUser, getAuthErrorMessage } from "@/lib/api/auth-api";
import { AuthCard } from "./auth-card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

type RegisterField =
  | "email"
  | "password"
  | "confirmPassword"
  | "isAdultConfirmed";

type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearFieldError = (field: RegisterField) => {
    setFieldErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      delete nextErrors[field];

      return nextErrors;
    });
  };

  const validateForm = (): RegisterFieldErrors => {
    const errors: RegisterFieldErrors = {};
    const normalizedEmail = email.trim();

    if (!emailPattern.test(normalizedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (password.length < 8) {
      errors.password = "Password must contain at least 8 characters.";
    } else if (password.length > 128) {
      errors.password = "Password must not exceed 128 characters.";
    } else if (!/\S/.test(password)) {
      errors.password = "Password must contain a non-whitespace character.";
    }

    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (!isAdultConfirmed) {
      errors.isAdultConfirmed =
        "You must confirm that you are at least 18 years old.";
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
      await registerUser({
        email: email.trim().toLowerCase(),
        password,
        isAdultConfirmed,
      });

      router.push("/login?registered=true");
    } catch (error: unknown) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      description="Start building healthier habits with your personal companion."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <div
            className="rounded-md border border-error bg-error/10 px-4 py-3 text-sm text-error"
            role="alert"
          >
            {formError}
          </div>
        ) : null}

        <Input
          id="register-email"
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
          id="register-password"
          name="password"
          type="password"
          label="Password"
          autoComplete="new-password"
          value={password}
          error={fieldErrors.password}
          hint="Use at least 8 characters."
          disabled={isSubmitting}
          onChange={(event) => {
            setPassword(event.target.value);
            clearFieldError("password");
          }}
        />

        <Input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirm password"
          autoComplete="new-password"
          value={confirmPassword}
          error={fieldErrors.confirmPassword}
          disabled={isSubmitting}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearFieldError("confirmPassword");
          }}
        />

        <Checkbox
          id="register-adult-confirmation"
          name="isAdultConfirmed"
          label="I confirm that I am at least 18 years old."
          checked={isAdultConfirmed}
          error={fieldErrors.isAdultConfirmed}
          disabled={isSubmitting}
          onChange={(event) => {
            setIsAdultConfirmed(event.target.checked);
            clearFieldError("isAdultConfirmed");
          }}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
