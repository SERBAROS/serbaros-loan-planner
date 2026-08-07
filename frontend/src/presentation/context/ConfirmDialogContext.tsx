import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...options, resolve });
    });
  }, []);

  function close(result: boolean) {
    pending?.resolve(result);
    setPending(null);
  }

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Dialog
        open={pending !== null}
        onClose={() => close(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { backgroundColor: 'var(--surface)', border: '1px solid var(--border-soft)' } } }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>{pending?.title ?? 'Confirmar'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14, color: 'var(--paper-dim)', lineHeight: 1.6 }}>{pending?.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <button className="btn btn-ghost" onClick={() => close(false)} type="button">
            {pending?.cancelLabel ?? 'Cancelar'}
          </button>
          <button
            className={pending?.danger ? 'btn btn-danger' : 'btn btn-primary'}
            onClick={() => close(true)}
            type="button"
            autoFocus
          >
            {pending?.confirmLabel ?? 'Confirmar'}
          </button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirm(): ConfirmDialogContextValue['confirm'] {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmDialogProvider');
  return ctx.confirm;
}
