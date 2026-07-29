/**
 * Conversión entre tasa efectiv anual (TEA) y tasa mensual equivalente,
 * trabajando siempre en porcentaje (12.25) en la UI y convirtiendo a
 * fracción (0.1225) solo al hablar con la API.
 */

export function fractionToPercent(fraction: number): number {
  return fraction * 100;
}

export function percentToFraction(percent: number): number {
  return percent / 100;
}

/** TEA (%) -> tasa mensual equivalente (%) */
export function teaPercentToMonthlyPercent(teaPercent: number): number {
  const teaFraction = percentToFraction(teaPercent);
  const monthlyFraction = Math.pow(1 + teaFraction, 1 / 12) - 1;
  return fractionToPercent(monthlyFraction);
}

/** Tasa mensual (%) -> TEA equivalente (%) */
export function monthlyPercentToTeaPercent(monthlyPercent: number): number {
  const monthlyFraction = percentToFraction(monthlyPercent);
  const teaFraction = Math.pow(1 + monthlyFraction, 12) - 1;
  return fractionToPercent(teaFraction);
}

/** Redondea a un número razonable de decimales para mostrar en un input. */
export function roundForInput(value: number, decimals = 4): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
