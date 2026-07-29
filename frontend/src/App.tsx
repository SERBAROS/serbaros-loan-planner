import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './presentation/context/AuthContext';
import Login from './presentation/pages/Login';
import Register from './presentation/pages/Register';
import Layout from './presentation/pages/Layout';
import Dashboard from './presentation/pages/Dashboard';
import LoanForm from './presentation/pages/LoanForm';
import LoanDetail from './presentation/pages/LoanDetail';
import SimulationForm from './presentation/pages/SimulationForm';
import SimulationDetail from './presentation/pages/SimulationDetail';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/entrar" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="prestamos/nuevo" element={<LoanForm mode="create" />} />
        <Route path="prestamos/:id" element={<LoanDetail />} />
        <Route path="prestamos/:id/editar" element={<LoanForm mode="edit" />} />
        <Route path="prestamos/:id/simulaciones/nueva" element={<SimulationForm mode="create" />} />
        <Route path="prestamos/:id/simulaciones/:simId" element={<SimulationDetail />} />
        <Route path="prestamos/:id/simulaciones/:simId/editar" element={<SimulationForm mode="edit" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
