import { useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { Grid, Box } from '@mui/material';
import { composition } from '../../infrastructure/composition-root';
import { SimulationDetail as SimulationDetailType } from '../../domain/entities/loan';
import { money, dateEs } from '../format';
import Tabs from '../components/Tabs';
import AnnualInterestCards from '../components/AnnualInterestCards';
import LoanChartsSection, { ChartSeriesDef } from '../components/LoanChartsSection';
import { useConfirm } from '../context/ConfirmDialogContext';
import { LayoutOutletContext } from './Layout';
import CollapsibleActions from '../components/CollapsibleActions';

type SimTab = 'resumen' | 'tabla';

export default function SimulationDetail() {
  const { id, simId } = useParams();
  const navigate = useNavigate();
  const loanId = Number(id);
  const confirm = useConfirm();
  const { loans } = useOutletContext<LayoutOutletContext>();
  const loanNombre = loans.find((l) => l.id === loanId)?.nombre;

  const [sim, setSim] = useState<SimulationDetailType | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<SimTab>('resumen');

  useEffect(() => {
    setSim(null);
    setError('');
    if (!simId) return;
    composition.getSimulationUseCase
      .execute(loanId, Number(simId))
      .then(setSim)
      .catch((err) => setError((err as Error).message));
  }, [loanId, simId]);

  async function handleDelete() {
    if (!sim || !simId) return;
    const ok = await confirm({
      title: 'Eliminar simulación',
      message: `¿Eliminar la simulación "${sim.nombre}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await composition.deleteSimulationUseCase.execute(loanId, Number(simId));
      navigate(`/prestamos/${loanId}`);
    } catch (err) {
      setError((err as Error).message);
      setDeleting(false);
    }
  }

  if (error) return <div className="error-box">{error}</div>;
  if (!sim) return <div className="panel-empty">Cargando…</div>;

  const { resumen, tabla, saldosAnuales, comparacion, base } = sim;
  const yearMarks = new Set(saldosAnuales.map((s) => s.cuota));

  return (
    <div>
      <div className="loan-header">
        <div>
          <h1 className="loan-title">{sim.nombre}</h1>
          <div className="loan-subtitle">
            Simulación sobre el préstamo base ·{' '}
            <a
              onClick={() => navigate(`/prestamos/${loanId}`)} title="Ir al préstamo"
              style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 700, color: 'var(--paper)' }}
            >
                 {loanNombre?.toUpperCase() ?? 'ver préstamo original'}
            </a>
          </div>
        </div>
        <CollapsibleActions
          actions={[
            { label: 'Editar', onClick: () => navigate(`/prestamos/${loanId}/simulaciones/${simId}/editar`), icon: 'edit' },
            { label: deleting ? 'Eliminando…' : 'Eliminar', onClick: handleDelete, disabled: deleting, danger: true, icon: 'delete' },
          ]}
        />
      </div>

      <Tabs
        active={activeTab}
        onChange={(id) => setActiveTab(id as SimTab)}
        tabs={[
          { id: 'resumen', label: 'Resumen' },
          { id: 'tabla', label: 'Tabla de amortización' },
        ]}
      />

      {activeTab === 'resumen' && (
        <>
      <Grid container spacing={0} className="stat-grid-mui">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Valor de la cuota</div>
          <div className="stat-value mono brass">{money(resumen.valorCuota, sim.moneda)}</div>
        </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Cuotas reales (base: {base.numeroCuotasReales})</div>
          <div className="stat-value mono">{resumen.numeroCuotasReales}</div>
          <div className="stat-note" style={{ color: comparacion.cuotasAdelantadas >= 0 ? 'var(--capital)' : 'var(--interest)' }}>
            {comparacion.cuotasAdelantadas > 0
              ? `${comparacion.cuotasAdelantadas} cuotas antes que la base`
              : comparacion.cuotasAdelantadas < 0
                ? `${Math.abs(comparacion.cuotasAdelantadas)} cuotas después que la base`
                : 'mismo plazo que la base'}
          </div>
        </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Total intereses (base: {money(base.totalIntereses, sim.moneda)})</div>
          <div className="stat-value mono interest">{money(resumen.totalIntereses, sim.moneda)}</div>
          <div className="stat-note" style={{ color: comparacion.interesesAhorrados >= 0 ? 'var(--capital)' : 'var(--interest)' }}>
            {comparacion.interesesAhorrados >= 0 ? 'Ahorras' : 'Pagas de más'}: {money(Math.abs(comparacion.interesesAhorrados), sim.moneda)}
          </div>
        </div>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <div className="stat-cell">
          <div className="stat-label">Total abonado extra</div>
          <div className="stat-value mono capital">{money(comparacion.totalAbonado, sim.moneda)}</div>
        </div>
        </Grid>
      </Grid>

      <LoanChartsSection
        moneda={sim.moneda}
        fixedSeries={
          [
            { id: 'simulacion', label: sim.nombre, color: '#15AEB7', getTabla: () => tabla },
            {
              id: 'base',
              label: 'Préstamo base',
              color: '#8C93A0',
              getTabla: () => composition.getLoanUseCase.execute(loanId).then((d) => d.tabla),
            },
          ] satisfies ChartSeriesDef[]
        }
      />

      <Box sx={{ marginTop: '24px' }}>
        <AnnualInterestCards saldosAnuales={saldosAnuales} tabla={tabla} moneda={sim.moneda} />
      </Box>
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
                  <td>{money(fila.saldoInicial, sim.moneda)}</td>
                  <td className="col-interes">{money(fila.interes, sim.moneda)}</td>
                  <td className="col-capital">{money(fila.capital, sim.moneda)}</td>
                  <td>{money(fila.cuota, sim.moneda)}</td>
                  <td className="col-capital">{fila.abonoExtra ? money(fila.abonoExtra, sim.moneda) : '—'}</td>
                  <td>{money(fila.saldoFinal, sim.moneda)}</td>
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
