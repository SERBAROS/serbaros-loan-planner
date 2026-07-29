const formatterCache = new Map<string, Intl.NumberFormat>();

function getMoneyFormatter(currencyCode: string): Intl.NumberFormat {
  let fmt = formatterCache.get(currencyCode);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: currencyCode });
    } catch {
      fmt = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
    }
    formatterCache.set(currencyCode, fmt);
  }
  return fmt;
}

const percentFmt = new Intl.NumberFormat('es-CO', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value: number | null | undefined, currencyCode: string = 'COP'): string {
  if (value == null || Number.isNaN(value)) return '—';
  return getMoneyFormatter(currencyCode).format(value);
}

export function percent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return percentFmt.format(value);
}

export function dateEs(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  const d = new Date(`${isoDate}T00:00:00Z`);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: '2-digit', timeZone: 'UTC' });
}
