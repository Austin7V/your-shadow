"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
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
            validationErrors.confirmation =
                'Type "DELETE" exactly as shown.';
        }

        if (
            validationErrors.password ||
            validationErrors.confirmation
        ) {
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
                error instanceof ApiRequestError &&
                error.statusCode === 401
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

    return (
        <section
            aria-labelledby="delete-account-title"
            className="mt-8 rounded-lg border border-error/40 bg-surface p-6"
        >
            <h2
                id="delete-account-title"
                className="text-xl font-bold text-error"
            >
                Delete account
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                Permanently delete your account, profile, weight history,
                health constraints and active sessions. This action cannot
                be undone.
            </p>

            {!isFormVisible ? (
                <Button
                    className="mt-5"
                    variant="danger"
                    onClick={() => setIsFormVisible(true)}
                >
                    Delete account
                </Button>
            ) : (
                <form
                    className="mt-6 max-w-xl space-y-5"
                    onSubmit={handleDeleteAccount}
                    noValidate
                >
                    <Input
                        label="Current password"
                        name="password"
                        type="password"
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

                    {errors.form ? (
                        <p
                            role="alert"
                            className="rounded-md border border-error/40 bg-error/5 p-3 text-sm text-error"
                        >
                            {errors.form}
                        </p>
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                            type="submit"
                            variant="danger"
                            loading={isDeleting}
                        >
                            Permanently delete account
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isDeleting}
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </section>
    );
}