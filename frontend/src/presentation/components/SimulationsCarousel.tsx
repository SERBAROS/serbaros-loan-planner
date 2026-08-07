import { useEffect, useRef, useState } from 'react';
import { Box, IconButton, LinearProgress } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SimulationListItem } from '../../domain/entities/loan';
import { money } from '../format';

interface SimulationsCarouselProps {
  simulations: SimulationListItem[];
  moneda: string;
  onSelect: (simId: number) => void;
  onDelete: (simId: number, nombre: string) => void;
  deletingSimId: number | null;
}

const CARD_WIDTH = 250;
const CARD_GAP = 16;

export default function SimulationsCarousel({ simulations, moneda, onSelect, onDelete, deletingSimId }: SimulationsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (CARD_WIDTH + CARD_GAP) * 2, behavior: 'smooth' });
  }

  function handleScroll() {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth || 1;
    setProgress(Math.min(100, Math.max(0, (el.scrollLeft / maxScroll) * 100)));
  }

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulations.length]);

  if (simulations.length === 0) return null;

  return (
    <Box sx={{ marginBottom: '28px' }}>
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
        {simulations.map((sim) => (
          <Box
            key={sim.id}
            onClick={() => onSelect(sim.id)}
            sx={{
              flex: `0 0 ${CARD_WIDTH}px`,
              width: `${CARD_WIDTH}px`,
              scrollSnapAlign: 'start',
              cursor: 'pointer',
            }}
          >
            <div className="stat-cell" style={{ border: '1px solid var(--border-soft)', borderRadius: 8, height: '100%' }}>
              <div className="stat-label">{sim.nombre}</div>
              {sim.resumen && sim.comparacion ? (
                <>
                  <div className="stat-value mono brass">{money(sim.resumen.valorCuota, moneda)}</div>
                  <div className="stat-note" style={{ color: sim.comparacion.interesesAhorrados >= 0 ? 'var(--capital)' : 'var(--interest)' }}>
                    {sim.comparacion.interesesAhorrados >= 0 ? '−' : '+'}
                    {money(Math.abs(sim.comparacion.interesesAhorrados), moneda)} en intereses
                  </div>
                  <div className="stat-note">
                    {sim.comparacion.cuotasAdelantadas > 0
                      ? `${sim.comparacion.cuotasAdelantadas} cuotas antes`
                      : sim.comparacion.cuotasAdelantadas < 0
                        ? `${Math.abs(sim.comparacion.cuotasAdelantadas)} cuotas después`
                        : 'mismo plazo'}
                  </div>
                </>
              ) : (
                <div className="stat-note">{sim.error || 'No se pudo calcular'}</div>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: 10, padding: '4px 8px', fontSize: 12 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sim.id, sim.nombre);
                }}
                disabled={deletingSimId === sim.id}
              >
                {deletingSimId === sim.id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </Box>
        ))}
      </Box>

      {simulations.length > 3 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
          <Box sx={{ display: 'flex', gap: '2px' }}>
            <IconButton size="small" onClick={() => scrollByCards(-1)} aria-label="Anteriores" sx={{ color: 'var(--muted)' }}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => scrollByCards(1)} aria-label="Siguientes" sx={{ color: 'var(--muted)' }}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'var(--border-soft)',
              '& .MuiLinearProgress-bar': { backgroundColor: 'var(--brass)' },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
