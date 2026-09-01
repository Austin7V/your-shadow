"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

type ThemeSnapshot = `${ThemePreference}:${ResolvedTheme}`;

export const THEME_STORAGE_KEY = "your-shadow:theme";

const THEME_CHANGE_EVENT = "your-shadow:theme-change";
const THEME_TRANSITION_DURATION_MS = 180;
const LIGHT_THEME_COLOR = "#F7FAF8";
const DARK_THEME_COLOR = "#08131B";
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";
const SERVER_THEME_SNAPSHOT: ThemeSnapshot = "system:light";

const ThemeContext = createContext<ThemeContextValue | null>(null);

let transitionTimeout: number | null = null;

const isThemePreference = (value: unknown): value is ThemePreference => {
  return value === "light" || value === "dark" || value === "system";
};

const isResolvedTheme = (value: unknown): value is ResolvedTheme => {
  return value === "light" || value === "dark";
};

const getSystemTheme = (): ResolvedTheme => {
  return window.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
};

const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  return preference === "system" ? getSystemTheme() : preference;
};

const updateThemeColor = (theme: ResolvedTheme): void => {
  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );

  themeColor?.setAttribute(
    "content",
    theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
  );
};

const readThemePreference = (): ThemePreference => {
  const bootstrappedPreference =
    document.documentElement.dataset.themePreference;

  if (isThemePreference(bootstrappedPreference)) {
    return bootstrappedPreference;
  }

  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);

    return isThemePreference(storedPreference) ? storedPreference : "system";
  } catch {
    return "system";
  }
};

const applyPreference = (
  preference: ThemePreference,
  animate: boolean,
): void => {
  const root = document.documentElement;
  const nextTheme = resolveTheme(preference);

  if (transitionTimeout !== null) {
    window.clearTimeout(transitionTimeout);
  }

  if (animate && root.dataset.theme !== nextTheme) {
    root.dataset.themeTransition = "true";
    transitionTimeout = window.setTimeout(() => {
      delete root.dataset.themeTransition;
      transitionTimeout = null;
    }, THEME_TRANSITION_DURATION_MS);
  }

  root.dataset.theme = nextTheme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = nextTheme;
  updateThemeColor(nextTheme);
};

const getThemeSnapshot = (): ThemeSnapshot => {
  const root = document.documentElement;
  const preference = readThemePreference();
  const resolvedTheme = isResolvedTheme(root.dataset.theme)
    ? root.dataset.theme
    : resolveTheme(preference);

  return `${preference}:${resolvedTheme}`;
};

const subscribeToTheme = (onStoreChange: () => void): (() => void) => {
  const systemTheme = window.matchMedia(DARK_MODE_QUERY);

  const handleThemeChange = (): void => {
    onStoreChange();
  };

  const handleSystemThemeChange = (): void => {
    if (readThemePreference() !== "system") {
      return;
    }

    applyPreference("system", true);
    onStoreChange();
  };

  const handleStorageChange = (event: StorageEvent): void => {
    if (event.key !== THEME_STORAGE_KEY) {
      return;
    }

    const preference = isThemePreference(event.newValue)
      ? event.newValue
      : "system";

    applyPreference(preference, true);
    onStoreChange();
  };

  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  window.addEventListener("storage", handleStorageChange);
  systemTheme.addEventListener("change", handleSystemThemeChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleStorageChange);
    systemTheme.removeEventListener("change", handleSystemThemeChange);
  };
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const snapshot = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => SERVER_THEME_SNAPSHOT,
  );
  const [preference, resolvedTheme] = snapshot.split(":") as [
    ThemePreference,
    ResolvedTheme,
  ];

  const setPreference = useCallback(
    (nextPreference: ThemePreference): void => {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextPreference);
      } catch {
        // The selected theme still applies when storage is unavailable.
      }

      applyPreference(nextPreference, true);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    },
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
