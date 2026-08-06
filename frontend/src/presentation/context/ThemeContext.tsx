import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { composition } from '../../infrastructure/composition-root';
import { useAuth } from './AuthContext';

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

function isThemeId(v: unknown): v is ThemeId {
  return v === 'azul' || v === 'oscuro' || v === 'claro';
}

function loadLocalTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isThemeId(stored)) return stored;
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

/**
 * El tema es una preferencia de CUENTA (viaja entre dispositivos), no solo
 * del navegador. Con sesión activa, se sincroniza contra
 * `user.temaDefecto` (que ya viaja en el login/registro, sin pedir de
 * nuevo al backend) y cualquier cambio manual se guarda tanto en
 * localStorage (para que no haya parpadeo en la próxima carga) como en la
 * cuenta. Sin sesión (login/registro), solo usa localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, updateUserPreferences } = useAuth();
  const [theme, setThemeState] = useState<ThemeId>(loadLocalTheme);
  const syncedForUserId = useRef<number | null>(null);

  // Al iniciar sesión (o restaurar una sesión guardada), adopta el tema de
  // la cuenta una sola vez por usuario — si luego el usuario lo cambia a
  // mano en este mismo dispositivo, esa elección manual no se vuelve a
  // pisar mientras siga siendo el mismo usuario.
  useEffect(() => {
    if (isAuthenticated && user && syncedForUserId.current !== user.id) {
      syncedForUserId.current = user.id;
      setThemeState(user.temaDefecto);
    }
    if (!isAuthenticated) {
      syncedForUserId.current = null;
    }
  }, [isAuthenticated, user]);

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
    if (isAuthenticated && user) {
      composition.updatePreferenciasUseCase
        .execute({ temaDefecto: next, monedaDefecto: user.monedaDefecto })
        .then(() => updateUserPreferences(next, user.monedaDefecto))
        .catch(() => {
          // Falla silenciosa: el tema ya cambió visualmente y quedó en
          // localStorage: no interrumpimos al usuario por un guardado de
          // preferencia que se puede reintentar la próxima vez que cambie algo.
        });
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme, options: THEME_OPTIONS }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}
