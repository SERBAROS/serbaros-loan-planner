import { FormEvent, useEffect, useState } from 'react';
import { composition } from '../../infrastructure/composition-root';
import { RealPaymentPlan } from '../../domain/entities/loan';
import { money, dateEs } from '../format';
import CurrencyInput from './CurrencyInput';
import { useConfirm } from '../context/ConfirmDialogContext';
import { Grid } from '@mui/material';

const emptyForm = { numeroCuota: '', monto: '', concepto: '', fechaPago: '' };

export default function RealPaymentsSection({ loanId }: { loanId: number }) {
  const confirm = useConfirm();
  const [plan, setPlan] = useState<RealPaymentPlan | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  function load() {
    composition.getRealPaymentPlanUseCase
      .execute(loanId)
      .then((data) => {
        setPlan(data);
        setError('');
      })
      .catch((err) => setError((err as Error).message));
  }

  useEffect(load, [loanId]);

  const moneda = plan?.moneda ?? 'COP';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await composition.createRealPaymentUseCase.execute(loanId, {
        numeroCuota: Number(form.numeroCuota),
        monto: Number(form.monto),
        concepto: form.concepto,
        fechaPago: form.fechaPago,
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Eliminar pago real',
      message: '¿Eliminar este pago real del historial?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      await composition.deleteRealPaymentUseCase.execute(loanId, id);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="loan-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="form-section-title" style={{ margin: 0 }}>
            Pago real
          </h2>
          <p className="loan-subtitle" style={{ marginTop: 4 }}>
            Histórico de abonos y cuotas extra que realmente se pagaron — se compara automáticamente contra la
            estimación.
          </p>
        </div>
        <div className="loan-actions">
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancelar' : '+ Registrar pago real'}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="simulate-preview" style={{ marginBottom: 24 }}>
          <div className="field-row">
            <div className="field">
              <label htmlFor="rp-cuota">No. de cuota</label>
              <input
                id="rp-cuota"
                type="number"
                step="1"
                min={1}
                value={form.numeroCuota}
                onChange={(e) => setForm((f) => ({ ...f, numeroCuota: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="rp-monto">Monto pagado</label>
              <CurrencyInput
                id="rp-monto"
                value={form.monto}
                onChange={(raw) => setForm((f) => ({ ...f, monto: raw }))}
                currencyCode={moneda}
                required
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="rp-concepto">Concepto</label>
              <input
                id="rp-concepto"
                placeholder="Ej. Abono voluntario, Prima…"
                value={form.concepto}
                onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="rp-fecha">Fecha real de pago</label>
              <input
                id="rp-fecha"
                type="date"
                value={form.fechaPago}
                onChange={(e) => setForm((f) => ({ ...f, fechaPago: e.target.value }))}
                required
              />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar pago real'}
          </button>
        </form>
      )}

      {!plan ? (
        <p className="field-hint" style={{ marginBottom: 32 }}>
          Cargando…
        </p>
      ) : (
        <>
          {plan.pagos.length === 0 ? (
            <p className="field-hint" style={{ marginBottom: 32 }}>
              Aún no has registrado pagos reales para este préstamo.
            </p>
          ) : (
            <>
              <Grid container spacing={0} className="stat-grid-mui" sx={{ marginBottom: '20px' }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                <div className="stat-cell">
                  <div className="stat-label">Cuotas reales (base: {plan.base.numeroCuotasReales})</div>
                  <div className="stat-value mono">{plan.resumen.numeroCuotasReales}</div>
                  <div className="stat-note" style={{ color: plan.comparacion.cuotasAdelantadas >= 0 ? 'var(--capital)' : 'var(--interest)' }}>
                    {plan.comparacion.cuotasAdelantadas > 0
                      ? `${plan.comparacion.cuotasAdelantadas} cuotas antes que la base`
                      : plan.comparacion.cuotasAdelantadas < 0
                        ? `${Math.abs(plan.comparacion.cuotasAdelantadas)} cuotas después`
                        : 'mismo plazo'}
                  </div>
                </div>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                <div className="stat-cell">
                  <div className="stat-label">Intereses (base: {money(plan.base.totalIntereses, moneda)})</div>
                  <div className="stat-value mono interest">{money(plan.resumen.totalIntereses, moneda)}</div>
                  <div className="stat-note" style={{ color: plan.comparacion.interesesAhorrados >= 0 ? 'var(--capital)' : 'var(--interest)' }}>
                    {plan.comparacion.interesesAhorrados >= 0 ? 'Ahorrado' : 'De más'}:{' '}
                    {money(Math.abs(plan.comparacion.interesesAhorrados), moneda)}
                  </div>
                </div>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                <div className="stat-cell">
                  <div className="stat-label">Total abonado real</div>
                  <div className="stat-value mono capital">{money(plan.comparacion.totalAbonado, moneda)}</div>
                </div>
                </Grid>
              </Grid>

              <div className="table-wrap" style={{ marginBottom: 32 }}>
                <table className="amort-table">
                  <thead>
                    <tr>
                      <th>Cuota</th>
                      <th>Concepto</th>
                      <th>Fecha real</th>
                      <th>Monto</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.pagos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.numeroCuota}</td>
                        <td>{p.concepto}</td>
                        <td>{dateEs(p.fechaPago)}</td>
                        <td className="col-capital">{money(p.monto, moneda)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            style={{ padding: '4px 8px', fontSize: 12 }}
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? '…' : 'Eliminar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
