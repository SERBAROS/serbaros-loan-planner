import { Autocomplete, TextField } from '@mui/material';
import { WORLD_CURRENCIES } from '../currencies';

interface CurrencySelectProps {
  id?: string;
  value: string;
  onChange: (code: string) => void;
}

export default function CurrencySelect({ id, value, onChange }: CurrencySelectProps) {
  const selected = WORLD_CURRENCIES.find((c) => c.code === value);

  return (
    <Autocomplete
      id={id}
      disableClearable
      autoHighlight
      options={WORLD_CURRENCIES}
      value={selected}
      onChange={(_e, newValue) => {
        if (newValue) onChange(newValue.code);
      }}
      getOptionLabel={(c) => `${c.code} — ${c.name} (${c.symbol})`}
      isOptionEqualToValue={(a, b) => a.code === b.code}
      renderInput={(params) => <TextField {...params} placeholder="Buscar moneda…" size="small" />}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
        },
      }}
    />
  );
}
