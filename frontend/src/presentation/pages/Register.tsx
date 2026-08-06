import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
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
    <div className="auth-page">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <Logo variant="principal" height={92} />
        <div className="auth-card">
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-sub">Guarda y consulta tus planes de pago en Serbaros Loan Planner.</p>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <span className="field-hint">Mínimo 6 caracteres.</span>
            </div>
            <div className="field" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <input
                id="aceptaTerminos"
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                style={{ width: 'auto', marginTop: 3 }}
              />
              <label htmlFor="aceptaTerminos" style={{ fontSize: 13, fontWeight: 400, color: 'var(--paper-dim)' }}>
                Acepto los{' '}
                <Link to="/terminos" target="_blank" style={{ color: 'var(--brass)' }}>
                  Términos de uso
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" target="_blank" style={{ color: 'var(--brass)' }}>
                  Política de privacidad
                </Link>
                .
              </label>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading || !aceptaTerminos} style={{ width: '100%' }}>
              {loading ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-switch">
            ¿Ya tienes cuenta? <Link to="/entrar">Entra aquí</Link>
          </div>
        </div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
