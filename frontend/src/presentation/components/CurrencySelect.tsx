import { WORLD_CURRENCIES } from '../currencies';

interface CurrencySelectProps {
  id?: string;
  value: string;
  onChange: (code: string) => void;
}

export default function CurrencySelect({ id, value, onChange }: CurrencySelectProps) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
      {WORLD_CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.code} — {c.name} ({c.symbol})
        </option>
      ))}
    </select>
  );
}
