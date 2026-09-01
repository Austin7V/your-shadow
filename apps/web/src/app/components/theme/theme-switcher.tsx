"use client";

import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";
import {
  useTheme,
  type ThemePreference,
} from "@/app/components/theme/theme-provider";

type ThemeOption = {
  value: ThemePreference;
  label: string;
  icon: LucideIcon;
};

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
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

export function ThemeControlDock() {
  const { preference, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <div className="fixed right-4 bottom-20 z-[60] flex flex-col items-end gap-2 xl:bottom-4">
      {isOpen ? (
        <div
          id={panelId}
          className="w-[min(20rem,calc(100vw-2rem))] rounded-card border border-border bg-surface-raised p-3 shadow-lg"
        >
          <p className="mb-2 px-1 text-sm font-medium text-foreground">
            Appearance
          </p>
          <ThemeSwitcher />
        </div>
      ) : null}

      <button
        type="button"
        aria-label={`Change theme. Current preference: ${preference}.`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        title="Change theme"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface-raised text-foreground shadow-md transition-[color,background-color,border-color,transform] duration-control hover:bg-surface-muted active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <CurrentIcon aria-hidden="true" className="size-5" strokeWidth={2} />
      </button>
    </div>
  );
}
