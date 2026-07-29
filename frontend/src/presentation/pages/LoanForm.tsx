import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { composition } from '../../infrastructure/composition-root';
import { AbonoDefinition, EstadoPrestamo, SimulatedPlan } from '../../domain/entities/loan';
import { money, percent } from '../format';
import { fractionToPercent, monthlyPercentToTeaPercent, percentToFraction, roundForInput, teaPercentToMonthlyPercent } from '../rate';
import { LayoutOutletContext } from './Layout';
import CurrencyInput from '../components/CurrencyInput';
import CurrencySelect from '../components/CurrencySelect';
import AbonoBuilder from '../components/AbonoBuilder';

interface FormState {
  nombre: string;
  estado: EstadoPrestamo;
  moneda: string;
  monto: string;
  teaPercent: string;
  mensualPercent: string;
  numeroCuotas: string;
  mesInicioAmortizacion: string;
  numeroCuotaInicial: string;
  valorCuotaManual: string;
}

const emptyForm: FormState = {
  nombre: '',
  estado: 'NUEVO',
  moneda: 'COP',
  monto: '',
  teaPercent: '',
  mensualPercent: '',
  numeroCuotas: '',
  mesInicioAmortizacion: '',
  numeroCuotaInicial: '',
  valorCuotaManual: '',
};

