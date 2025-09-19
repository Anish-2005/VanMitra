"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      if (typeof window !== "undefined") {
        // Prefer the `data-theme` attribute set by the beforeInteractive script in layout
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light' || attr === 'dark') return attr as Theme;

        const stored = localStorage.getItem("theme");
        if (stored === "light" || stored === "dark") return stored as Theme;
        // respect system preference if not set
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return "light";
      }
    } catch (e) {}
    // default to dark to preserve current app look
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;

    const lightVars: Record<string, string> = {
      '--background': '#f6fbf7',
      '--foreground': '#0f2f1f',
      '--card': '#ffffff',
      '--card-foreground': '#0f2f1f',
      '--popover': '#ffffff',
      '--popover-foreground': '#0f2f1f',
      '--primary': '#3fa25b',
      '--primary-foreground': '#ffffff',
      '--secondary': '#e6f6ec',
      '--secondary-foreground': '#0f2f1f',
      '--muted': '#6b7280',
      '--muted-foreground': '#4b5563',
      '--accent': '#16a34a',
      '--accent-foreground': '#ffffff',
      '--destructive': '#ef4444',
      '--border': 'rgba(15,23,21,0.06)',
      '--input': 'rgba(15,23,21,0.04)',
      '--ring': 'rgba(63,162,91,0.18)',
      '--chart-1': '#16a34a',
      '--chart-2': '#059669',
      '--chart-3': '#10b981',
      '--chart-4': '#34d399',
      '--chart-5': '#a7f3d0',
      '--sidebar': '#ffffff',
      '--sidebar-foreground': '#0f2f1f',
      '--sidebar-primary': '#3fa25b',
      '--sidebar-primary-foreground': '#ffffff',
      '--sidebar-accent': '#16a34a',
      '--sidebar-accent-foreground': '#ffffff',
      '--sidebar-border': 'rgba(15,23,21,0.06)',
      '--sidebar-ring': 'rgba(63,162,91,0.18)'
    };

    const darkVars: Record<string, string> = {
      '--background': 'oklch(0.145 0 0)',
      '--foreground': 'oklch(0.985 0 0)',
      '--card': 'oklch(0.205 0 0)',
      '--card-foreground': 'oklch(0.985 0 0)',
      '--popover': 'oklch(0.205 0 0)',
      '--popover-foreground': 'oklch(0.985 0 0)',
      '--primary': 'oklch(0.922 0 0)',
      '--primary-foreground': 'oklch(0.205 0 0)',
      '--secondary': 'oklch(0.269 0 0)',
      '--secondary-foreground': 'oklch(0.985 0 0)',
      '--muted': 'oklch(0.269 0 0)',
      '--muted-foreground': 'oklch(0.708 0 0)',
      '--accent': 'oklch(0.269 0 0)',
      '--accent-foreground': 'oklch(0.985 0 0)',
      '--destructive': 'oklch(0.704 0.191 22.216)',
      '--border': 'oklch(1 0 0 / 10%)',
      '--input': 'oklch(1 0 0 / 15%)',
      '--ring': 'oklch(0.556 0 0)',
      '--chart-1': 'oklch(0.488 0.243 264.376)',
      '--chart-2': 'oklch(0.696 0.17 162.48)',
      '--chart-3': 'oklch(0.769 0.188 70.08)',
      '--chart-4': 'oklch(0.627 0.265 303.9)',
      '--chart-5': 'oklch(0.645 0.246 16.439)',
      '--sidebar': 'oklch(0.205 0 0)',
      '--sidebar-foreground': 'oklch(0.985 0 0)',
      '--sidebar-primary': 'oklch(0.488 0.243 264.376)',
      '--sidebar-primary-foreground': 'oklch(0.985 0 0)',
      '--sidebar-accent': 'oklch(0.269 0 0)',
      '--sidebar-accent-foreground': 'oklch(0.985 0 0)',
      '--sidebar-border': 'oklch(1 0 0 / 10%)',
      '--sidebar-ring': 'oklch(0.556 0 0)'
    };

    const applyVars = (vars: Record<string, string>) => {
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
    };

    if (theme === 'light') {
      applyVars(lightVars);
    } else {
      applyVars(darkVars);
    }

    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((s) => (s === "dark" ? "light" : "dark"));

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
