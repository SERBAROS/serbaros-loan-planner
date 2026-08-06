import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { AppBar, Toolbar, Drawer, IconButton, Box, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import { composition } from '../../infrastructure/composition-root';
import { LoanListItem } from '../../domain/entities/loan';
import { money } from '../format';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import ThemeSwitcher from '../components/ThemeSwitcher';

export interface LayoutOutletContext {
  loans: LoanListItem[];
  refresh: () => Promise<void>;
}

const DRAWER_WIDTH = 300;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [loans, setLoans] = useState<LoanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width:860px)');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await composition.listLoansUseCase.execute();
      setLoans(data);
      setError('');
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
    navigate('/entrar');
  }

  function goTo(path: string) {
    navigate(path);
    setMobileOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <span className="sidebar-title">Tus préstamos</span>
        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => goTo('/prestamos/nuevo')}>
          + Nuevo
        </button>
      </div>

      <div className="loan-list">
        {loading && <div className="empty-sidebar">Cargando…</div>}
        {!loading && error && <div className="empty-sidebar">{error}</div>}
        {!loading && !error && loans.length === 0 && (
          <div className="empty-sidebar">
            Aún no tienes préstamos registrados. Crea el primero para ver su tabla de amortización.
          </div>
        )}
        {!loading &&
          loans.map((loan) => (
            <button
              key={loan.id}
              className={`loan-item${String(loan.id) === activeId ? ' active' : ''}`}
              onClick={() => goTo(`/prestamos/${loan.id}`)}
            >
              <div className="loan-item-name">
                {loan.nombre}
                {loan.estado === 'EN_EJECUCION' && (
                  <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--brass)', fontWeight: 400 }}>● en ejecución</span>
                )}
              </div>
              <div className="loan-item-meta">
                <span>{loan.resumen?.numeroCuotasReales ?? '—'} cuotas</span>
                <span className="mono">{money(loan.resumen?.valorCuota, loan.moneda)}</span>
              </div>
            </button>
          ))}
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <AppBar position="static" component="header" className="topbar" sx={{ display: 'grid', gridTemplateColumns: isMobile ? 'auto 1fr' : '300px 1fr', height: 'auto' }}>
        <Toolbar className="topbar-brand" sx={{ minHeight: '76px !important' }}>
          {isMobile && (
            <IconButton aria-label="Abrir menú de préstamos" onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: 'inherit' }}>
              <MenuIcon />
            </IconButton>
          )}
          <Logo variant="horizontal" height={40} />
        </Toolbar>
        <Toolbar className="topbar-content" sx={{ minHeight: '76px !important' }}>
          <div className="brand">
            <div>
              <div className="brand-name">Loan Planner</div>
              <div className="brand-sub">Amortización de créditos</div>
            </div>
          </div>
          <div className="topbar-user">
            <ThemeSwitcher />
            <button className="btn btn-ghost" onClick={() => navigate('/configuracion')}>
              Configuración
            </button>
            <span>{user?.nombre || user?.email}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </Toolbar>
      </AppBar>

      <div className="layout">
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          >
            <Box className="sidebar" sx={{ border: 'none', maxHeight: 'none', height: '100%' }}>
              {sidebarContent}
            </Box>
          </Drawer>
        ) : (
          <aside className="sidebar">{sidebarContent}</aside>
        )}

        <main className="main-panel">
          <Outlet context={{ loans, refresh } satisfies LayoutOutletContext} />
          <Footer />
        </main>
      </div>
    </div>
  );
}
