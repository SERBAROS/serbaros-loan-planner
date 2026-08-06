import { useRef, useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { AmortizationRow, AnnualBalance } from '../../domain/entities/loan';
import { money, dateEs } from '../format';

interface AnnualInterestCardsProps {
  saldosAnuales: AnnualBalance[];
  tabla: AmortizationRow[];
  moneda: string;
}

const CARD_WIDTH = 236;
const CARD_GAP = 16;

/** Escala de "calor" de 3 puntos (verde → dorado → rojo/naranja), calculada
 * sobre los mismos colores semánticos del tema — así el color de cada
 * tarjeta comunica directamente qué tan alto fue el interés ESE año
 * respecto a los demás, en vez de solo rotar colores sin significado. */
function heatColor(intensity: number): string {
  const t = Math.max(0, Math.min(1, intensity));
  if (t <= 0.5) {
    const pct = Math.round((1 - t * 2) * 100);
    return `color-mix(in srgb, var(--capital) ${pct}%, var(--gold) ${100 - pct}%)`;
  }
  const pct = Math.round((1 - (t - 0.5) * 2) * 100);
  return `color-mix(in srgb, var(--gold) ${pct}%, var(--interest) ${100 - pct}%)`;
}

function cardBackground(accent: string, intensity: number) {
  // A mayor interés ese año, fondo más saturado (además del cambio de tono).
  const tintPct = 10 + intensity * 22;
  return `linear-gradient(135deg, color-mix(in srgb, ${accent} ${tintPct}%, var(--surface)), var(--surface))`;
}

/** Sparkline real (no decorativo): el interés mes a mes dentro de ese año
 * específico, tomado directo de la tabla de amortización. */
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
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  if (saldosAnuales.length === 0) return null;

  // Interés PAGADO ese año específico (no acumulado) — es la magnitud que
  // realmente varía de año a año y la que tiene sentido "pintar" por calor.
  const yearlyInterest = saldosAnuales.map((_, idx) => {
    const rows = tabla.slice(idx * 12, idx * 12 + 12);
    return rows.reduce((sum, r) => sum + r.interes, 0);
  });
  const minYearly = Math.min(...yearlyInterest);
  const maxYearly = Math.max(...yearlyInterest);
  const yearlyRange = maxYearly - minYearly || 1;

  const dotCount = Math.min(saldosAnuales.length, Math.max(1, Math.ceil(saldosAnuales.length / 4)));

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (CARD_WIDTH + CARD_GAP) * 3, behavior: 'smooth' });
  }

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth || 1;
    const progress = el.scrollLeft / maxScroll;
    setActiveDot(Math.min(dotCount - 1, Math.round(progress * (dotCount - 1))));
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saldosAnuales.length]);

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div className="ledger-ribbon-label" style={{ marginBottom: 0 }}>
          Interés acumulado por año (cada 12 cuotas)
        </div>
        {saldosAnuales.length > 4 && (
          <Box sx={{ display: 'flex', gap: '4px' }}>
            <IconButton size="small" onClick={() => scrollByCards(-1)} aria-label="Anteriores" sx={{ color: 'var(--muted)' }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => scrollByCards(1)} aria-label="Siguientes" sx={{ color: 'var(--muted)' }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box
        ref={trackRef}
        sx={{
          display: 'flex',
          gap: `${CARD_GAP}px`,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {saldosAnuales.map((s, idx) => {
          const previo = idx > 0 ? saldosAnuales[idx - 1].interesAcumulado : null;
          const pctChange = previo && previo > 0 ? ((s.interesAcumulado - previo) / previo) * 100 : null;
          const yearRows = tabla.slice(idx * 12, idx * 12 + 12);
          const sparkValues = yearRows.map((r) => r.interes);
          const intensity = (yearlyInterest[idx] - minYearly) / yearlyRange;
          const accent = heatColor(intensity);

          return (
            <Box
              key={s.cuota}
              sx={{
                flex: `0 0 ${CARD_WIDTH}px`,
                width: `${CARD_WIDTH}px`,
                scrollSnapAlign: 'start',
                background: cardBackground(accent, intensity),
                border: '1px solid var(--border-soft)',
                borderRadius: '10px',
                padding: '16px 18px',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <TrendingUpIcon sx={{ color: accent, fontSize: 26, opacity: 0.9 }} />
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
          );
        })}
      </Box>

      {saldosAnuales.length > 4 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px', marginBottom: '20px' }}>
          {Array.from({ length: dotCount }).map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: i === activeDot ? 'var(--brass)' : 'var(--border)',
                transition: 'background-color 0.15s ease',
              }}
            />
          ))}
        </Box>
      )}
      {saldosAnuales.length <= 4 && <Box sx={{ marginBottom: '32px' }} />}
    </div>
  );
}
