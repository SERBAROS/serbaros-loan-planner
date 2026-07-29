import { useTheme, ThemeId } from '../context/ThemeContext';

const SWATCH_PREVIEW: Record<ThemeId, { bg: string; accent: string }> = {
  azul: { bg: '#05142d', accent: '#15aeb7' },
  oscuro: { bg: '#0a0d12', accent: '#15aeb7' },
  claro: { bg: '#f5f5f1', accent: '#0e8a92' },
};

export default function ThemeSwitcher() {
  const { theme, setTheme, options } = useTheme();

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {options.map((opt) => {
        const preview = SWATCH_PREVIEW[opt.id];
        const active = opt.id === theme;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            title={opt.label}
            aria-label={`Tema ${opt.label}`}
            aria-pressed={active}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: preview.bg,
              border: active ? `2px solid ${preview.accent}` : '1px solid var(--border)',
              boxShadow: active ? `0 0 0 2px ${preview.bg}` : 'none',
              cursor: 'pointer',
              padding: 0,
              position: 'relative',
              flex: 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: 4,
                borderRadius: '50%',
                background: preview.accent,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
