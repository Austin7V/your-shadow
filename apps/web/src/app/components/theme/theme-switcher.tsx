"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  useTheme,
  type ThemePreference,
} from "@/app/components/theme/theme-provider";

type ThemeOption = {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
};

type ThemeMenuProps = {
  panelPosition?: "above" | "below";
};

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const applicationRoutes = [
  "/dashboard",
  "/meals",
  "/workout",
  "/history",
  "/account",
];

export function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme preference"
      className="grid grid-cols-3 gap-1 rounded-compact border border-border bg-surface-muted p-1"
    >
      {themeOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setPreference(option.value)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-compact px-3 text-sm font-medium transition-colors duration-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              isSelected
                ? "bg-surface-raised text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={2} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ThemeMenu({
  panelPosition = "below",
}: ThemeMenuProps) {
  const { preference, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") {
        return;
      }

      setIsOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Change theme. Current preference: ${preference}.`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        title="Change theme"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground shadow-sm transition-[color,background-color,border-color,transform] duration-control hover:bg-surface-muted active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <CurrentIcon aria-hidden="true" className="size-5" strokeWidth={2} />
      </button>

      {isOpen ? (
        <div
          id={panelId}
          className={`fixed inset-x-4 z-[70] w-auto rounded-card border border-border bg-surface-raised p-3 shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:w-80 ${
            panelPosition === "above"
              ? "bottom-[4.5rem] sm:bottom-[calc(100%+0.5rem)]"
              : "top-[4.5rem] sm:top-[calc(100%+0.5rem)]"
          }`}
        >
          <p className="mb-2 px-1 text-sm font-medium text-foreground">
            Appearance
          </p>
          <ThemeSwitcher />
        </div>
      ) : null}
    </div>
  );
}

export function ThemeControlDock() {
  const pathname = usePathname();
  const isApplicationRoute = applicationRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isApplicationRoute) {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-4 z-[60]">
      <ThemeMenu panelPosition="above" />
    </div>
  );
}
