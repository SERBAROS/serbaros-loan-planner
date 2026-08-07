import { Dialog, DialogTitle, DialogContent, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { money, percent } from '../format';

interface CuotaInfoDialogProps {
  open: boolean;
  onClose: () => void;
  monto?: number;
  tasaEfectivaAnual?: number;
  tasaMensual?: number;
  numeroCuotas?: number;
  cuotaTeorica?: number;
  moneda: string;
}

export default function CuotaInfoDialog({
  open,
  onClose,
  monto,
  tasaEfectivaAnual,
  tasaMensual,
  numeroCuotas,
  cuotaTeorica,
  moneda,
}: CuotaInfoDialogProps) {
  const tieneEjemplo = monto && tasaEfectivaAnual !== undefined && tasaMensual !== undefined && numeroCuotas && cuotaTeorica;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { backgroundColor: 'var(--surface)', border: '1px solid var(--border-soft)' } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>
        Cómo se calcula la cuota
        <IconButton onClick={onClose} sx={{ color: 'var(--muted)' }} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'var(--border-soft)' }}>
        <Typography sx={{ fontSize: 13.5, color: 'var(--paper-dim)', lineHeight: 1.6, marginBottom: '16px' }}>
          La <b>TEA</b> (Tasa Efectiva Anual) es el costo real de un crédito en un año, considerando que los
          intereses se van sumando al saldo mes a mes (interés compuesto). Por eso no se puede dividir entre 12
          directamente — hay que convertirla primero a una tasa mensual equivalente.
        </Typography>

        <Box sx={{ backgroundColor: 'var(--surface-raised)', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px' }}>
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--brass)' }}>
            Tasa mensual = (1 + TEA) ^ (1/12) − 1
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 13.5, color: 'var(--paper-dim)', lineHeight: 1.6, marginBottom: '16px' }}>
          Con esa tasa mensual, el monto del préstamo y el número de cuotas, se calcula la cuota fija que
          amortiza todo el crédito (fórmula PMT — la misma que usa cualquier hoja de cálculo financiera):
        </Typography>

        <Box sx={{ backgroundColor: 'var(--surface-raised)', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px' }}>
          <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brass)' }}>
            Cuota = Monto × tasa mensual × (1 + tasa mensual)^N / [(1 + tasa mensual)^N − 1]
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 13.5, color: 'var(--paper-dim)', lineHeight: 1.6, marginBottom: tieneEjemplo ? '16px' : 0 }}>
          En cada cuota, primero se calcula el interés sobre el saldo pendiente (saldo × tasa mensual), y el
          resto abona a capital. Por eso al principio del crédito casi toda la cuota es interés, y hacia el
          final casi toda es capital.
        </Typography>

        {tieneEjemplo && (
          <Box sx={{ border: '1px solid var(--brass)', borderRadius: '8px', padding: '14px 16px' }}>
            <Typography sx={{ fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--brass)', marginBottom: '8px' }}>
              Con tus datos actuales
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'var(--paper)', lineHeight: 1.9 }}>
              TEA {percent(tasaEfectivaAnual!)} → tasa mensual {percent(tasaMensual!)}
              <br />
              {money(monto!, moneda)} a {numeroCuotas} cuotas
              <br />
              Cuota calculada: <b>{money(cuotaTeorica!, moneda)}</b>
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
