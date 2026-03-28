"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  mounted: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default "dark" matches :root CSS — no mismatch on server render
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved preference after mount (client-only)
    const saved = localStorage.getItem("novadrive-theme") as Theme | null;
    const resolved: Theme = saved === "light" ? "light" : "dark";
    setThemeState(resolved);

    // Apply class (blocking script already did this, but sync state)
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(resolved);

    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("novadrive-theme", t);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
