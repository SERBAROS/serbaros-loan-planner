import { ResumenPlanPagos } from './amortization.service';

/**
 * Resultado de comparar un plan (simulación o pago real) contra el plan
 * base/estimación de un préstamo. Centraliza el cálculo del "ahorro
 * generado por los abonos y cuotas extra" para que Simulaciones y Pago
 * Real usen exactamente la misma fórmula y sean comparables entre sí.
 */
export interface ComparacionPlan {
  interesesAhorrados: number;
  cuotasAdelantadas: number;
  totalAbonado: number;
}

export class PlanComparisonService {
  static comparar(base: ResumenPlanPagos, comparado: ResumenPlanPagos): ComparacionPlan {
    return {
      interesesAhorrados: round2(base.totalIntereses - comparado.totalIntereses),
      cuotasAdelantadas: base.numeroCuotasReales - comparado.numeroCuotasReales,
      totalAbonado: comparado.totalAbonosExtra,
    };
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
