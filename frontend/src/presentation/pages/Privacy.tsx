import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Privacy() {
  const navigate = useNavigate();
  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', borderBottom: '1px solid var(--border-soft)' }}>
        <Logo variant="horizontal" height={32} />
        <a onClick={() => navigate(-1)} style={{ color: 'var(--brass)', cursor: 'pointer', fontSize: 13 }}>
          ‹ Volver
        </a>
      </Box>
    <div className="form-page" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 className="loan-title">Política de privacidad y cookies</h1>
      <p className="loan-subtitle" style={{ marginBottom: 24 }}>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

      <h2 className="form-section-title">1. Responsable del tratamiento</h2>
      <p className="loan-subtitle">
        [Completar: razón social / nombre, NIF, dirección y correo de contacto del responsable del tratamiento de
        datos — dato obligatorio bajo el RGPD que debe completarse antes de publicar].
      </p>

      <h2 className="form-section-title">2. Qué datos recogemos</h2>
      <ul style={{ color: 'var(--paper-dim)', lineHeight: 1.8, marginLeft: 20 }}>
        <li><strong>Datos de cuenta:</strong> correo electrónico, nombre (opcional), contraseña (almacenada cifrada, nunca en texto plano).</li>
        <li><strong>Datos de uso del servicio:</strong> los préstamos, simulaciones y pagos que registras — quedan asociados a tu cuenta y solo tú puedes verlos.</li>
        <li><strong>Preferencias:</strong> tema visual y moneda por defecto elegidos.</li>
      </ul>
      <p className="loan-subtitle">No solicitamos ni almacenamos datos bancarios reales (números de cuenta, tarjetas, etc.).</p>

      <h2 className="form-section-title">3. Base legal y finalidad</h2>
      <p className="loan-subtitle">
        Tratamos tus datos para poder prestarte el servicio (ejecución de un contrato/relación de uso), es decir,
        para guardar tus préstamos y calcular tus tablas de amortización. No usamos tus datos para fines distintos
        sin tu consentimiento explícito.
      </p>

      <h2 className="form-section-title">4. Cookies y tecnologías similares</h2>
      <p className="loan-subtitle">Distinguimos dos categorías:</p>

      <Box sx={{ border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '14px 18px', marginBottom: '14px' }}>
        <Typography sx={{ fontWeight: 700, color: 'var(--capital)', marginBottom: '4px' }}>
          Necesarias (siempre activas — no requieren consentimiento)
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'var(--paper-dim)', lineHeight: 1.6 }}>
          Usamos <code>localStorage</code> del navegador (técnicamente no es una cookie HTTP, pero cumple una función
          equivalente) para guardar tu sesión (token de acceso) y tu preferencia de tema visual. Sin esto, no
          podrías mantener la sesión iniciada. No se comparte con terceros.
        </Typography>
      </Box>

      <Box sx={{ border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '14px 18px', marginBottom: '14px' }}>
        <Typography sx={{ fontWeight: 700, color: 'var(--gold)', marginBottom: '4px' }}>
          Analíticas y publicitarias (requieren tu consentimiento previo)
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'var(--paper-dim)', lineHeight: 1.6 }}>
          Actualmente <strong>esta aplicación no tiene integrado ningún servicio de analítica ni publicidad</strong>{' '}
          (no hay Google Analytics, Google AdSense, ni píxeles de seguimiento activos). Si en el futuro se
          incorporan, no se cargará ningún script de este tipo hasta que aceptes esta categoría en el banner de
          cookies, y esta sección se actualizará para listar exactamente qué cookies, de qué proveedor, con qué
          duración y finalidad se instalan.
        </Typography>
      </Box>

      <p className="loan-subtitle">
        Puedes cambiar tu elección en cualquier momento desde "Preferencias de cookies" en el pie de página.
      </p>

      <h2 className="form-section-title">5. Con quién compartimos datos</h2>
      <p className="loan-subtitle">
        No vendemos ni compartimos tus datos con terceros con fines comerciales. Tus datos se almacenan en nuestra
        base de datos [completar: ubicación/proveedor del servidor] y solo el personal técnico estrictamente
        necesario tiene acceso a ellos, con fines de mantenimiento del servicio.
      </p>

      <h2 className="form-section-title">6. Cuánto tiempo conservamos tus datos</h2>
      <p className="loan-subtitle">
        Mientras mantengas tu cuenta activa. Puedes solicitar la eliminación de tu cuenta y todos tus datos
        asociados en cualquier momento (ver sección de derechos, abajo).
      </p>

      <h2 className="form-section-title">7. Tus derechos (RGPD)</h2>
      <p className="loan-subtitle">Como usuario en la Unión Europea, tienes derecho a:</p>
      <ul style={{ color: 'var(--paper-dim)', lineHeight: 1.8, marginLeft: 20 }}>
        <li><strong>Acceso:</strong> saber qué datos tenemos sobre ti.</li>
        <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
        <li><strong>Supresión ("derecho al olvido"):</strong> pedir que borremos tus datos.</li>
        <li><strong>Portabilidad:</strong> recibir tus datos en un formato reutilizable.</li>
        <li><strong>Oposición y limitación:</strong> oponerte a ciertos tratamientos.</li>
        <li><strong>Retirar el consentimiento</strong> de cookies no esenciales en cualquier momento.</li>
      </ul>
      <p className="loan-subtitle">
        Para ejercer estos derechos, contáctanos en [completar correo de contacto]. También puedes presentar una
        reclamación ante la Agencia Española de Protección de Datos (AEPD) si consideras que no hemos atendido tu
        solicitud correctamente.
      </p>

      <Box sx={{ marginTop: '32px', padding: '14px 18px', border: '1px dashed var(--border-soft)', borderRadius: '8px' }}>
        <Typography sx={{ fontSize: 12, color: 'var(--muted)' }}>
          Plantilla de referencia — completar los campos entre corchetes y revisar con asesoría legal antes de
          publicar en producción.
        </Typography>
      </Box>
    </div>
    </Box>
  );
}
