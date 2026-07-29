import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { composition } from '../../infrastructure/composition-root';
import { SimulationDetail as SimulationDetailType } from '../../domain/entities/loan';
import { money, dateEs } from '../format';

export default function SimulationDetail() {
  const { id, simId } = useParams();
  const navigate = useNavigate();
  const loanId = Number(id);

  const [sim, setSim] = useState<SimulationDetailType | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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
    if (!window.confirm(`¿Eliminar la simulación "${sim.nombre}"?`)) return;
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
  const maxInteres = Math.max(...saldosAnuales.map((s) => s.interesAcumulado), 1);
  const yearMarks = new Set(saldosAnuales.map((s) => s.cuota));

  return (
    <div>
      <div className="loan-header">
        <div>
          <h1 className="loan-title">{sim.nombre}</h1>
          <div className="loan-subtitle">
            Simulación sobre el préstamo base ·{' '}
            <a onClick={() => navigate(`/prestamos/${loanId}`)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              ver préstamo original
            </a>
          </div>
        </div>
        <div className="loan-actions">
          <button className="btn" onClick={() => navigate(`/prestamos/${loanId}/simulaciones/${simId}/editar`)}>
            Editar
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-cell">
          <div className="stat-label">Valor de la cuota</div>
          <div className="stat-value mono brass">{money(resumen.valorCuota, sim.moneda)}</div>
        </div>
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
        <div className="stat-cell">
          <div className="stat-label">Total intereses (base: {money(base.totalIntereses, sim.moneda)})</div>
          <div className="stat-value mono interest">{money(resumen.totalIntereses, sim.moneda)}</div>
          <div className="stat-note" style={{ color: comparacion.interesesAhorrados >= 0 ? 'var(--capital)' : 'var(--interest)' }}>
            {comparacion.interesesAhorrados >= 0 ? 'Ahorras' : 'Pagas de más'}: {money(Math.abs(comparacion.interesesAhorrados), sim.moneda)}
          </div>
        </div>
        <div className="stat-cell">
          <div className="stat-label">Total abonado extra</div>
          <div className="stat-value mono capital">{money(comparacion.totalAbonado, sim.moneda)}</div>
        </div>
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
                  <span className="ledger-year-value">{money(s.interesAcumulado, sim.moneda)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
    </div>
  );
}
