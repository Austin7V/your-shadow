import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import {
  LIGHT_THEME_COLOR,
  THEME_BOOTSTRAP_SCRIPT,
} from "@/app/components/theme/theme-bootstrap";
import { Providers } from "./providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

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
        <meta name="theme-color" content={LIGHT_THEME_COLOR} />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="min-h-full font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
