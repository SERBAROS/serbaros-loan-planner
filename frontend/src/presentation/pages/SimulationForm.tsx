import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { composition } from '../../infrastructure/composition-root';
import { AbonoDefinition, LoanDetail, SimulatedPlan } from '../../domain/entities/loan';
import { money, percent, dateEs } from '../format';
import CurrencyInput from '../components/CurrencyInput';
import AbonoBuilder from '../components/AbonoBuilder';

export default function SimulationForm({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { id, simId } = useParams();
  const loanId = Number(id);

  const [base, setBase] = useState<LoanDetail | null>(null);
  const [nombre, setNombre] = useState('');
  const [valorCuotaManual, setValorCuotaManual] = useState('');
  const [compromisos, setCompromisos] = useState<AbonoDefinition[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<SimulatedPlan | null>(null);
  const [previewError, setPreviewError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    composition.getLoanUseCase
      .execute(loanId)
      .then(setBase)
      .catch((err) => setError((err as Error).message));
  }, [loanId]);

  useEffect(() => {
    if (mode === 'edit' && simId) {
      composition.getSimulationUseCase
        .execute(loanId, Number(simId))
        .then((data) => {
          setNombre(data.nombre);
          setValorCuotaManual(data.valorCuotaManual ? String(data.valorCuotaManual) : '');
          setCompromisos(data.compromisosAdicionales ?? []);
        })
        .catch((err) => setError((err as Error).message));
    }
  }, [mode, loanId, simId]);

  useEffect(() => {
    if (!base) {
      setPreview(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await composition.simulateLoanUseCase.execute({
          monto: base.resumen.monto,
          tasaEfectivaAnual: base.resumen.tasaEfectivaAnual,
          numeroCuotas: base.resumen.numeroCuotasSolicitadas,
          mesInicioAmortizacion: base.resumen.mesInicioAmortizacion,
          valorCuotaManual: valorCuotaManual ? Number(valorCuotaManual) : base.resumen.valorCuota,
          compromisosCuotaExtraordinaria: [...base.compromisosCuotaExtraordinaria, ...compromisos],
        });
        setPreview(data);
        setPreviewError('');
      } catch (err) {
        setPreview(null);
        setPreviewError((err as Error).message);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, valorCuotaManual, JSON.stringify(compromisos)]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      nombre,
      valorCuotaManual: valorCuotaManual ? Number(valorCuotaManual) : null,
      compromisosAdicionales: compromisos,
    };
    try {
      if (mode === 'edit' && simId) {
        await composition.updateSimulationUseCase.execute(loanId, Number(simId), payload);
        navigate(`/prestamos/${loanId}/simulaciones/${simId}`);
      } else {
        const { id: newId } = await composition.createSimulationUseCase.execute(loanId, payload);
        navigate(`/prestamos/${loanId}/simulaciones/${newId}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!base) return <div className="panel-empty">Cargando…</div>;
  const moneda = base.moneda;

  return (
    <div className="form-page">
      <h1 className="loan-title">{mode === 'edit' ? 'Editar simulación' : 'Nueva simulación'}</h1>
      <p className="loan-subtitle" style={{ marginBottom: 24 }}>
        Sobre <strong>{base.nombre}</strong>: {money(base.resumen.monto, moneda)} · TEA {percent(base.resumen.tasaEfectivaAnual)} ·{' '}
        {base.resumen.numeroCuotasSolicitadas} cuotas · desde {dateEs(base.resumen.mesInicioAmortizacion)}. Estos datos no
        se pueden cambiar aquí.
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="nombre">Nombre de la simulación</label>
          <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Con abono en diciembre" required />
        </div>

        <h2 className="form-section-title">Cuota (opcional)</h2>
        <div className="field">
          <label htmlFor="cuotaManual">Valor de la cuota para este escenario</label>
          <CurrencyInput
            id="cuotaManual"
            value={valorCuotaManual}
            onChange={setValorCuotaManual}
            currencyCode={moneda}
            placeholder={String(base.resumen.valorCuota)}
          />
          <span className="field-hint">
            Si lo dejas vacío, se usa la misma cuota del préstamo base ({money(base.resumen.valorCuota, moneda)}).
          </span>
        </div>

        <AbonoBuilder
          value={compromisos}
          onChange={setCompromisos}
          currencyCode={moneda}
          title="Abonos adicionales de esta simulación"
          helpText="Se SUMAN al compromiso de cuota extraordinaria que ya tiene el préstamo base — no lo reemplazan."
        />

        {previewError && <div className="error-box">{previewError}</div>}

        {preview && (
          <div className="simulate-preview">
            <div className="simulate-preview-title">Vista previa vs. el préstamo base</div>
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
              <div className="stat-cell">
                <div className="stat-label">Cuotas reales</div>
                <div className="stat-value mono">
                  {preview.resumen.numeroCuotasReales}{' '}
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>vs {base.resumen.numeroCuotasReales}</span>
                </div>
              </div>
              <div className="stat-cell">
                <div className="stat-label">Total intereses</div>
                <div className="stat-value mono interest">{money(preview.resumen.totalIntereses, moneda)}</div>
                <div className="stat-note" style={{ color: 'var(--capital)' }}>
                  Ahorro: {money(Math.max(0, base.resumen.totalIntereses - preview.resumen.totalIntereses), moneda)}
                </div>
              </div>
              <div className="stat-cell">
                <div className="stat-label">Abonado extra</div>
                <div className="stat-value mono capital">{money(preview.resumen.totalAbonosExtra, moneda)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="form-footer">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear simulación'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
