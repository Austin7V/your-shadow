import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const themeBootstrapScript = `
(() => {
  const storageKey = "your-shadow:theme";
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
    themeColor.setAttribute("content", theme === "dark" ? "#08131B" : "#F7FAF8");
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: "Your Shadow",
    template: "%s | Your Shadow",
  },
  description: "Your personal wellness companion.",
  applicationName: "Your Shadow",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#F7FAF8" />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
