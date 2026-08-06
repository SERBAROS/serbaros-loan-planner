import { useLayoutEffect, useRef, useState, useEffect, ChangeEvent } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { getCurrency } from '../currencies';

interface CurrencyInputProps {
  id?: string;
  value: string; // valor numérico crudo, ej. "75000000" o "75000000.5"
  onChange: (rawValue: string) => void;
  currencyCode?: string;
  required?: boolean;
  placeholder?: string;
}

/** Formatea un número (como string con punto decimal) a "75.000.000,50" */
function formatDisplay(raw: string, decimals: number): string {
  if (!raw) return '';
  const negative = raw.startsWith('-');
  const clean = raw.replace('-', '');
  const [intPart, decPart] = clean.split('.');
  const groupedInt = (intPart || '0').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let out = groupedInt;
  if (decimals > 0 && decPart !== undefined) {
    out += ',' + decPart.slice(0, decimals);
  }
  return (negative ? '-' : '') + out;
}

/** Convierte lo que el usuario tecleó (con puntos/comas) a un string numérico crudo "1234.5" */
function parseTyped(typed: string, decimals: number): string {
  let s = typed.replace(/[^\d,-]/g, ''); // solo dígitos, coma decimal y signo
  const negative = s.startsWith('-');
  s = s.replace(/-/g, '');
  const commaIndex = s.indexOf(',');
  let intPart = commaIndex === -1 ? s : s.slice(0, commaIndex);
  let decPart = commaIndex === -1 ? '' : s.slice(commaIndex + 1).replace(/,/g, '');
  intPart = intPart.replace(/^0+(?=\d)/, '');
  if (decimals > 0) {
    decPart = decPart.slice(0, decimals);
  } else {
    decPart = '';
  }
  const raw = (intPart || '0') + (decPart ? '.' + decPart : commaIndex !== -1 ? '.' : '');
  return (negative ? '-' : '') + raw;
}

function countSignificantBefore(text: string, caret: number): number {
  let count = 0;
  for (let i = 0; i < caret && i < text.length; i++) {
    if (/[0-9,-]/.test(text[i])) count++;
  }
  return count;
}

function caretAfterSignificant(text: string, significantCount: number): number {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (count >= significantCount) return i;
    if (/[0-9,-]/.test(text[i])) count++;
  }
  return text.length;
}

export default function CurrencyInput({ id, value, onChange, currencyCode = 'COP', required, placeholder }: CurrencyInputProps) {
  const currency = getCurrency(currencyCode);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const [display, setDisplay] = useState(() => formatDisplay(value, currency.decimals));

  useEffect(() => {
    setDisplay(formatDisplay(value, currency.decimals));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, currencyCode]);

  // Se ejecuta de forma síncrona justo después de que React actualiza el DOM
  // (antes de pintar) — a diferencia de requestAnimationFrame, esto siempre
  // termina antes de que llegue el siguiente evento de teclado, incluso
  // tecleando rápido. Misma lógica de antes, ahora sobre el <input> nativo
  // que vive dentro del TextField de MUI (accedido vía inputRef).
  useLayoutEffect(() => {
    if (pendingCaret.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
      pendingCaret.current = null;
    }
  }, [display]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    const significantBefore = countSignificantBefore(el.value, caret);

    const raw = parseTyped(el.value, currency.decimals);
    const formatted = formatDisplay(raw, currency.decimals);
    const finalRaw = raw.endsWith('.') ? raw.slice(0, -1) : raw;

    pendingCaret.current = caretAfterSignificant(formatted, significantBefore);
    setDisplay(formatted);
    onChange(finalRaw);
  }

  return (
    <TextField
      id={id}
      inputRef={inputRef}
      value={display}
      onChange={handleChange}
      required={required}
      placeholder={placeholder}
      size="small"
      fullWidth
      className="currency-input"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <span className="currency-input-symbol">{currency.symbol}</span>
            </InputAdornment>
          ),
        },
        htmlInput: {
          inputMode: 'decimal',
          autoComplete: 'off',
        },
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          fontFamily: 'var(--font-mono)',
        },
      }}
    />
  );
}
