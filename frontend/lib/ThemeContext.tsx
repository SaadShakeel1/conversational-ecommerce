"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { THEMES, ThemeId, ThemeDefinition, DEFAULT_THEME } from "./theme";

interface ThemeContextValue {
  theme: ThemeDefinition;
  setTheme: (id: ThemeId) => void;
  themes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "convoshop-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);

  /* Apply CSS variables to <html> and persist choice */
  const applyTheme = useCallback((id: ThemeId) => {
    const def = THEMES.find((t) => t.id === id) ?? THEMES[0];
    const root = document.documentElement;

    /* Set data-theme for any CSS selector hooks */
    root.setAttribute("data-theme", id);

    /* Inject all CSS custom properties */
    Object.entries(def.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });

    /* Persist */
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* silently ignore in SSR / private mode */
    }
  }, []);

  /* Bootstrap: read stored preference on mount */
  useEffect(() => {
    let stored: ThemeId = DEFAULT_THEME;
    try {
      const raw = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      if (raw && THEMES.some((t) => t.id === raw)) stored = raw;
    } catch {
      /* ignore */
    }
    setThemeId(stored);
    applyTheme(stored);
  }, [applyTheme]);

  const setTheme = useCallback(
    (id: ThemeId) => {
      setThemeId(id);
      applyTheme(id);
    },
    [applyTheme]
  );

  const theme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
