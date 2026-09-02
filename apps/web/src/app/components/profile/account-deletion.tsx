"use client";

import { Database, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSWRConfig } from "swr";
import { Button } from "@/app/components/ui/button";
import { DestructiveConfirmation } from "@/app/components/ui/destructive-confirmation";
import { ErrorState } from "@/app/components/ui/error-state";
import { Input } from "@/app/components/ui/input";
import { PasswordInput } from "@/app/components/ui/password-input";
import {
  ApiRequestError,
  deleteCurrentAccount,
  getAuthErrorMessage,
} from "@/lib/api/auth-api";

type FormErrors = {
  password?: string;
  confirmation?: string;
  form?: string;
};

const deletionConsequences = [
  {
    label: "Profile and account",
    icon: Trash2,
  },
  {
    label: "Weight history and health constraints",
    icon: Database,
  },
  {
    label: "Active sessions",
    icon: LogOut,
  },
] as const;

export function AccountDeletion() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleDeleteAccount = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const validationErrors: FormErrors = {};

    if (!password) {
      validationErrors.password = "Enter your current password.";
    } else if (password.length < 8) {
      validationErrors.password =
        "Your password must contain at least 8 characters.";
    }

    if (confirmation !== "DELETE") {
      validationErrors.confirmation = 'Type "DELETE" exactly as shown.';
    }

    if (validationErrors.password || validationErrors.confirmation) {
      setErrors(validationErrors);
      return;
    }

    setIsDeleting(true);
    setErrors({});

    try {
      await deleteCurrentAccount({
        password,
        confirmation,
      });

      await mutate("/api/auth/me", undefined, {
        revalidate: false,
      });

      router.replace("/register");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof ApiRequestError && error.statusCode === 401
          ? "The password is incorrect or your session has expired."
          : getAuthErrorMessage(error);

      setErrors({
        form: message,
      });
      setIsDeleting(false);
    }
  };

  const handleCancel = (): void => {
    setIsFormVisible(false);
    setPassword("");
    setConfirmation("");
    setErrors({});
  };

  if (!isFormVisible) {
    return (
      <section
        aria-labelledby="danger-zone-title"
        className="rounded-panel border border-error/40 bg-surface p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-3xl items-start gap-4">
            <span
              aria-hidden="true"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-control bg-error/10 text-error"
            >
              <ShieldAlert className="size-6" strokeWidth={2} />
            </span>

            <div>
              <p className="text-sm font-semibold tracking-[0.16em] text-error uppercase">
                Danger zone
              </p>
              <h2
                id="danger-zone-title"
                className="mt-2 text-2xl font-bold tracking-tight"
              >
                Permanently delete your account
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                This removes your account and its owned data. The action cannot
                be undone and requires two explicit confirmations.
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            className="w-full shrink-0 lg:w-auto"
            onClick={() => setIsFormVisible(true)}
          >
            Delete account
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form
      id="delete-account-confirmation"
      onSubmit={handleDeleteAccount}
      noValidate
    >
      <DestructiveConfirmation
        title="Confirm permanent account deletion"
        description="Your account, profile, weight history, health constraints, and active sessions will be permanently deleted. This cannot be undone."
        actions={
          <>
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={isDeleting}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="w-full sm:w-auto"
              loading={isDeleting}
              loadingLabel="Deleting account..."
            >
              Permanently delete account
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          <div className="rounded-card border border-error/20 bg-surface p-4 sm:p-5">
            <p className="font-semibold text-foreground">
              The following data will be removed:
            </p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {deletionConsequences.map((item) => {
                const Icon = item.icon;

                return (
                  <li
                    key={item.label}
                    className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                  >
                    <Icon
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-error"
                      strokeWidth={2}
                    />
                    <span>{item.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <PasswordInput
              label="Current password"
              name="password"
              autoComplete="current-password"
              value={password}
              error={errors.password}
              disabled={isDeleting}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  password: undefined,
                  form: undefined,
                }));
              }}
            />

            <Input
              label='Type "DELETE" to confirm'
              name="confirmation"
              type="text"
              autoComplete="off"
              value={confirmation}
              error={errors.confirmation}
              hint="Enter the uppercase word exactly as shown."
              disabled={isDeleting}
              onChange={(event) => {
                setConfirmation(event.target.value);
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  confirmation: undefined,
                  form: undefined,
                }));
              }}
            />
          </div>

          {errors.form ? (
            <ErrorState
              title="Account was not deleted"
              description={errors.form}
            />
          ) : null}
        </div>
      </DestructiveConfirmation>
    </form>
  );
}
