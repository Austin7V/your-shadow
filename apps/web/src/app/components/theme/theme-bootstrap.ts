export const THEME_STORAGE_KEY = "your-shadow:theme";
export const LIGHT_THEME_COLOR = "#F7FAF8";
export const DARK_THEME_COLOR = "#08131B";

export const THEME_BOOTSTRAP_SCRIPT = `
(() => {
  const storageKey = "${THEME_STORAGE_KEY}";
  const allowedPreferences = new Set(["light", "dark", "system"]);
  const root = document.documentElement;
  let preference = "system";

  try {
    const storedPreference = window.localStorage.getItem(storageKey);

    if (allowedPreferences.has(storedPreference)) {
      preference = storedPreference;
    }
  } catch {}

  const theme = preference === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;

  root.dataset.theme = theme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');

  if (themeColor) {
    themeColor.setAttribute(
      "content",
      theme === "dark" ? "${DARK_THEME_COLOR}" : "${LIGHT_THEME_COLOR}",
    );
  }
})();
`;
