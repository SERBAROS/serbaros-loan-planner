import { useRef, useState, useEffect, useMemo } from "react";
import {
  Box,
  IconButton,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { AmortizationRow, AnnualBalance } from "../../domain/entities/loan";
import { money, dateEs } from "../format";

interface AnnualInterestCardsProps {
  saldosAnuales: AnnualBalance[];
  tabla: AmortizationRow[];
  moneda: string;
}

type Granularidad = "anio" | "cuota" | "mes";

interface CardItem {
  key: string;
  badge: string;
  subLabel: string;
  interes: number;
  capital: number;
  sparkValues: number[];
}

const CARD_WIDTH = 236;
const CARD_GAP = 16;

/** Escala de "calor" de 3 puntos (verde → dorado → rojo/naranja) — el color
 * de cada tarjeta comunica directamente qué tan alto fue el interés en ese
 * período respecto a los demás. */
function heatColor(intensity: number): string {
  const t = Math.max(0, Math.min(1, intensity));
  if (t <= 0.5) {
    const pct = Math.round((1 - t * 2) * 100);
    return `color-mix(in srgb, var(--capital) ${pct}%, var(--gold) ${
      100 - pct
    }%)`;
  }
  const pct = Math.round((1 - (t - 0.5) * 2) * 100);
  return `color-mix(in srgb, var(--gold) ${pct}%, var(--interest) ${
    100 - pct
  }%)`;
}

function cardBackground(accent: string, intensity: number) {
  const tintPct = 10 + intensity * 22;
  return `linear-gradient(135deg, color-mix(in srgb, ${accent} ${tintPct}%, var(--surface)), var(--surface))`;
}

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
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AnnualInterestCards({
  saldosAnuales,
  tabla,
  moneda,
}: AnnualInterestCardsProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [granularidad, setGranularidad] = useState<Granularidad>("anio");

  const items: CardItem[] = useMemo(() => {
    if (granularidad === "anio") {
      // Interés ACUMULADO desde el inicio (igual que antes) + capital
      // acumulado calculado en paralelo, para que ambos sean comparables.
      let capitalAcumulado = 0;
      return saldosAnuales.map((s, idx) => {
        const rows = tabla.slice(idx * 12, idx * 12 + 12);
        capitalAcumulado += rows.reduce((sum, r) => sum + r.capital, 0);
        return {
          key: String(s.cuota),
          badge: String(idx + 1),
          subLabel: dateEs(s.fecha),
          interes: s.interesAcumulado,
          capital: capitalAcumulado,
          sparkValues: rows.map((r) => r.interes),
        };
      });
    }
    // Cuota / Mes: el detalle propio de ESA cuota (no acumulado) — misma
    // fila de datos, solo cambia si la etiqueta es "Cuota N" o la fecha.
    return tabla.map((r, idx) => ({
      key: String(r.numeroCuota),
      badge: String(r.numeroCuota),
      subLabel:
        granularidad === "cuota" ? `Cuota ${r.numeroCuota}` : dateEs(r.fecha),
      interes: r.interes,
      capital: r.capital,
      sparkValues: tabla
        .slice(Math.max(0, idx - 5), idx + 1)
        .map((row) => row.interes),
    }));
  }, [granularidad, saldosAnuales, tabla]);

  if (items.length === 0) return null;

  const interesValues = items.map((it) => it.interes);
  const minInteres = Math.min(...interesValues);
  const maxInteres = Math.max(...interesValues);
  const interesRange = maxInteres - minInteres || 1;

  function scrollByCards(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * (CARD_WIDTH + CARD_GAP) * 3,
      behavior: "smooth",
    });
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
    el.scrollTo({ left: 0 });
    setProgress(0);
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularidad, tabla]);

  return (
    <Box
      sx={{
        border: "1px solid var(--border-soft)",
        borderRadius: "10px",
        padding: "18px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "16px",
        }}
      >
        <div className="ledger-ribbon-label" style={{ marginBottom: 0 }}>
          Detalle
        </div>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={granularidad}
          onChange={(_e, v) => v && setGranularidad(v)}
          sx={{
            "& .MuiToggleButton-root": {
              color: "var(--muted)",
              borderColor: "var(--border-soft)",
              fontSize: "11px",
              textTransform: "none",
              padding: "3px 10px",
            },
            "& .MuiToggleButton-root.Mui-selected": {
              backgroundColor: "var(--brass)",
              color: "var(--ink)",
              "&:hover": { backgroundColor: "var(--brass)" },
            },
          }}
        >
          <ToggleButton value="cuota">Cuotas</ToggleButton>
          <ToggleButton value="anio">Año</ToggleButton>
          <ToggleButton value="mes">Mes</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box
        ref={trackRef}
        sx={{
          display: "flex",
          gap: `${CARD_GAP}px`,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          paddingBottom: "4px",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {items.map((item, idx) => {
          const previo = idx > 0 ? items[idx - 1].interes : null;
          const pctChange =
            previo && previo > 0
              ? ((item.interes - previo) / previo) * 100
              : null;
          const intensity = (item.interes - minInteres) / interesRange;
          const accent = heatColor(intensity);

          return (
            <Box
              key={item.key}
              sx={{
                flex: `0 0 ${CARD_WIDTH}px`,
                width: `${CARD_WIDTH}px`,
                scrollSnapAlign: "start",
                background: cardBackground(accent, intensity),
                border: "1px solid var(--border-soft)",
                borderRadius: "10px",
                padding: "14px 16px",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    backgroundColor: accent,
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {item.badge}
                </Box>
                {pctChange !== null && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      color: accent,
                    }}
                  >
                    {pctChange >= 0 ? (
                      <ArrowUpwardIcon sx={{ fontSize: 12 }} />
                    ) : (
                      <ArrowDownwardIcon sx={{ fontSize: 12 }} />
                    )}
                    {Math.abs(pctChange).toFixed(1)}%
                  </Box>
                )}
              </Box>

              <div className="stat-label" style={{ marginBottom: 4 }}>
                {item.subLabel}
              </div>

              <div
                className="stat-label"
                style={{ marginBottom: 2, fontSize: 10 }}
              >
                {granularidad === "anio" ? "Interés acumulado" : "Interés"}
              </div>
              <div
                className="stat-value mono interest"
                style={{ fontSize: 18, marginBottom: 8 }}
              >
                {money(item.interes, moneda)}
              </div>

              <div
                className="stat-label"
                style={{ marginBottom: 2, fontSize: 10 }}
              >
                {granularidad === "anio"
                  ? "Capital acumulado"
                  : "Pago a capital"}
              </div>
              <div
                className="stat-value mono capital"
                style={{ fontSize: 15, marginBottom: 10 }}
              >
                {money(item.capital, moneda)}
              </div>
            </Box>
          );
        })}
      </Box>

      {items.length > 4 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginTop: "16px",
          }}
        >
          <Box sx={{ display: "flex", gap: "2px" }}>
            <IconButton
              size="small"
              onClick={() => scrollByCards(-1)}
              aria-label="Anteriores"
              sx={{ color: "var(--muted)" }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => scrollByCards(1)}
              aria-label="Siguientes"
              sx={{ color: "var(--muted)" }}
            >
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
              backgroundColor: "var(--border-soft)",
              "& .MuiLinearProgress-bar": { backgroundColor: "var(--brass)" },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
