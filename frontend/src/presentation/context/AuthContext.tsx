import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { composition } from '../../infrastructure/composition-root';
import { AuthUser, Session } from '../../domain/entities/session';

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre?: string) => Promise<void>;
  logout: () => void;
  updateUserPreferences: (temaDefecto: AuthUser['temaDefecto'], monedaDefecto: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => composition.sessionStorage.load());

  const login = useCallback(async (email: string, password: string) => {
    const result = await composition.loginUseCase.execute(email, password);
    setSession(result);
  }, []);

  const register = useCallback(async (email: string, password: string, nombre?: string) => {
    const result = await composition.registerUseCase.execute(email, password, nombre);
    setSession(result);
  }, []);

  const logout = useCallback(() => {
    composition.logoutUseCase.execute();
    setSession(null);
  }, []);

  // Refleja localmente (y persiste en la sesión guardada) un cambio de
  // preferencias ya confirmado por el backend — evita tener que recargar
  // la sesión completa solo para que el resto de la app vea el nuevo valor.
  const updateUserPreferences = useCallback((temaDefecto: AuthUser['temaDefecto'], monedaDefecto: string) => {
    setSession((current) => {
      if (!current) return current;
      const next: Session = { ...current, user: { ...current.user, temaDefecto, monedaDefecto } };
      composition.sessionStorage.save(next);
      return next;
    });
  }, []);

  const value: AuthContextValue = {
    token: session?.token ?? null,
    user: session?.user ?? null,
    isAuthenticated: !!session?.token,
    login,
    register,
    logout,
    updateUserPreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
