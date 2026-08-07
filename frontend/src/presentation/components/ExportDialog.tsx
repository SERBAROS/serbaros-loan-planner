import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Checkbox, FormControlLabel, Box, Typography, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SimulationListItem } from '../../domain/entities/loan';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  format: 'excel' | 'pdf' | null;
  simulations: SimulationListItem[];
  onConfirm: (format: 'excel' | 'pdf', options: { simulacionIds?: number[]; incluirTabla: boolean }) => void;
  loading: boolean;
}

export default function ExportDialog({ open, onClose, format, simulations, onConfirm, loading }: ExportDialogProps) {
  const [incluirTabla, setIncluirTabla] = useState(true);
  const [simsSeleccionadas, setSimsSeleccionadas] = useState<Set<number>>(() => new Set(simulations.map((s) => s.id)));

  function toggleSim(id: number) {
    setSimsSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    if (!format) return;
    onConfirm(format, {
      incluirTabla,
      simulacionIds: simulations.length > 0 ? Array.from(simsSeleccionadas) : undefined,
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { backgroundColor: 'var(--surface)', border: '1px solid var(--border-soft)' } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>
        Exportar a {format === 'excel' ? 'Excel' : 'PDF'}
        <IconButton onClick={onClose} sx={{ color: 'var(--muted)' }} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'var(--border-soft)' }}>
        <FormControlLabel
          control={<Checkbox checked={incluirTabla} onChange={(e) => setIncluirTabla(e.target.checked)} />}
          label={
            <Box>
              <Typography sx={{ fontSize: 14, color: 'var(--paper)' }}>Incluir tabla de amortización completa</Typography>
              <Typography sx={{ fontSize: 12, color: 'var(--muted)' }}>
                Si lo desmarcas, el archivo solo trae el resumen y la comparación de planes.
              </Typography>
            </Box>
          }
        />

        {simulations.length > 0 && (
          <>
            <Divider sx={{ borderColor: 'var(--border-soft)', marginY: '16px' }} />
            <Typography sx={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
              Simulaciones a incluir
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {simulations.map((s) => (
                <FormControlLabel
                  key={s.id}
                  control={<Checkbox checked={simsSeleccionadas.has(s.id)} onChange={() => toggleSim(s.id)} size="small" />}
                  label={<Typography sx={{ fontSize: 13.5, color: 'var(--paper)' }}>{s.nombre}</Typography>}
                />
              ))}
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: '16px 24px' }}>
        <button className="btn btn-ghost" onClick={onClose} type="button">
          Cancelar
        </button>
        <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Generando…' : 'Exportar'}
        </button>
      </DialogActions>
    </Dialog>
  );
}
