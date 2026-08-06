import { useEffect, useState } from 'react';
import { Box, FormControlLabel, Checkbox, CircularProgress } from '@mui/material';
import { AmortizationRow } from '../../domain/entities/loan';
import MetricLineChart, { ResolvedSeries } from './MetricLineChart';

export interface ChartSeriesDef {
  id: string;
  label: string;
  color: string;
  defaultOn?: boolean;
  getTabla: () => Promise<AmortizationRow[]> | AmortizationRow[];
}

interface LoanChartsSectionProps {
  moneda: string;
  /** Siempre visibles, sin checkbox (ej. "Préstamo base", o "Estimado" solo). */
  fixedSeries: ChartSeriesDef[];
  /** Con checkbox para mostrar/ocultar cada una (ej. simulaciones). */
  toggleableSeries?: ChartSeriesDef[];
  pickerLabel?: string;
}

export default function LoanChartsSection({ moneda, fixedSeries, toggleableSeries = [], pickerLabel }: LoanChartsSectionProps) {
  const [active, setActive] = useState<Set<string>>(() => new Set(toggleableSeries.filter((s) => s.defaultOn !== false).map((s) => s.id)));
  const [cache, setCache] = useState<Record<string, AmortizationRow[]>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  const allDefs = [...fixedSeries, ...toggleableSeries];

  function loadIfMissing(id: string) {
    setCache((prevCache) => {
      if (prevCache[id]) return prevCache;
      const def = allDefs.find((d) => d.id === id);
      if (!def) return prevCache;
      setLoading((prev) => new Set(prev).add(id));
      Promise.resolve(def.getTabla()).then((tabla) => {
        setCache((prev) => ({ ...prev, [id]: tabla }));
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
      return prevCache;
    });
  }

  // Al montar (y si cambia el conjunto fijo), carga las series fijas + las
  // que ya estén activas por defecto — una sola vez cada una.
  useEffect(() => {
    fixedSeries.forEach((s) => loadIfMissing(s.id));
    Array.from(active).forEach((id) => loadIfMissing(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedSeries.map((s) => s.id).join(',')]);

  async function toggle(id: string) {
    const isOn = active.has(id);
    if (isOn) {
      const next = new Set(active);
      next.delete(id);
      setActive(next);
      return;
    }
    loadIfMissing(id);
    setActive((prev) => new Set(prev).add(id));
  }

  const resolved: ResolvedSeries[] = [...fixedSeries, ...toggleableSeries.filter((s) => active.has(s.id))]
    .filter((s) => cache[s.id])
    .map((s) => ({ id: s.id, label: s.label, color: s.color, tabla: cache[s.id] }));

  return (
    <Box sx={{ marginBottom: '28px' }}>
      {toggleableSeries.length > 0 && (
        <Box sx={{ marginBottom: '14px' }}>
          {pickerLabel && (
            <div className="ledger-ribbon-label" style={{ marginBottom: 8 }}>
              {pickerLabel}
            </div>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
            {toggleableSeries.map((s) => (
              <FormControlLabel
                key={s.id}
                control={
                  <Checkbox
                    checked={active.has(s.id)}
                    onChange={() => toggle(s.id)}
                    size="small"
                    sx={{ color: s.color, '&.Mui-checked': { color: s.color } }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--paper)' }}>
                    {s.label}
                    {loading.has(s.id) && <CircularProgress size={11} sx={{ color: 'var(--muted)' }} />}
                  </Box>
                }
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <MetricLineChart title="Capital" metric="capital" defaultGranularidad="cuotas" series={resolved} moneda={moneda} />
        <MetricLineChart title="Interés" metric="interes" defaultGranularidad="anio" series={resolved} moneda={moneda} />
      </Box>
    </Box>
  );
}
