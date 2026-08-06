import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Terms() {
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
      <h1 className="loan-title">Términos de uso</h1>
      <p className="loan-subtitle" style={{ marginBottom: 24 }}>Última actualización: {new Date().toLocaleDateString('es-ES')}</p>

      <Box
        sx={{
          backgroundColor: 'color-mix(in srgb, var(--interest) 12%, var(--surface))',
          border: '1px solid var(--interest)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '28px',
        }}
      >
        <Typography sx={{ fontWeight: 700, color: 'var(--paper)', marginBottom: '6px' }}>
          Aviso importante: esto no es asesoramiento financiero ni legal
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'var(--paper-dim)', lineHeight: 1.6 }}>
          Serbaros Loan Planner es una herramienta de <strong>cálculo y simulación informativa</strong>. Los resultados
          que muestra (cuotas, tablas de amortización, comparaciones de intereses, proyecciones de simulaciones) son
          estimaciones matemáticas basadas exclusivamente en los datos que tú ingresas. No constituyen, ni deben
          interpretarse como, una oferta de crédito, una recomendación de inversión, ni asesoramiento financiero,
          contable, fiscal o legal de ningún tipo. Las condiciones reales de cualquier producto financiero
          (tasas, comisiones, seguros asociados, condiciones de prepago) las define exclusivamente la entidad
          financiera correspondiente, y pueden diferir de lo calculado aquí. Antes de tomar decisiones financieras,
          consulta con tu entidad bancaria y, si lo consideras necesario, con un asesor financiero o legal
          cualificado.
        </Typography>
      </Box>

      <h2 className="form-section-title">1. Aceptación de estos términos</h2>
      <p className="loan-subtitle">
        Al crear una cuenta y usar Serbaros Loan Planner ("la aplicación", "el servicio") aceptas estos términos de
        uso en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar el servicio.
      </p>

      <h2 className="form-section-title">2. Qué es (y qué no es) el servicio</h2>
      <p className="loan-subtitle">
        El servicio permite registrar préstamos, calcular tablas de amortización, crear simulaciones hipotéticas de
        abonos extra, y llevar un histórico de pagos reales, con fines de planificación personal. El motor de
        cálculo replica fórmulas financieras estándar (interés compuesto, sistema de amortización francés), pero:
      </p>
      <ul style={{ color: 'var(--paper-dim)', lineHeight: 1.8, marginLeft: 20 }}>
        <li>No verifica ni valida la información contra ninguna entidad financiera real.</li>
        <li>No garantiza que el resultado coincida con lo que ofrecería un banco u otra entidad de crédito.</li>
        <li>No considera impuestos, seguros, comisiones bancarias u otros costos asociados a un crédito real, salvo que tú mismo los incluyas manualmente en los datos.</li>
        <li>Depende enteramente de la exactitud de los datos que ingreses (monto, tasa, plazo, abonos).</li>
      </ul>

      <h2 className="form-section-title">3. Cuentas de usuario</h2>
      <p className="loan-subtitle">
        Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad que ocurra bajo tu
        cuenta. Debes proporcionar información veraz al registrarte.
      </p>

      <h2 className="form-section-title">4. Limitación de responsabilidad</h2>
      <p className="loan-subtitle">
        En la máxima medida permitida por la ley, Serbaros no será responsable por decisiones financieras que tomes
        basándote en los cálculos de esta aplicación, ni por pérdidas directas o indirectas derivadas del uso del
        servicio, incluyendo errores de cálculo, interrupciones del servicio, o pérdida de datos.
      </p>

      <h2 className="form-section-title">5. Cambios a estos términos</h2>
      <p className="loan-subtitle">
        Podemos actualizar estos términos ocasionalmente. Te notificaremos de cambios sustanciales por correo o
        dentro de la aplicación.
      </p>

      <h2 className="form-section-title">6. Contacto</h2>
      <p className="loan-subtitle">
        Para preguntas sobre estos términos, contáctanos en el correo indicado en la Política de Privacidad.
      </p>

      <Box sx={{ marginTop: '32px', padding: '14px 18px', border: '1px dashed var(--border-soft)', borderRadius: '8px' }}>
        <Typography sx={{ fontSize: 12, color: 'var(--muted)' }}>
          Plantilla de referencia — revisar con asesoría legal antes de publicar en producción.
        </Typography>
      </Box>
    </div>
    </Box>
  );
}
