import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { composition } from '../../infrastructure/composition-root';
import { LoanDetail as LoanDetailType, SimulationListItem } from '../../domain/entities/loan';
import { money, percent, dateEs } from '../format';
import { triggerBlobDownload } from '../download';
import { LayoutOutletContext } from './Layout';
import RealPaymentsSection from '../components/RealPaymentsSection';
import Tabs from '../components/Tabs';

type LoanTab = 'resumen' | 'simulaciones' | 'pago-real' | 'tabla';

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useOutletContext<LayoutOutletContext>();

  const [loan, setLoan] = useState<LoanDetailType | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [simulations, setSimulations] = useState<SimulationListItem[]>([]);
  const [simulationsError, setSimulationsError] = useState('');
  const [deletingSimId, setDeletingSimId] = useState<number | null>(null);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);
  const [activeTab, setActiveTab] = useState<LoanTab>('resumen');

  useEffect(() => {
    setLoan(null);
    setError('');
    if (!id) return;
    composition.getLoanUseCase
      .execute(Number(id))
      .then(setLoan)
      .catch((err) => setError((err as Error).message));
  }, [id]);

  function loadSimulations() {
    if (!id) return;
    composition.listSimulationsUseCase
      .execute(Number(id))
      .then((data) => {
        setSimulations(data.simulations);
        setSimulationsError('');
      })
      .catch((err) => setSimulationsError((err as Error).message));
  }

  useEffect(loadSimulations, [id]);

  async function handleDelete() {
    if (!loan || !id) return;
    if (!window.confirm(`¿Eliminar "${loan.nombre}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      await composition.deleteLoanUseCase.execute(Number(id));
      await refresh();
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  async function handleDeleteSimulation(simId: number, nombre: string) {
    if (!id) return;
    if (!window.confirm(`¿Eliminar la simulación "${nombre}"?`)) return;
    setDeletingSimId(simId);
    try {
      await composition.deleteSimulationUseCase.execute(Number(id), simId);
      loadSimulations();
    } catch (err) {
      setSimulationsError((err as Error).message);
    } finally {
      setDeletingSimId(null);
    }
  }

  async function handleExport(format: 'excel' | 'pdf') {
    if (!id) return;
    setExporting(format);
    try {
      const { blob, filename } = await composition.exportLoanUseCase.execute(Number(id), format);
      triggerBlobDownload(blob, filename);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExporting(null);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!loan) return <div className="panel-empty">Cargando…</div>;

  const { resumen, tabla, saldosAnuales } = loan;
  const maxInteres = Math.max(...saldosAnuales.map((s) => s.interesAcumulado), 1);
  const yearMarks = new Set(saldosAnuales.map((s) => s.cuota));

  return (
    <div>
      <div className="loan-header">
        <div>
          <h1 className="loan-title">
            {loan.nombre}{' '}
            <span
              className="mono"
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-body)',
                padding: '3px 8px',
                borderRadius: 3,
                border: '1px solid var(--border)',
                color: loan.estado === 'EN_EJECUCION' ? 'var(--brass)' : 'var(--muted)',
                verticalAlign: 'middle',
                marginLeft: 8,
              }}
            >
              {loan.estado === 'EN_EJECUCION' ? 'En ejecución' : 'Nuevo'}
            </span>
          </h1>
          <div className="loan-subtitle">
            {money(resumen.monto, loan.moneda)} · TEA {percent(resumen.tasaEfectivaAnual)} · mensual {percent(resumen.tasaMensual)} · desde{' '}
            {dateEs(resumen.mesInicioAmortizacion)}
            {loan.estado === 'EN_EJECUCION' && <> · cuota actual: {resumen.numeroCuotaInicial}</>}
          </div>
        </div>
        <div className="loan-actions">
          <button className="btn" onClick={() => handleExport('excel')} disabled={exporting !== null}>
            {exporting === 'excel' ? 'Generando…' : 'Exportar Excel'}
          </button>
          <button className="btn" onClick={() => handleExport('pdf')} disabled={exporting !== null}>
            {exporting === 'pdf' ? 'Generando…' : 'Exportar PDF'}
          </button>
          <button className="btn" onClick={() => navigate(`/prestamos/${id}/editar`)}>
            Editar
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>

      <Tabs
        active={activeTab}
        onChange={(id) => setActiveTab(id as LoanTab)}
        tabs={[
          { id: 'resumen', label: 'Resumen' },
          { id: 'simulaciones', label: 'Simulaciones', badge: simulations.length },
          { id: 'pago-real', label: 'Pago real' },
          { id: 'tabla', label: 'Tabla de amortización' },
        ]}
      />

      {activeTab === 'resumen' && (
        <>
      <div className="stat-grid">
        <div className="stat-cell">
          <div className="stat-label">Valor de la cuota</div>
          <div className="stat-value mono brass">{money(resumen.valorCuota, loan.moneda)}</div>
          {resumen.esCuotaManual && (
            <div className="stat-note">Ingresada manualmente (PMT sugerido: {money(resumen.valorCuotaTeorica, loan.moneda)})</div>
          )}
        </div>
        <div className="stat-cell">
          <div className="stat-label">Cuotas reales / solicitadas</div>
          <div className="stat-value mono">
            {resumen.numeroCuotasReales} / {resumen.numeroCuotasSolicitadas}
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Total capital</div>
          <div className="stat-value mono capital">{money(resumen.totalCapital, loan.moneda)}</div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Total intereses</div>
          <div className="stat-value mono interest">{money(resumen.totalIntereses, loan.moneda)}</div>
        </div>
        {resumen.totalAbonosExtra > 0 && (
          <div className="stat-cell">
            <div className="stat-label">Total abonos extra</div>
            <div className="stat-value mono capital">{money(resumen.totalAbonosExtra, loan.moneda)}</div>
          </div>
        )}
      </div>

      {saldosAnuales.length > 0 && (
        <div className="ledger-ribbon">
          <div className="ledger-ribbon-label">Interés acumulado por año (cada 12 cuotas)</div>
          <div className="ledger-track">
            {saldosAnuales.map((s) => (
              <div key={s.cuota} className="ledger-year" title={`Cuota ${s.cuota} · ${dateEs(s.fecha)}`}>
                <div
                  className="ledger-year-fill"
                  style={{ width: `${Math.max(6, (s.interesAcumulado / maxInteres) * 100)}%` }}
                />
                <div className="ledger-year-label">
                  <span className="ledger-year-date">{dateEs(s.fecha)}</span>
                  <span className="ledger-year-value">{money(s.interesAcumulado, loan.moneda)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'simulaciones' && (
        <>
      <div className="loan-header" style={{ marginBottom: 16 }}>
        <div>
          <h2 className="form-section-title" style={{ margin: 0 }}>
            Simulaciones
          </h2>
          <p className="loan-subtitle" style={{ marginTop: 4 }}>
            Escenarios sobre este préstamo: mismo monto, tasa y plazo, con abonos o cuotas extra distintas.
          </p>
        </div>
        <div className="loan-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/prestamos/${id}/simulaciones/nueva`)}>
            + Nueva simulación
          </button>
        </div>
      </div>

      {simulationsError && <div className="error-box">{simulationsError}</div>}

      {simulations.length === 0 && !simulationsError && (
        <p className="field-hint" style={{ marginBottom: 32 }}>
          Aún no tienes simulaciones para este préstamo.
        </p>
      )}

      {simulations.length > 0 && (
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', marginBottom: 32 }}>
          {simulations.map((sim) => (
            <div className="stat-cell" key={sim.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/prestamos/${id}/simulaciones/${sim.id}`)}>
              <div className="stat-label">{sim.nombre}</div>
              {sim.resumen && sim.comparacion ? (
                <>
                  <div className="stat-value mono brass">{money(sim.resumen.valorCuota, loan.moneda)}</div>
                  <div className="stat-note" style={{ color: sim.comparacion.interesesAhorrados >= 0 ? 'var(--capital)' : 'var(--interest)' }}>
                    {sim.comparacion.interesesAhorrados >= 0 ? '−' : '+'}
                    {money(Math.abs(sim.comparacion.interesesAhorrados), loan.moneda)} en intereses
                  </div>
                  <div className="stat-note">
                    {sim.comparacion.cuotasAdelantadas > 0
                      ? `${sim.comparacion.cuotasAdelantadas} cuotas antes`
                      : sim.comparacion.cuotasAdelantadas < 0
                        ? `${Math.abs(sim.comparacion.cuotasAdelantadas)} cuotas después`
                        : 'mismo plazo'}
                  </div>
                </>
              ) : (
                <div className="stat-note">{sim.error || 'No se pudo calcular'}</div>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: 10, padding: '4px 8px', fontSize: 12 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSimulation(sim.id, sim.nombre);
                }}
                disabled={deletingSimId === sim.id}
              >
                {deletingSimId === sim.id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {activeTab === 'pago-real' && <RealPaymentsSection loanId={Number(id)} />}

      {activeTab === 'tabla' && (
      <div className="table-wrap">
        <div className="table-scroll">
          <table className="amort-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Fecha</th>
                <th>Saldo inicial</th>
                <th>Interés</th>
                <th>Capital</th>
                <th>Cuota</th>
                <th>Abono extra</th>
                <th>Saldo final</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((fila) => (
                <tr key={fila.numeroCuota} className={yearMarks.has(fila.numeroCuota) ? 'year-mark' : ''}>
                  <td>{fila.numeroCuota}</td>
                  <td>{dateEs(fila.fecha)}</td>
                  <td>{money(fila.saldoInicial, loan.moneda)}</td>
                  <td className="col-interes">{money(fila.interes, loan.moneda)}</td>
                  <td className="col-capital">{money(fila.capital, loan.moneda)}</td>
                  <td>{money(fila.cuota, loan.moneda)}</td>
                  <td className="col-capital">{fila.abonoExtra ? money(fila.abonoExtra, loan.moneda) : '—'}</td>
                  <td>{money(fila.saldoFinal, loan.moneda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
