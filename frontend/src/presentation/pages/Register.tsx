import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Alert, Typography, Stack, Link, Checkbox, FormControlLabel } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useLegalDialogs } from '../context/LegalDialogsContext';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { openTerms, openPrivacy } = useLegalDialogs();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!aceptaTerminos) {
      setError('Debes aceptar los Términos de uso y la Política de Privacidad para crear una cuenta.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, nombre);
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
        <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--paper)', marginBottom: '6px' }}>
          Crear cuenta
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'var(--muted)', marginBottom: '24px' }}>
          Guarda y consulta tus planes de pago en Serbaros Loan Planner.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ marginBottom: '16px' }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.2}>
            <TextField label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus fullWidth />
            <TextField label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              helperText="Mínimo 6 caracteres."
              slotProps={{ htmlInput: { minLength: 6 } }}
            />

            <FormControlLabel
              control={<Checkbox checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} size="small" />}
              label={
                <Typography sx={{ fontSize: 13, color: 'var(--paper-dim)' }}>
                  Acepto los{' '}
                  <Link onClick={openTerms} sx={{ color: 'var(--brass)', cursor: 'pointer' }}>
                    Términos de uso
                  </Link>{' '}
                  y la{' '}
                  <Link onClick={openPrivacy} sx={{ color: 'var(--brass)', cursor: 'pointer' }}>
                    Política de privacidad
                  </Link>
                  .
                </Typography>
              }
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !aceptaTerminos}
              fullWidth
              sx={{ backgroundColor: 'var(--brass)', color: 'var(--ink)', fontWeight: 700, '&:hover': { backgroundColor: 'var(--brass-soft)' } }}
            >
              {loading ? 'Creando…' : 'Crear cuenta'}
            </Button>
          </Stack>
        </Box>

        <Typography sx={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: '22px' }}>
          ¿Ya tienes cuenta?{' '}
          <Link component={RouterLink} to="/entrar" sx={{ color: 'var(--brass)' }}>
            Entra aquí
          </Link>
        </Typography>
      </Paper>
      <ThemeSwitcher />
    </Box>
  );
}
