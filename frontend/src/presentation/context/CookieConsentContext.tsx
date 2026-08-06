import { createContext, ReactNode, useContext, useState } from 'react';

export interface CookieConsent {
  necesarias: true; // siempre activas, no se pueden desactivar
  analiticas: boolean;
  marketing: boolean;
  /** ISO date de cuándo se registró la decisión — para poder demostrar consentimiento si se audita. */
  timestamp: string;
  /** Versión de esta política de cookies — si cambia sustancialmente, se debe volver a pedir consentimiento. */
  version: number;
}

const STORAGE_KEY = 'serbaros_loan_planner_cookie_consent';
const CURRENT_VERSION = 1;

function loadConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed.version !== CURRENT_VERSION) return null; // política cambió, se vuelve a pedir
    return parsed;
  } catch {
    return null;
  }
}

interface CookieConsentContextValue {
  consent: CookieConsent | null;
  /** true si el usuario aún no ha tomado una decisión (el banner debe mostrarse). */
  needsDecision: boolean;
  /** true si el panel de preferencias detallado está abierto. */
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (prefs: { analiticas: boolean; marketing: boolean }) => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(loadConsent);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  function persist(next: CookieConsent) {
    setConsent(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage no disponible — la sesión seguirá funcionando, solo no se recordará la elección
    }
  }

  function acceptAll() {
    persist({ necesarias: true, analiticas: true, marketing: true, timestamp: new Date().toISOString(), version: CURRENT_VERSION });
    setPreferencesOpen(false);
  }

  function rejectNonEssential() {
    persist({ necesarias: true, analiticas: false, marketing: false, timestamp: new Date().toISOString(), version: CURRENT_VERSION });
    setPreferencesOpen(false);
  }

  function savePreferences(prefs: { analiticas: boolean; marketing: boolean }) {
    persist({ necesarias: true, ...prefs, timestamp: new Date().toISOString(), version: CURRENT_VERSION });
    setPreferencesOpen(false);
  }

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        needsDecision: consent === null,
        preferencesOpen,
        openPreferences: () => setPreferencesOpen(true),
        closePreferences: () => setPreferencesOpen(false),
        acceptAll,
        rejectNonEssential,
        savePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContextValue {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error('useCookieConsent debe usarse dentro de CookieConsentProvider');
  return ctx;
}

/**
 * Ejemplo de uso para cuando se integre un script de analítica/publicidad
 * real (Google Analytics, AdSense, etc.):
 *
 *   const { consent } = useCookieConsent();
 *   useEffect(() => {
 *     if (consent?.analiticas) {
 *       // cargar aquí el script de analítica
 *     }
 *   }, [consent?.analiticas]);
 *
 * Así ningún script de terceros se carga antes de que el usuario decida.
 */