export default function LoanForm({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { refresh } = useOutletContext<LayoutOutletContext>();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [compromisos, setCompromisos] = useState<AbonoDefinition[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<SimulatedPlan | null>(null);
  const [previewError, setPreviewError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enEjecucion = form.estado === 'EN_EJECUCION';

  useEffect(() => {
    if (mode === 'edit' && id) {
      composition.getLoanUseCase
        .execute(Number(id))
        .then((data) => {
          setForm({
            nombre: data.nombre,
            estado: data.estado,
            moneda: data.moneda,
            monto: String(data.resumen.monto),
            teaPercent: String(roundForInput(fractionToPercent(data.resumen.tasaEfectivaAnual))),
            mensualPercent: String(roundForInput(fractionToPercent(data.resumen.tasaMensual))),
            numeroCuotas: String(data.resumen.numeroCuotasSolicitadas),
            mesInicioAmortizacion: data.resumen.mesInicioAmortizacion,
            numeroCuotaInicial: String(data.resumen.numeroCuotaInicial),
            valorCuotaManual: data.resumen.esCuotaManual ? String(data.resumen.valorCuota) : '',
          });
          setCompromisos(data.compromisosCuotaExtraordinaria ?? []);
        })
        .catch((err) => setError((err as Error).message));
    }
  }, [mode, id]);

  useEffect(() => {
    const { monto, teaPercent, numeroCuotas, mesInicioAmortizacion } = form;
    if (!(Number(monto) > 0) || !(Number(teaPercent) >= 0) || !(Number(numeroCuotas) > 0) || !mesInicioAmortizacion) {
      setPreview(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await composition.simulateLoanUseCase.execute({
          monto: Number(monto),
          tasaEfectivaAnual: percentToFraction(Number(teaPercent)),
          numeroCuotas: Number(numeroCuotas),
          mesInicioAmortizacion,
          valorCuotaManual: form.valorCuotaManual ? Number(form.valorCuotaManual) : null,
          compromisosCuotaExtraordinaria: compromisos,
          numeroCuotaInicial: enEjecucion && form.numeroCuotaInicial ? Number(form.numeroCuotaInicial) : 1,
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
  }, [
    form.monto,
    form.teaPercent,
    form.numeroCuotas,
    form.mesInicioAmortizacion,
    form.valorCuotaManual,
    form.numeroCuotaInicial,
    enEjecucion,
    JSON.stringify(compromisos),
  ]);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function onChangeTea(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      teaPercent: value,
      mensualPercent:
        value.trim() === '' || Number.isNaN(Number(value)) ? f.mensualPercent : String(roundForInput(teaPercentToMonthlyPercent(Number(value)))),
    }));
  }

  function onChangeMensual(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setForm((f) => ({
      ...f,
      mensualPercent: value,
      teaPercent:
        value.trim() === '' || Number.isNaN(Number(value)) ? f.teaPercent : String(roundForInput(monthlyPercentToTeaPercent(Number(value)))),
    }));
  }

  function useSuggestedCuota() {
    if (preview) setForm((f) => ({ ...f, valorCuotaManual: String(preview.resumen.valorCuotaTeorica) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      nombre: form.nombre,
      estado: form.estado,
      moneda: form.moneda,
      monto: Number(form.monto),
      tasaEfectivaAnual: percentToFraction(Number(form.teaPercent)),
      numeroCuotas: Number(form.numeroCuotas),
      mesInicioAmortizacion: form.mesInicioAmortizacion,
      numeroCuotaInicial: enEjecucion && form.numeroCuotaInicial ? Number(form.numeroCuotaInicial) : 1,
      valorCuotaManual: form.valorCuotaManual ? Number(form.valorCuotaManual) : null,
      compromisosCuotaExtraordinaria: compromisos,
    };
    try {
      if (mode === 'edit' && id) {
        await composition.updateLoanUseCase.execute(Number(id), payload);
        await refresh();
        navigate(`/prestamos/${id}`);
      } else {
        const { id: newId } = await composition.createLoanUseCase.execute(payload);
        await refresh();
        navigate(`/prestamos/${newId}`);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-page">
      <h1 className="loan-title">{mode === 'edit' ? 'Editar préstamo' : 'Nuevo préstamo'}</h1>
      <p className="loan-subtitle" style={{ marginBottom: 24 }}>
        Ingresa los mismos datos del Excel: monto, tasa, número de cuotas y fecha de inicio.
      </p>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit}>
        <h2 className="form-section-title">Estado del préstamo</h2>
        <div className="field">
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className={form.estado === 'NUEVO' ? 'btn btn-primary' : 'btn'}
              onClick={() => setForm((f) => ({ ...f, estado: 'NUEVO' }))}
              style={{ flex: 1 }}
            >
              Préstamo nuevo
            </button>
            <button
              type="button"
              className={enEjecucion ? 'btn btn-primary' : 'btn'}
              onClick={() => setForm((f) => ({ ...f, estado: 'EN_EJECUCION' }))}
              style={{ flex: 1 }}
            >
              Ya está en ejecución
            </button>
          </div>
          <span className="field-hint" style={{ marginTop: 8 }}>
            {enEjecucion
              ? 'Vas a ingresar el estado ACTUAL del préstamo (saldo pendiente hoy, tasa vigente, cuotas que faltan) — no los datos originales del desembolso.'
              : 'El préstamo arranca hoy, en la cuota 1.'}
          </span>
        </div>

        <h2 className="form-section-title">Datos del crédito</h2>

        <div className="field">
          <label htmlFor="nombre">Nombre del préstamo</label>
          <input id="nombre" value={form.nombre} onChange={set('nombre')} placeholder="Ej. Crédito vivienda" required />
        </div>

        <div className="field">
          <label htmlFor="moneda">Moneda</label>
          <CurrencySelect id="moneda" value={form.moneda} onChange={(code) => setForm((f) => ({ ...f, moneda: code }))} />
        </div>

        <div className="field">
          <label htmlFor="monto">{enEjecucion ? 'Saldo actual pendiente' : 'Monto del préstamo'}</label>
          <CurrencyInput id="monto" value={form.monto} onChange={(v) => setForm((f) => ({ ...f, monto: v }))} currencyCode={form.moneda} required />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="tea">{enEjecucion ? 'Tasa efectiva anual vigente (TEA %)' : 'Tasa efectiva anual (TEA %)'}</label>
            <input id="tea" type="number" step="any" placeholder="12.25" value={form.teaPercent} onChange={onChangeTea} required />
            <span className="field-hint">Ingresa el porcentaje, ej. 12.25 para 12,25%.</span>
          </div>
          <div className="field">
            <label htmlFor="mensual">Tasa mensual equivalente (%)</label>
            <input id="mensual" type="number" step="any" placeholder="0.97" value={form.mensualPercent} onChange={onChangeMensual} />
            <span className="field-hint">Si conoces la tasa mensual en vez de la anual, ingrésala aquí — la otra se calcula sola.</span>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="cuotas">{enEjecucion ? 'Cuotas que faltan' : 'Número de cuotas'}</label>
            <input id="cuotas" type="number" step="1" value={form.numeroCuotas} onChange={set('numeroCuotas')} required />
          </div>
          <div className="field">
            <label htmlFor="fecha">{enEjecucion ? 'Fecha de corte del saldo actual' : 'Mes inicio amortización'}</label>
            <input id="fecha" type="date" value={form.mesInicioAmortizacion} onChange={set('mesInicioAmortizacion')} required />
            <span className="field-hint">{enEjecucion ? 'Normalmente hoy, o la fecha de tu último extracto.' : ''}</span>
          </div>
        </div>

        {enEjecucion && (
          <div className="field">
            <label htmlFor="cuotaInicial">¿En qué número de cuota vas?</label>
            <input
              id="cuotaInicial"
              type="number"
              step="1"
              min={1}
              placeholder="Ej. 15"
              value={form.numeroCuotaInicial}
              onChange={set('numeroCuotaInicial')}
            />
            <span className="field-hint">
              Para que la tabla se numere igual que tu plan real (empieza en esta cuota en vez de reiniciar en 1). Si no
              lo sabes, déjalo vacío.
            </span>
          </div>
        )}

        <h2 className="form-section-title">Cuota</h2>
        <div className="field">
          <label htmlFor="cuotaManual">Valor de la cuota (opcional)</label>
          <CurrencyInput
            id="cuotaManual"
            value={form.valorCuotaManual}
            onChange={(v) => setForm((f) => ({ ...f, valorCuotaManual: v }))}
            currencyCode={form.moneda}
            placeholder={preview ? String(preview.resumen.valorCuotaTeorica) : 'Se calcula automáticamente (PMT)'}
          />
          <span className="field-hint">
            Si tu banco te dio una cuota fija distinta a la calculada, ingrésala aquí — igual que en el Excel, el saldo se
            amortiza con esa cuota aunque el número de pagos reales termine siendo distinto al plazo indicado.
          </span>
        </div>

        <AbonoBuilder
          value={compromisos}
          onChange={setCompromisos}
          currencyCode={form.moneda}
          title="Compromiso cuota extraordinaria"
          helpText="Abonos extra sobre este préstamo: puntuales (una cuota o fecha específica), recurrentes (cada N meses/años, indefinido o hasta una fecha límite), o un grupo de varios recurrentes con nombre propio (ej. primas + cesantías)."
        />

        {previewError && <div className="error-box">{previewError}</div>}

        {preview && (
          <div className="simulate-preview">
            <div className="simulate-preview-title">Vista previa</div>
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 0 }}>
              <div className="stat-cell">
                <div className="stat-label">Cuota sugerida (PMT)</div>
                <div className="stat-value mono">{money(preview.resumen.valorCuotaTeorica, form.moneda)}</div>
              </div>
              <div className="stat-cell">
                <div className="stat-label">Cuota que se usará</div>
                <div className="stat-value mono brass">{money(preview.resumen.valorCuota, form.moneda)}</div>
              </div>
              <div className="stat-cell">
                <div className="stat-label">Cuotas reales hasta saldar</div>
                <div className="stat-value mono">{preview.resumen.numeroCuotasReales}</div>
              </div>
            </div>
            <p className="field-hint" style={{ marginTop: 12 }}>
              TEA {percent(preview.resumen.tasaEfectivaAnual)} · Tasa mensual {percent(preview.resumen.tasaMensual)}
              {preview.resumen.totalAbonosExtra > 0 && <> · Abonos extra: {money(preview.resumen.totalAbonosExtra, form.moneda)}</>}
              {enEjecucion && <> · La tabla empezará a numerarse desde la cuota {preview.resumen.numeroCuotaInicial}</>}
            </p>
            {form.valorCuotaManual && (
              <button type="button" className="btn btn-ghost" style={{ marginTop: 4, padding: '6px 10px' }} onClick={useSuggestedCuota}>
                Usar la cuota calculada en su lugar
              </button>
            )}
          </div>
        )}

        <div className="form-footer">
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear préstamo'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
