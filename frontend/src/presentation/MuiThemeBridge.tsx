import { ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useTheme } from './context/ThemeContext';
import { buildMuiTheme } from './mui-theme';

export default function MuiThemeBridge({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const muiTheme = useMemo(() => buildMuiTheme(theme), [theme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
