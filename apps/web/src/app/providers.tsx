"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/app/components/theme/theme-provider";
import { ThemeControlDock } from "@/app/components/theme/theme-switcher";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {children}
      <ThemeControlDock />
    </ThemeProvider>
  );
}
