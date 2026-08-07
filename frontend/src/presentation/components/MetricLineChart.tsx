import { useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, ToggleButtonGroup, ToggleButton, Typography, useMediaQuery } from '@mui/material';
import { AmortizationRow } from '../../domain/entities/loan';
import { money, dateEs } from '../format';

export type Granularidad = 'cuotas' | 'meses' | 'anio';
export type Metric = 'capital' | 'interes';

export interface ResolvedSeries {
  id: string;
  label: string;
  color: string;
  tabla: AmortizationRow[];
}

interface MetricLineChartProps {
  title: string;
  metric: Metric;
  defaultGranularidad: Granularidad;
  series: ResolvedSeries[];
  moneda: string;
}

function aggregate(tabla: AmortizationRow[], granularidad: Granularidad, metric: Metric): { x: string; y: number }[] {
  const field = (r: AmortizationRow) => (metric === 'capital' ? r.capital : r.interes);
  if (granularidad !== 'anio') {
    return tabla.map((r) => ({
      x: granularidad === 'cuotas' ? `Cuota ${r.numeroCuota}` : dateEs(r.fecha),
      y: field(r),
    }));
  }
  const points: { x: string; y: number }[] = [];
  for (let i = 0; i < tabla.length; i += 12) {
    const chunk = tabla.slice(i, i + 12);
    const total = chunk.reduce((s, r) => s + field(r), 0);
    points.push({ x: `Año ${Math.floor(i / 12) + 1}`, y: total });
  }
  return points;
}

export default function MetricLineChart({ title, metric, defaultGranularidad, series, moneda }: MetricLineChartProps) {
  const [granularidad, setGranularidad] = useState<Granularidad>(defaultGranularidad);
  const isNarrow = useMediaQuery('(max-width:480px)');

  const chartSeries = useMemo(
    () =>
      series.map((s) => ({
        name: s.label,
        data: aggregate(s.tabla, granularidad, metric).map((p) => ({ x: p.x, y: Number(p.y.toFixed(2)) })),
        color: s.color,
      })),
    [series, granularidad, metric],
  );

  const options = {
    chart: { toolbar: { show: false }, background: 'transparent', fontFamily: 'var(--font-body)' },
    theme: { mode: 'dark' as const },
    stroke: { curve: 'smooth' as const, width: 2.5 },
    grid: { borderColor: 'var(--border-soft)', strokeDashArray: 3 },
    xaxis: {
      type: 'category' as const,
      tickAmount: isNarrow ? 3 : 6,
      labels: { style: { colors: 'var(--muted)', fontSize: isNarrow ? '9px' : '11px' }, rotate: -45, trim: false },
    },
    yaxis: {
      labels: {
        formatter: (v: number) => money(v, moneda),
        style: { colors: 'var(--muted)', fontSize: isNarrow ? '9px' : '11px' },
      },
    },
    tooltip: { theme: 'dark' as const, y: { formatter: (v: number) => money(v, moneda) } },
    legend: {
      show: series.length > 1,
      position: 'top' as const,
      labels: { colors: 'var(--paper-dim)' },
      fontSize: '12px',
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 4 } },
  };

  return (
    <Box sx={{ border: '1px solid var(--border-soft)', borderRadius: '10px', padding: '16px 18px', minWidth: 0, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--paper)' }}>{title}</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={granularidad}
          onChange={(_e, v) => v && setGranularidad(v)}
          sx={{
            '& .MuiToggleButton-root': {
              color: 'var(--muted)',
              borderColor: 'var(--border-soft)',
              fontSize: isNarrow ? '10px' : '11px',
              textTransform: 'none',
              padding: isNarrow ? '2px 7px' : '3px 10px',
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

      {series.length === 0 ? (
        <Box sx={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Sin datos para mostrar.</Box>
      ) : (
        <ReactApexChart options={options} series={chartSeries} type="line" height={260} width="100%" />
      )}
    </Box>
  );
}
