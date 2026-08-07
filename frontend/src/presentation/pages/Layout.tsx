import { useCallback, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  Box,
  Avatar,
  Chip,
  useMediaQuery,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useAuth } from "../context/AuthContext";
import { composition } from "../../infrastructure/composition-root";
import { LoanListItem } from "../../domain/entities/loan";
import { money } from "../format";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import SettingsDrawer from "../components/SettingsDrawer";
import ProfileMenu from "../components/ProfileMenu";

export interface LayoutOutletContext {
  loans: LoanListItem[];
  refresh: () => Promise<void>;
}

const DRAWER_WIDTH = 300;

export default function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const [loans, setLoans] = useState<LoanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<HTMLElement | null>(null);

  const isMobile = useMediaQuery("(max-width:860px)");

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

  function handleDownloadTutorial() {
    const a = document.createElement("a");
    a.href = `${import.meta.env.BASE_URL}tutorial-serbaros-loan-planner.pdf`;
    a.download = "tutorial-serbaros-loan-planner.pdf";
    a.click();
  }

  function goTo(path: string) {
    navigate(path);
    setMobileOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <span className="sidebar-title">Tus préstamos</span>
        <button
          className="btn btn-primary"
          style={{ padding: "6px 12px", fontSize: 13 }}
          onClick={() => goTo("/prestamos/nuevo")}
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
              onClick={() => goTo(`/prestamos/${loan.id}`)}
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
                <span>{loan.resumen?.numeroCuotasReales ?? "—"} cuotas</span>
                <span className="mono">
                  {money(loan.resumen?.valorCuota, loan.moneda)}
                </span>
              </div>
            </button>
          ))}
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <AppBar
        position="static"
        component="header"
        className="topbar"
        sx={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "300px 1fr",
          height: "auto",
        }}
      >
        <Toolbar className="topbar-brand" sx={{ minHeight: "76px !important" }}>
          <Logo variant="horizontal" height={48} />
          {isMobile && (
            <Chip
              label="Préstamos"
              onClick={() => setMobileOpen(true)}
              clickable
              size="small"
              sx={{
                backgroundColor: "var(--brass)",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 12,
                "&:hover": { backgroundColor: "var(--brass-soft)" },
              }}
            />
          )}
        </Toolbar>
        <Toolbar
          className="topbar-content"
          sx={{ minHeight: "76px !important" }}
        >
          <div className="brand">
            <div>
              <div className="brand-name">Loan Planner</div>
              <div className="brand-sub">Amortización de créditos</div>
            </div>
          </div>
          <div className="topbar-user">
            <IconButton
              onClick={() => setSettingsOpen(true)}
              aria-label="Configuración"
              sx={{ color: "var(--muted)" }}
            >
              <SettingsIcon />
            </IconButton>
            <IconButton
              onClick={(e) => setProfileAnchor(e.currentTarget)}
              aria-label="Perfil"
              sx={{ padding: 0.4 }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  backgroundColor: "var(--brass)",
                  color: "var(--ink)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {(user?.nombre || user?.email || "?")
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>

      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onDownloadTutorial={handleDownloadTutorial}
      />
      <ProfileMenu
        anchorEl={profileAnchor}
        onClose={() => setProfileAnchor(null)}
      />

      <div className="layout">
        {isMobile ? (
          <Drawer
            anchor="right"
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
              },
            }}
          >
            <Box
              className="sidebar"
              sx={{ border: "none", maxHeight: "none", height: "100%" }}
            >
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
