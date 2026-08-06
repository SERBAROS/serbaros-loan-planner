import { Box, Grid } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { AmortizationRow, AnnualBalance } from '../../domain/entities/loan';
import { money, dateEs } from '../format';

interface AnnualInterestCardsProps {
  saldosAnuales: AnnualBalance[];
  tabla: AmortizationRow[];
  moneda: string;
}

/** Franjas de degradado sutiles, derivadas de los colores semánticos ya
 * existentes en el tema (brass/gold/capital/interest) — se van rotando por
 * tarjeta para que sean fáciles de distinguir de un vistazo, sin salirse de
 * la paleta de marca. */
const CARD_ACCENTS = ['var(--brass)', 'var(--gold)', 'var(--capital)', 'var(--interest)'];

function cardBackground(accent: string) {
  return `linear-gradient(135deg, color-mix(in srgb, ${accent} 16%, var(--surface)), var(--surface))`;
}

/** Sparkline real (no decorativo): el interés mes a mes dentro de ese año
 * específico, tomado directo de la tabla de amortización — muestra la
 * curva real de cómo baja el interés (o los saltos si hubo abonos). */
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const w = 92;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - 3 - ((v - min) / range) * (h - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AnnualInterestCards({ saldosAnuales, tabla, moneda }: AnnualInterestCardsProps) {
  if (saldosAnuales.length === 0) return null;

  return (
    <div>
      <div className="ledger-ribbon-label" style={{ marginBottom: 12 }}>
        Interés acumulado por año (cada 12 cuotas)
      </div>
      <Grid container spacing={2} sx={{ marginBottom: '32px' }}>
        {saldosAnuales.map((s, idx) => {
          const previo = idx > 0 ? saldosAnuales[idx - 1].interesAcumulado : null;
          const pctChange = previo && previo > 0 ? ((s.interesAcumulado - previo) / previo) * 100 : null;
          const yearRows = tabla.slice(idx * 12, idx * 12 + 12);
          const sparkValues = yearRows.map((r) => r.interes);
          const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];

          return (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.cuota}>
              <Box
                sx={{
                  background: cardBackground(accent),
                  border: '1px solid var(--border-soft)',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <TrendingUpIcon sx={{ color: accent, fontSize: 26, opacity: 0.85 }} />
                  {pctChange !== null && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: accent,
                      }}
                    >
                      {pctChange >= 0 ? <ArrowUpwardIcon sx={{ fontSize: 12 }} /> : <ArrowDownwardIcon sx={{ fontSize: 12 }} />}
                      {Math.abs(pctChange).toFixed(1)}%
                    </Box>
                  )}
                </Box>

                <div className="stat-label" style={{ marginBottom: 4 }}>
                  Año {idx + 1} · {dateEs(s.fecha)}
                </div>
                <div className="stat-value mono" style={{ fontSize: 21, marginBottom: 14 }}>
                  {money(s.interesAcumulado, moneda)}
                </div>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Sparkline values={sparkValues} color={accent} />
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
