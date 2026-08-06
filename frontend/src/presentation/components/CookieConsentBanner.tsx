import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel, Typography } from '@mui/material';
import { useCookieConsent } from '../context/CookieConsentContext';
import { useLegalDialogs } from '../context/LegalDialogsContext';
import { useState } from 'react';

export default function CookieConsentBanner() {
  const { openPrivacy } = useLegalDialogs();
  const { needsDecision, preferencesOpen, openPreferences, closePreferences, acceptAll, rejectNonEssential, savePreferences, consent } =
    useCookieConsent();
  const [draftAnaliticas, setDraftAnaliticas] = useState(consent?.analiticas ?? false);
  const [draftMarketing, setDraftMarketing] = useState(consent?.marketing ?? false);

  if (!needsDecision && !preferencesOpen) return null;

  return (
    <>
      {needsDecision && !preferencesOpen && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border-soft)',
            padding: '18px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
          }}
        >
          <Box sx={{ flex: '1 1 320px' }}>
            <Typography sx={{ fontSize: 14, color: 'var(--paper)', lineHeight: 1.5 }}>
              Usamos almacenamiento necesario para que la app funcione (tu sesión, tus preferencias). Con tu permiso,
              también nos gustaría usar cookies opcionales de analítica y publicidad —{' '}
              <a onClick={openPrivacy} style={{ color: 'var(--brass)', cursor: 'pointer', textDecoration: 'underline' }}>
                más información aquí
              </a>
              .
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={rejectNonEssential}>
              Rechazar no esenciales
            </button>
            <button className="btn" onClick={openPreferences}>
              Personalizar
            </button>
            <button className="btn btn-primary" onClick={acceptAll}>
              Aceptar todas
            </button>
          </Box>
        </Box>
      )}

      <Dialog
        open={preferencesOpen}
        onClose={closePreferences}
        slotProps={{ paper: { sx: { backgroundColor: 'var(--surface)', border: '1px solid var(--border-soft)', minWidth: 380 } } }}
      >
        <DialogTitle sx={{ fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>Preferencias de cookies</DialogTitle>
        <DialogContent>
          <Box sx={{ marginBottom: '16px' }}>
            <FormControlLabel control={<Switch checked disabled />} label="Necesarias — siempre activas" sx={{ color: 'var(--paper)' }} />
            <Typography sx={{ fontSize: 12, color: 'var(--muted)', marginLeft: '52px', marginTop: '-6px' }}>
              Sesión, tema visual y moneda por defecto. Imprescindibles para que la app funcione.
            </Typography>
          </Box>
          <Box sx={{ marginBottom: '16px' }}>
            <FormControlLabel
              control={<Switch checked={draftAnaliticas} onChange={(e) => setDraftAnaliticas(e.target.checked)} />}
              label="Analíticas"
              sx={{ color: 'var(--paper)' }}
            />
            <Typography sx={{ fontSize: 12, color: 'var(--muted)', marginLeft: '52px', marginTop: '-6px' }}>
              Nos ayudan a entender cómo se usa la app para mejorarla. No hay ninguna activa actualmente.
            </Typography>
          </Box>
          <Box>
            <FormControlLabel
              control={<Switch checked={draftMarketing} onChange={(e) => setDraftMarketing(e.target.checked)} />}
              label="Publicidad"
              sx={{ color: 'var(--paper)' }}
            />
            <Typography sx={{ fontSize: 12, color: 'var(--muted)', marginLeft: '52px', marginTop: '-6px' }}>
              Personalización de anuncios. No hay ninguna activa actualmente.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <button className="btn btn-ghost" onClick={closePreferences}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={() => savePreferences({ analiticas: draftAnaliticas, marketing: draftMarketing })}>
            Guardar preferencias
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}
