import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { composition } from "../../infrastructure/composition-root";
import { LoanListItem } from "../../domain/entities/loan";
import { money } from "../format";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export interface LayoutOutletContext {
  loans: LoanListItem[];
  refresh: () => Promise<void>;
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [loans, setLoans] = useState<LoanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await composition.listLoansUseCase.execute();
      setLoans(data);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleLogout() {
    logout();
    navigate("/entrar");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <Logo variant="horizontal" height={100} />
        </div>
        <div className="topbar-content">
          <div className="brand">
            <div>
              <div className="brand-name">Loan Planner</div>
              <div className="brand-sub">Amortización de créditos</div>
            </div>
          </div>
          <div className="topbar-user">
            <span>{user?.nombre || user?.email}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Tus préstamos</span>
            <button
              className="btn btn-primary"
              style={{ padding: "6px 12px", fontSize: 13 }}
              onClick={() => navigate("/prestamos/nuevo")}
            >
              + Nuevo
            </button>
          </div>

          <div className="loan-list">
            {loading && <div className="empty-sidebar">Cargando…</div>}
            {!loading && error && <div className="empty-sidebar">{error}</div>}
            {!loading && !error && loans.length === 0 && (
              <div className="empty-sidebar">
                Aún no tienes préstamos registrados. Crea el primero para ver su
                tabla de amortización.
              </div>
            )}
            {!loading &&
              loans.map((loan) => (
                <button
                  key={loan.id}
                  className={`loan-item${
                    String(loan.id) === activeId ? " active" : ""
                  }`}
                  onClick={() => navigate(`/prestamos/${loan.id}`)}
                >
                  <div className="loan-item-name">
                    {loan.nombre}
                    {loan.estado === "EN_EJECUCION" && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          color: "var(--brass)",
                          fontWeight: 400,
                        }}
                      >
                        ● en ejecución
                      </span>
                    )}
                  </div>
                  <div className="loan-item-meta">
                    <span>
                      {loan.resumen?.numeroCuotasReales ?? "—"} cuotas
                    </span>
                    <span className="mono">
                      {money(loan.resumen?.valorCuota, loan.moneda)}
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </aside>

        <main className="main-panel">
          <Outlet context={{ loans, refresh } satisfies LayoutOutletContext} />
        </main>
      </div>

      <Footer />
    </div>
  );
}
