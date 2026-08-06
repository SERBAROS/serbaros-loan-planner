import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  variant?: 'horizontal' | 'principal';
  height?: number;
  className?: string;
}

export default function Logo({ variant = 'horizontal', height = 32, className }: LogoProps) {
  const { theme, options } = useTheme();
  const useLightLogo = options.find((o) => o.id === theme)?.useLightLogo ?? true;
  const tone = useLightLogo ? 'oscuro' : 'claro'; // "oscuro" = logo blanco (para fondos oscuros)
  const src = `/brand/logo-${variant}-${tone}.png`;

  return <img src={src} alt="Serbaros" height={height} className={className} style={{ display: 'block', height, width: 'auto' }} />;
}
