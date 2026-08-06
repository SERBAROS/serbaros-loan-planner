import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Alert, Typography, Stack, Link, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '32px 16px',
      }}
    >
      <Logo variant="principal" height={92} />
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: '32px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border-soft)',
          borderRadius: '10px',
        }}
      >
        <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--paper)', marginBottom: '6px' }}>Entrar</Typography>
        <Typography sx={{ fontSize: 14, color: 'var(--muted)', marginBottom: '24px' }}>
          Accede a tus planes de pago guardados en Serbaros Loan Planner.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: '16px' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.2}>
            <TextField label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus fullWidth />
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{ backgroundColor: 'var(--brass)', color: 'var(--ink)', fontWeight: 700, '&:hover': { backgroundColor: 'var(--brass-soft)' } }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </Stack>
        </Box>

        <Typography sx={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: '22px' }}>
          ¿No tienes cuenta?{' '}
          <Link component={RouterLink} to="/registro" sx={{ color: 'var(--brass)' }}>
            Crea una
          </Link>
        </Typography>
      </Paper>
      <ThemeSwitcher />
    </Box>
  );
}
