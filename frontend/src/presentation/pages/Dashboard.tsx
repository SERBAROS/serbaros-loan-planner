import { useNavigate, useOutletContext } from 'react-router-dom';
import { LayoutOutletContext } from './Layout';

export default function Dashboard() {
  const navigate = useNavigate();
  const { loans } = useOutletContext<LayoutOutletContext>();

  return (
    <div className="panel-empty" style={{ flexDirection: 'column', gap: 14 }}>
      <div>
        {loans.length === 0
          ? 'Crea tu primer préstamo para ver la tabla de amortización.'
          : 'Selecciona un préstamo en la lista de la izquierda, o crea uno nuevo.'}
      </div>
      <button className="btn btn-primary" onClick={() => navigate('/prestamos/nuevo')}>
        + Nuevo préstamo
      </button>
    </div>
  );
}
