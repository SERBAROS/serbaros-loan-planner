import Logo from './Logo';
import { useCookieConsent } from '../context/CookieConsentContext';
import { useLegalDialogs } from '../context/LegalDialogsContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const { openPreferences } = useCookieConsent();
  const { openTerms, openPrivacy } = useLegalDialogs();

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
        <Logo variant="principal" height={34} />
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
          SERBAROS DEVELOPING TECHNOLOGY
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <a onClick={openTerms} style={linkStyle}>
          Términos de uso
        </a>
        <a onClick={openPrivacy} style={linkStyle}>
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
