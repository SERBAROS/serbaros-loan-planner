import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type ThemeId = 'azul' | 'oscuro' | 'claro';

export interface ThemeOption {
  id: ThemeId;
  label: string;
  /** true si el logo "para fondo oscuro" (blanco) se ve mejor sobre este tema */
  useLightLogo: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'azul', label: 'Azul Serbaros', useLightLogo: true },
  { id: 'oscuro', label: 'Oscuro tech', useLightLogo: true },
  { id: 'claro', label: 'Claro corporate', useLightLogo: false },
];

const STORAGE_KEY = 'serbaros_loan_planner_theme';
const DEFAULT_THEME: ThemeId = 'oscuro';

function loadTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'azul' || stored === 'oscuro' || stored === 'claro') return stored;
  } catch {
    // localStorage no disponible
  }
  return DEFAULT_THEME;
}

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  options: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(loadTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // localStorage no disponible
    }
  }, [theme]);

  function setTheme(next: ThemeId) {
    setThemeState(next);
  }

  return <ThemeContext.Provider value={{ theme, setTheme, options: THEME_OPTIONS }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
