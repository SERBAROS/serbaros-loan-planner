import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useCookieConsent } from '../context/CookieConsentContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const { openPreferences } = useCookieConsent();

  const linkStyle: React.CSSProperties = { color: 'var(--muted)', cursor: 'pointer', fontSize: 12, textDecoration: 'none' };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-soft)',
        marginTop: 32,
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Logo variant="horizontal" height={28} />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
          }}
        >
          Developing Technology
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <a onClick={() => navigate('/terminos')} style={linkStyle}>
          Términos de uso
        </a>
        <a onClick={() => navigate('/privacidad')} style={linkStyle}>
          Privacidad
        </a>
        <a onClick={openPreferences} style={linkStyle}>
          Preferencias de cookies
        </a>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>© {year} Serbaros · Loan Planner</span>
      </div>
    </footer>
  );
}
