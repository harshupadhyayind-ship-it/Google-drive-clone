"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/lib/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
