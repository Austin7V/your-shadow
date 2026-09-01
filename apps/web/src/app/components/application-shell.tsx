"use client";

import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useSWRConfig } from "swr";
import { ApplicationNavigation } from "@/app/components/application-navigation";
import { ShadowOrb } from "@/app/components/shadow/shadow-orb";
import { ThemeMenu } from "@/app/components/theme/theme-switcher";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getAuthErrorMessage, logoutUser } from "@/lib/api/auth-api";

type ApplicationShellProps = {
  children: ReactNode;
};

function BrandMark() {
  return <ShadowOrb state="idle" size="compact" />;
}

function BrandLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      aria-label="Your Shadow Today"
      className="inline-flex min-h-11 items-center gap-3 rounded-control font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <BrandMark />
      {compact ? null : <span>Your Shadow</span>}
    </Link>
  );
}

export function ApplicationShell({ children }: ApplicationShellProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { user } = useCurrentUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const email = user?.email ?? "Your account";
  const avatarLabel = email.slice(0, 1).toUpperCase() || "Y";

  const handleSignOut = async (): Promise<void> => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    setSignOutError(null);

    try {
      await logoutUser();
      await mutate(
        (key) => typeof key === "string" && key.startsWith("/api/"),
        undefined,
        { revalidate: false },
      );

      router.replace("/login");
      router.refresh();
    } catch (error: unknown) {
      setSignOutError(getAuthErrorMessage(error));
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-20 flex-col border-r border-border bg-surface px-2 py-4 md:flex xl:hidden">
        <div className="flex justify-center">
          <BrandLink compact />
        </div>

        <div className="mt-6 flex-1">
          <ApplicationNavigation variant="rail" />
        </div>

        <button
          type="button"
          aria-label={isSigningOut ? "Signing out" : "Sign out"}
          title="Sign out"
          disabled={isSigningOut}
          onClick={() => void handleSignOut()}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-control text-muted-foreground transition-colors duration-control hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"
        >
          <LogOut aria-hidden="true" className="size-5" strokeWidth={2} />
        </button>
      </aside>

      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col border-r border-border bg-surface px-5 py-6 xl:flex">
        <BrandLink />

        <div className="mt-8 flex-1">
          <ApplicationNavigation variant="sidebar" />
        </div>

        <div className="border-t border-border pt-4">
          <p className="truncate px-3 text-sm font-medium text-foreground">
            {email}
          </p>
          <button
            type="button"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            className="mt-2 inline-flex min-h-11 w-full items-center gap-3 rounded-control px-3 text-sm font-medium text-muted-foreground transition-colors duration-control hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"
          >
            <LogOut aria-hidden="true" className="size-5" strokeWidth={2} />
            <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </aside>

      <div className="min-h-screen md:pl-20 xl:pl-72">
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="mx-auto flex min-h-16 max-w-[90rem] items-center gap-2 px-4 sm:px-6 lg:px-8">
            <div className="mr-auto md:hidden">
              <Link
                href="/dashboard"
                aria-label="Your Shadow Today"
                className="inline-flex min-h-11 items-center gap-2 rounded-control font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <BrandMark />
                <span className="hidden sm:inline">Your Shadow</span>
              </Link>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-disabled="true"
                aria-label="Notifications. Coming soon."
                title="Notifications are coming soon"
                className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Bell aria-hidden="true" className="size-5" strokeWidth={2} />
              </button>

              <ThemeMenu />

              <Link
                href="/account"
                aria-label={`Open profile for ${email}`}
                title={email}
                className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm transition-[background-color,transform] duration-control hover:bg-primary-hover active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {avatarLabel}
              </Link>

              <button
                type="button"
                aria-label={isSigningOut ? "Signing out" : "Sign out"}
                title="Sign out"
                disabled={isSigningOut}
                onClick={() => void handleSignOut()}
                className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground transition-colors duration-control hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60 md:hidden"
              >
                <LogOut aria-hidden="true" className="size-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {signOutError ? (
            <p
              role="alert"
              className="border-t border-error/30 bg-error/10 px-4 py-2 text-center text-sm text-error"
            >
              {signOutError}
            </p>
          ) : null}
        </header>

        <main className="mx-auto w-full max-w-[90rem] px-4 py-8 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 md:pb-8">
          {children}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-lg md:hidden">
        <div className="mx-auto max-w-lg">
          <ApplicationNavigation variant="mobile" />
        </div>
      </div>
    </div>
  );
}
