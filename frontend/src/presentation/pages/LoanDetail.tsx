import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Grid, Box } from '@mui/material';
import { composition } from '../../infrastructure/composition-root';
import { LoanDetail as LoanDetailType, SimulationListItem } from '../../domain/entities/loan';
import { money, percent, dateEs } from '../format';
import { triggerBlobDownload } from '../download';
import { LayoutOutletContext } from './Layout';
import RealPaymentsSection from '../components/RealPaymentsSection';
import Tabs from '../components/Tabs';
import AnnualInterestCards from '../components/AnnualInterestCards';
import LoanChartsSection, { ChartSeriesDef } from '../components/LoanChartsSection';
import ExportDialog from '../components/ExportDialog';
import CollapsibleActions from '../components/CollapsibleActions';
import { useConfirm } from '../context/ConfirmDialogContext';

type LoanTab = 'resumen' | 'simulaciones' | 'pago-real' | 'tabla';

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refresh } = useOutletContext<LayoutOutletContext>();
  const confirm = useConfirm();

  const [loan, setLoan] = useState<LoanDetailType | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [simulations, setSimulations] = useState<SimulationListItem[]>([]);
  const [simulationsError, setSimulationsError] = useState('');
  const [deletingSimId, setDeletingSimId] = useState<number | null>(null);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);
  const [exportDialogFormat, setExportDialogFormat] = useState<'excel' | 'pdf' | null>(null);
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
    const ok = await confirm({
      title: 'Eliminar préstamo',
      message: `¿Eliminar "${loan.nombre}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
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
    const ok = await confirm({
      title: 'Eliminar simulación',
      message: `¿Eliminar la simulación "${nombre}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
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

  function handleExport(format: 'excel' | 'pdf') {
    setExportDialogFormat(format);
  }

  async function handleConfirmExport(format: 'excel' | 'pdf', options: { simulacionIds?: number[]; incluirTabla: boolean }) {
    if (!id) return;
    setExporting(format);
    try {
      const { blob, filename } = await composition.exportLoanUseCase.execute(Number(id), format, options);
      triggerBlobDownload(blob, filename);
      setExportDialogFormat(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExporting(null);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!loan) return <div className="panel-empty">Cargando…</div>;

  const { resumen, tabla, saldosAnuales } = loan;
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
        <CollapsibleActions
          actions={[
            { label: exporting === 'excel' ? 'Generando…' : 'Exportar Excel', onClick: () => handleExport('excel'), disabled: exporting !== null, icon: 'download' },
            { label: exporting === 'pdf' ? 'Generando…' : 'Exportar PDF', onClick: () => handleExport('pdf'), disabled: exporting !== null, icon: 'download' },
            { label: 'Editar', onClick: () => navigate(`/prestamos/${id}/editar`), icon: 'edit' },
            { label: deleting ? 'Eliminando…' : 'Eliminar', onClick: handleDelete, disabled: deleting, danger: true, icon: 'delete' },
          ]}
        />
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
      <Grid container spacing={0} className="stat-grid-mui">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Valor de la cuota</div>
          <div className="stat-value mono brass">{money(resumen.valorCuota, loan.moneda)}</div>
          {resumen.esCuotaManual && (
            <div className="stat-note">Ingresada manualmente (PMT sugerido: {money(resumen.valorCuotaTeorica, loan.moneda)})</div>
          )}
        </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Cuotas reales / solicitadas</div>
          <div className="stat-value mono">
            {resumen.numeroCuotasReales} / {resumen.numeroCuotasSolicitadas}
          </div>
        </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Total capital</div>
          <div className="stat-value mono capital">{money(resumen.totalCapital, loan.moneda)}</div>
        </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Total intereses</div>
          <div className="stat-value mono interest">{money(resumen.totalIntereses, loan.moneda)}</div>
        </div>
        </Grid>
        {resumen.totalAbonosExtra > 0 && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <div className="stat-cell">
            <div className="stat-label">Total abonos extra</div>
            <div className="stat-value mono capital">{money(resumen.totalAbonosExtra, loan.moneda)}</div>
          </div>
          </Grid>
        )}
      </Grid>

      <LoanChartsSection
        moneda={loan.moneda}
        fixedSeries={[{ id: 'estimado', label: 'Estimado', color: '#15AEB7', getTabla: () => tabla }] satisfies ChartSeriesDef[]}
      />

      <Box sx={{ marginTop: '24px' }}>
        <AnnualInterestCards saldosAnuales={saldosAnuales} tabla={tabla} moneda={loan.moneda} />
      </Box>
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
        <LoanChartsSection
          moneda={loan.moneda}
          pickerLabel="Simulaciones a comparar"
          fixedSeries={[{ id: 'base', label: 'Préstamo base', color: '#8C93A0', getTabla: () => tabla }] satisfies ChartSeriesDef[]}
          toggleableSeries={simulations.map((s, i) => ({
            id: `sim-${s.id}`,
            label: s.nombre,
            color: ['#15AEB7', '#FFEF00', '#C06A4C', '#8E7CC3', '#4C8BC0'][i % 5],
            defaultOn: true,
            getTabla: () => composition.getSimulationUseCase.execute(Number(id), s.id).then((d) => d.tabla),
          }))}
        />
      )}

      {simulations.length > 0 && (
        <Grid container spacing={2} className="stat-grid-mui stat-grid-cards" sx={{ marginBottom: '32px', background: 'none', border: 'none' }}>
          {simulations.map((sim) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sim.id}>
            <div className="stat-cell" style={{ cursor: 'pointer' }} onClick={() => navigate(`/prestamos/${id}/simulaciones/${sim.id}`)}>
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
            </Grid>
          ))}
        </Grid>
      )}
        </>
      )}

      {activeTab === 'pago-real' && (
        <>
          <LoanChartsSection
            moneda={loan.moneda}
            fixedSeries={
              [
                {
                  id: 'pagoreal',
                  label: 'Pago real',
                  color: '#5C9C78',
                  getTabla: () => composition.getRealPaymentPlanUseCase.execute(Number(id)).then((d) => d.tabla),
                },
                { id: 'estimado', label: 'Préstamo estimado', color: '#15AEB7', getTabla: () => tabla },
              ] satisfies ChartSeriesDef[]
            }
          />
          <RealPaymentsSection loanId={Number(id)} />
        </>
      )}

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

      <ExportDialog
        open={exportDialogFormat !== null}
        onClose={() => setExportDialogFormat(null)}
        format={exportDialogFormat}
        simulations={simulations}
        onConfirm={handleConfirmExport}
        loading={exporting !== null}
      />
    </div>
  );
}
