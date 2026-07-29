import { Loan } from './loan.entity';
import { AbonoDefinition, PlanPagos } from '../services/amortization.service';

export interface SimulationProps {
  id?: number;
  loanId: number;
  userId: number;
  nombre: string;
  valorCuotaManual: number | null;
  compromisosAdicionales: AbonoDefinition[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Entidad de dominio Simulation: un escenario "qué pasaría si" sobre un
 * préstamo ya guardado (la "base"). Reutiliza monto/tasa/plazo/fecha de la
 * base sin poder modificarlos. Sus "compromisosAdicionales" se SUMAN al
 * "compromiso cuota extraordinaria" de la base (no lo reemplazan) — así una
 * simulación responde a "¿qué pasa si ADEMÁS agrego este abono?", no a
 * "¿qué pasa si empiezo de cero sin los compromisos que ya tenía?".
 */
export class Simulation {
  readonly id?: number;
  readonly loanId: number;
  readonly userId: number;
  readonly nombre: string;
  readonly valorCuotaManual: number | null;
  readonly compromisosAdicionales: AbonoDefinition[];
  readonly createdAt?: string;
  readonly updatedAt?: string;

  constructor(props: SimulationProps) {
    if (!props.nombre?.trim()) throw new Error('El nombre de la simulación es obligatorio.');

    this.id = props.id;
    this.loanId = props.loanId;
    this.userId = props.userId;
    this.nombre = props.nombre.trim();
    this.valorCuotaManual = props.valorCuotaManual ?? null;
    this.compromisosAdicionales = props.compromisosAdicionales ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Calcula el plan de pagos de este escenario: monto/tasa/plazo/fecha de
   * la base (inmutables), compromiso de la base + adicionales de la
   * simulación (se suman), y la cuota efectiva de la base salvo que la
   * simulación fije la suya propia.
   */
  calcularPlan(base: Loan): PlanPagos {
    const cuotaBase = base.calcularPlan().resumen.valorCuota;
    const cuotaEfectiva = this.valorCuotaManual ?? cuotaBase;

    const escenario = new Loan({
      userId: base.userId,
      nombre: this.nombre,
      monto: base.monto,
      tasaEfectivaAnual: base.tasaEfectivaAnual,
      numeroCuotas: base.numeroCuotas,
      mesInicioAmortizacion: base.mesInicioAmortizacion,
      valorCuotaManual: cuotaEfectiva,
      compromisosCuotaExtraordinaria: [...base.compromisosCuotaExtraordinaria, ...this.compromisosAdicionales],
      numeroCuotaInicial: base.numeroCuotaInicial,
    });
    return escenario.calcularPlan();
  }
}
