import { createContext, ReactNode, useContext, useState } from 'react';

type LegalDialogType = 'terminos' | 'privacidad' | null;

interface LegalDialogsContextValue {
  active: LegalDialogType;
  openTerms: () => void;
  openPrivacy: () => void;
  close: () => void;
}

const LegalDialogsContext = createContext<LegalDialogsContextValue | null>(null);

export function LegalDialogsProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<LegalDialogType>(null);

  return (
    <LegalDialogsContext.Provider
      value={{
        active,
        openTerms: () => setActive('terminos'),
        openPrivacy: () => setActive('privacidad'),
        close: () => setActive(null),
      }}
    >
      {children}
    </LegalDialogsContext.Provider>
  );
}

export function useLegalDialogs(): LegalDialogsContextValue {
  const ctx = useContext(LegalDialogsContext);
  if (!ctx) throw new Error('useLegalDialogs debe usarse dentro de LegalDialogsProvider');
  return ctx;
}
