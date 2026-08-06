import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box } from '@mui/material';
import { composition } from '../../infrastructure/composition-root';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUserNombre, logout } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    composition.getProfileUseCase
      .execute()
      .then((profile) => setNombre(profile.nombre ?? ''))
      .catch(() => {
        // si falla, seguimos con lo que ya teníamos en la sesión
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const updated = await composition.updateProfileUseCase.execute(nombre.trim() || null);
      updateUserNombre(updated.nombre);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/entrar');
  }

  const initials = (user?.nombre || user?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="form-page">
      <h1 className="loan-title">Tu perfil</h1>
      <p className="loan-subtitle" style={{ marginBottom: 24 }}>
        Datos de tu cuenta. Para preferencias de tema y moneda, ve a Configuración.
      </p>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: '28px' }}>
        <Avatar sx={{ width: 56, height: 56, backgroundColor: 'var(--brass)', color: 'var(--ink)', fontSize: 22, fontWeight: 700 }}>
          {initials}
        </Avatar>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--paper)' }}>{user?.nombre || 'Sin nombre'}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{user?.email}</div>
        </div>
      </Box>

      {error && <div className="error-box">{error}</div>}
      {saved && (
        <div className="simulate-preview" style={{ marginBottom: 20, color: 'var(--capital)' }}>
          Perfil actualizado.
        </div>
      )}

      <h2 className="form-section-title">Nombre</h2>
      <div className="field" style={{ maxWidth: 420 }}>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
        <span className="field-hint">Así te verás en el encabezado de la app y en los reportes exportados.</span>
      </div>

      <h2 className="form-section-title">Correo</h2>
      <div className="field" style={{ maxWidth: 420 }}>
        <input value={user?.email ?? ''} disabled />
        <span className="field-hint">El correo no se puede cambiar desde aquí.</span>
      </div>

      <div className="form-footer">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border-soft)' }}>
        <button className="btn" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
