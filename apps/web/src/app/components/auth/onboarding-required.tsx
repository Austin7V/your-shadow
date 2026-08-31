"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useProfileStatus } from "@/hooks/use-profile-status";

type OnboardingRequiredProps = {
    children: ReactNode;
};

export function OnboardingRequired({
                                       children,
                                   }: OnboardingRequiredProps) {
    const router = useRouter();
    const {
        hasProfile,
        isLoading,
        error,
        refreshProfileStatus,
    } = useProfileStatus();

    useEffect(() => {
        if (hasProfile === true) {
            router.replace("/dashboard");
        }
    }, [hasProfile, router]);

    if (isLoading || hasProfile === true) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6">
                <p className="text-sm text-muted-foreground">
                    Checking your profile...
                </p>
            </main>
        );
    }

    if (error !== null) {
        return (
            <main className="flex min-h-screen items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-error">{error.message}</p>

                    <button
                        type="button"
                        onClick={() => void refreshProfileStatus()}
                        className="mt-4 rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    return children;
}