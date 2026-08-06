import { createTheme, Theme } from '@mui/material/styles';
import type { ThemeId } from './context/ThemeContext';

/**
 * Valores EXACTOS tomados de index.css (:root[data-theme='...']) — misma
 * fuente de verdad que el sistema de temas anterior, para que la migración
 * a MUI no cambie ni un pixel de color mientras convivan ambos sistemas.
 */
const PALETTES: Record<ThemeId, {
  ink: string; surface: string; surfaceRaised: string; border: string; borderSoft: string;
  paper: string; paperDim: string; muted: string; brass: string; brassSoft: string;
  gold: string; capital: string; interest: string; danger: string; mode: 'light' | 'dark';
}> = {
  azul: {
    ink: '#05142d', surface: '#0a2140', surfaceRaised: '#0f2d52', border: '#1c3b66', borderSoft: '#143055',
    paper: '#f2f1ea', paperDim: '#a9bbd1', muted: '#7c93b0', brass: '#15aeb7', brassSoft: '#0e7d84',
    gold: '#ffef00', capital: '#5c9c78', interest: '#c06a4c', danger: '#d16a5e', mode: 'dark',
  },
  oscuro: {
    ink: '#0a0d12', surface: '#12161d', surfaceRaised: '#1a2029', border: '#262c36', borderSoft: '#1d232c',
    paper: '#f2f1ea', paperDim: '#9ba3ac', muted: '#6b7280', brass: '#15aeb7', brassSoft: '#0e7d84',
    gold: '#ffef00', capital: '#5c9c78', interest: '#c06a4c', danger: '#d16a5e', mode: 'dark',
  },
  claro: {
    ink: '#ffffff', surface: '#f5f5f1', surfaceRaised: '#ededdd', border: '#dedcd3', borderSoft: '#e8e7e0',
    paper: '#14181c', paperDim: '#4b5563', muted: '#6b7280', brass: '#0e8a92', brassSoft: '#0b6a70',
    gold: '#c9a227', capital: '#2f7a52', interest: '#b1502e', danger: '#b8483a', mode: 'light',
  },
};

export function buildMuiTheme(themeId: ThemeId): Theme {
  const p = PALETTES[themeId];

  return createTheme({
    palette: {
      mode: p.mode,
      primary: { main: p.brass, dark: p.brassSoft, contrastText: p.mode === 'dark' ? '#0a0d12' : '#ffffff' },
      warning: { main: p.gold },
      success: { main: p.capital },
      error: { main: p.danger },
      background: { default: p.ink, paper: p.surface },
      text: { primary: p.paper, secondary: p.paperDim },
      divider: p.borderSoft,
    },
    typography: {
      fontFamily: "'Inter', -apple-system, sans-serif",
      h1: { fontFamily: "'Mohave', 'Source Serif 4', Georgia, serif" },
      h2: { fontFamily: "'Mohave', 'Source Serif 4', Georgia, serif" },
      h3: { fontFamily: "'Mohave', 'Source Serif 4', Georgia, serif" },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiButtonBase: {
        defaultProps: { disableRipple: true },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: { backgroundColor: p.surface, borderBottom: `1px solid ${p.borderSoft}` },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundColor: p.surface, borderRight: `1px solid ${p.borderSoft}` },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
        },
      },
    },
  });
}
