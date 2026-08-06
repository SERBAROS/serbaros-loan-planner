import { Dialog, DialogContent, DialogTitle, IconButton, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useLegalDialogs } from '../context/LegalDialogsContext';

export default function LegalDialogs() {
  const { active, close } = useLegalDialogs();

  return (
    <Dialog
      open={active !== null}
      onClose={close}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { backgroundColor: 'var(--surface)', border: '1px solid var(--border-soft)', maxHeight: '85vh' } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-display)', color: 'var(--paper)' }}>
        {active === 'terminos' ? 'Términos de uso' : 'Política de privacidad y cookies'}
        <IconButton onClick={close} sx={{ color: 'var(--muted)' }} aria-label="Cerrar">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'var(--border-soft)' }}>
        {active === 'terminos' && <TermsContent />}
        {active === 'privacidad' && <PrivacyContent />}
      </DialogContent>
    </Dialog>
  );
}

function TermsContent() {
  return (
    <Box>
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
    
    </Box>
  );
}

function PrivacyContent() {
  return (
    <Box>
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
    
    </Box>
  );
}
