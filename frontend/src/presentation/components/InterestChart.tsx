import { useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, ToggleButtonGroup, ToggleButton, Chip, CircularProgress } from '@mui/material';
import { AmortizationRow } from '../../domain/entities/loan';
import { money, dateEs } from '../format';

export type Granularidad = 'cuotas' | 'meses' | 'anio';

export interface ChartSeriesDef {
  id: string;
  label: string;
  color: string;
  defaultOn?: boolean;
  getTabla: () => Promise<AmortizationRow[]> | AmortizationRow[];
}

interface InterestChartProps {
  seriesDefs: ChartSeriesDef[];
  moneda: string;
}

function aggregate(tabla: AmortizationRow[], granularidad: Granularidad): { x: string; y: number }[] {
  if (granularidad !== 'anio') {
    return tabla.map((r) => ({
      x: granularidad === 'cuotas' ? `Cuota ${r.numeroCuota}` : dateEs(r.fecha),
      y: r.interes,
    }));
  }
  const points: { x: string; y: number }[] = [];
  for (let i = 0; i < tabla.length; i += 12) {
    const chunk = tabla.slice(i, i + 12);
    const total = chunk.reduce((s, r) => s + r.interes, 0);
    points.push({ x: `Año ${Math.floor(i / 12) + 1}`, y: total });
  }
  return points;
}

export default function InterestChart({ seriesDefs, moneda }: InterestChartProps) {
  const [granularidad, setGranularidad] = useState<Granularidad>('cuotas');
  const [active, setActive] = useState<Set<string>>(() => new Set(seriesDefs.filter((s) => s.defaultOn).map((s) => s.id)));
  const [cache, setCache] = useState<Record<string, AmortizationRow[]>>({});
  const [loading, setLoading] = useState<Set<string>>(new Set());

  async function toggleSeries(id: string) {
    const isOn = active.has(id);
    if (isOn) {
      const next = new Set(active);
      next.delete(id);
      setActive(next);
      return;
    }
    if (!cache[id]) {
      setLoading((prev) => new Set(prev).add(id));
      try {
        const def = seriesDefs.find((s) => s.id === id);
        const tabla = await def!.getTabla();
        setCache((prev) => ({ ...prev, [id]: tabla }));
      } finally {
        setLoading((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
    setActive((prev) => new Set(prev).add(id));
  }

  const chartSeries = useMemo(() => {
    return seriesDefs
      .filter((s) => active.has(s.id) && cache[s.id])
      .map((s) => ({
        name: s.label,
        data: aggregate(cache[s.id], granularidad).map((p) => ({ x: p.x, y: Number(p.y.toFixed(2)) })),
        color: s.color,
      }));
  }, [seriesDefs, active, cache, granularidad]);

  const options = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'var(--font-body)' },
    theme: { mode: 'dark' as const },
    stroke: { curve: 'smooth' as const, width: 2.5 },
    grid: { borderColor: 'var(--border-soft)', strokeDashArray: 3 },
    xaxis: { type: 'category' as const, labels: { style: { colors: 'var(--muted)', fontSize: '11px' } } },
    yaxis: { labels: { formatter: (v: number) => money(v, moneda), style: { colors: 'var(--muted)', fontSize: '11px' } } },
    tooltip: { theme: 'dark' as const, y: { formatter: (v: number) => money(v, moneda) } },
    legend: { show: false },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {seriesDefs.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              onClick={() => toggleSeries(s.id)}
              icon={loading.has(s.id) ? <CircularProgress size={12} sx={{ color: 'inherit', marginLeft: '6px' }} /> : undefined}
              sx={{
                backgroundColor: active.has(s.id) ? s.color : 'var(--surface-raised)',
                color: active.has(s.id) ? 'var(--ink)' : 'var(--paper-dim)',
                fontWeight: active.has(s.id) ? 700 : 400,
                border: `1px solid ${active.has(s.id) ? s.color : 'var(--border-soft)'}`,
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>

        <ToggleButtonGroup
          size="small"
          exclusive
          value={granularidad}
          onChange={(_e, v) => v && setGranularidad(v)}
          sx={{
            '& .MuiToggleButton-root': {
              color: 'var(--muted)',
              borderColor: 'var(--border-soft)',
              fontSize: '12px',
              textTransform: 'none',
              padding: '4px 12px',
            },
            '& .MuiToggleButton-root.Mui-selected': {
              backgroundColor: 'var(--brass)',
              color: 'var(--ink)',
              '&:hover': { backgroundColor: 'var(--brass)' },
            },
          }}
        >
          <ToggleButton value="cuotas">Cuotas</ToggleButton>
          <ToggleButton value="meses">Meses</ToggleButton>
          <ToggleButton value="anio">Año</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {chartSeries.length === 0 ? (
        <Box sx={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
          Selecciona al menos una serie para verla en el gráfico.
        </Box>
      ) : (
        <ReactApexChart options={options} series={chartSeries} type="line" height={300} />
      )}
    </Box>
  );
}
