import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { composition } from '../../infrastructure/composition-root';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CurrencySelect from '../components/CurrencySelect';

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUserPreferences } = useAuth();
  const { theme, setTheme, options } = useTheme();
  const [moneda, setMoneda] = useState(user?.monedaDefecto ?? 'COP');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await composition.updatePreferenciasUseCase.execute({ temaDefecto: theme, monedaDefecto: moneda });
      updateUserPreferences(theme, moneda);
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-page">
      <h1 className="loan-title">Configuración de cuenta</h1>
      <p className="loan-subtitle" style={{ marginBottom: 24 }}>
        Estas preferencias se guardan en tu cuenta — viajan contigo si entras desde otro dispositivo.
      </p>

      {error && <div className="error-box">{error}</div>}
      {saved && (
        <div className="simulate-preview" style={{ marginBottom: 20, color: 'var(--capital)' }}>
          Preferencias guardadas.
        </div>
      )}

      <h2 className="form-section-title">Tema por defecto</h2>
      <p className="field-hint" style={{ marginBottom: 12 }}>
        Se aplica de una vez al elegirlo aquí, y es lo que verás al iniciar sesión desde cualquier dispositivo.
      </p>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={theme === opt.id ? 'btn btn-primary' : 'btn'}
            onClick={() => setTheme(opt.id)}
            style={{ flex: '1 1 160px' }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <h2 className="form-section-title">Moneda por defecto</h2>
      <p className="field-hint" style={{ marginBottom: 12 }}>
        Con qué moneda arranca preseleccionado el formulario al crear un préstamo nuevo. No afecta los préstamos que ya
        tienes guardados.
      </p>
      <div className="field" style={{ maxWidth: 420 }}>
        <CurrencySelect value={moneda} onChange={setMoneda} />
      </div>

      <div className="form-footer">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar preferencias'}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    </div>
  );
}
