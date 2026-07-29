export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Lista completa de monedas ISO 4217, generada con las APIs nativas de
 * Intl (no tipeada a mano) — nombres en español, símbolo y número de
 * decimales reales de cada moneda (ej. JPY usa 0, USD/COP usan 2, KWD
 * usa 3), para que el formato y el input de captura sean correctos sin
 * mantener una tabla propia que se pueda desactualizar.
 */
export const WORLD_CURRENCIES: Currency[] = Intl.supportedValuesOf('currency')
  .map((code): Currency => {
    const nf = new Intl.NumberFormat('es-CO', { style: 'currency', currency: code });
    const symbol = nf.formatToParts(0).find((p) => p.type === 'currency')?.value ?? code;
    const decimals = nf.resolvedOptions().maximumFractionDigits ?? 2;
    let name = code;
    try {
      name = new Intl.DisplayNames(['es'], { type: 'currency' }).of(code) ?? code;
    } catch {
      // sin nombre legible disponible, se deja el código
    }
    return { code, name, symbol, decimals };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

const BY_CODE = new Map(WORLD_CURRENCIES.map((c) => [c.code, c]));

export function getCurrency(code: string): Currency {
  return BY_CODE.get(code) ?? { code, name: code, symbol: code, decimals: 2 };
}
