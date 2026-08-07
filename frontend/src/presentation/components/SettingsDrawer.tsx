import { useState } from 'react';
import { Drawer, IconButton, Box, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { composition } from '../../infrastructure/composition-root';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CurrencySelect from './CurrencySelect';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  onDownloadTutorial: () => void;
}

export default function SettingsDrawer({ open, onClose, onDownloadTutorial }: SettingsDrawerProps) {
  const { user, updateUserPreferences } = useAuth();
  const { theme, setTheme, options } = useTheme();
  const [moneda, setMoneda] = useState(user?.monedaDefecto ?? 'COP');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveMoneda() {
    setSaving(true);
    setSaved(false);
    try {
      await composition.updatePreferenciasUseCase.execute({ temaDefecto: theme, monedaDefecto: moneda });
      updateUserPreferences(theme, moneda);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 340,
            maxWidth: '90vw',
            backgroundColor: 'var(--surface)',
            borderLeft: '1px solid var(--border-soft)',
            padding: '20px',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--paper)' }}>Configuración</Typography>
        <IconButton onClick={onClose} sx={{ color: 'var(--muted)' }} aria-label="Cerrar configuración">
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
        Tema
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={theme === opt.id ? 'btn btn-primary' : 'btn'}
            onClick={() => setTheme(opt.id)}
            style={{ width: '100%', textAlign: 'left' }}
          >
            {opt.label}
          </button>
        ))}
      </Box>
      <Typography sx={{ fontSize: 12, color: 'var(--muted)', marginBottom: '24px' }}>
        Se aplica de una vez y es lo que verás al iniciar sesión desde cualquier dispositivo.
      </Typography>

      <Divider sx={{ borderColor: 'var(--border-soft)', marginBottom: '20px' }} />

      <Typography sx={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
        Moneda por defecto
      </Typography>
      <Box sx={{ marginBottom: '10px' }}>
        <CurrencySelect value={moneda} onChange={setMoneda} />
      </Box>
      <Typography sx={{ fontSize: 12, color: 'var(--muted)', marginBottom: '14px' }}>
        Con qué moneda arranca preseleccionado el formulario al crear un préstamo nuevo.
      </Typography>
      <button className="btn btn-primary" onClick={handleSaveMoneda} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar moneda'}
      </button>

      <Divider sx={{ borderColor: 'var(--border-soft)', marginTop: '24px', marginBottom: '16px' }} />

      <button
        type="button"
        className="btn"
        onClick={onDownloadTutorial}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <HelpOutlineIcon sx={{ fontSize: 18 }} />
        Ayuda / Docs
      </button>
      <Typography sx={{ fontSize: 12, color: 'var(--muted)', marginTop: '8px', textAlign: 'center' }}>
        Descarga el tutorial de la app en PDF.
      </Typography>
    </Drawer>
  );
}
