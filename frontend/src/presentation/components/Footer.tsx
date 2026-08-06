import Logo from './Logo';

export default function Footer() {
  const year = new Date().getFullYear();

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

      <span style={{ fontSize: 12, color: 'var(--muted)' }}>© {year} Serbaros · Loan Planner</span>
    </footer>
  );
}
