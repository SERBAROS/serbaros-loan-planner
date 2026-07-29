/**
 * Tipos de dominio del préstamo. Reflejan la forma que expone la API,
 * pero viven en la capa de dominio porque son el lenguaje que usa
 * el resto de la aplicación (casos de uso, presentación) para hablar
 * de "qué es un préstamo" — sin saber nada de HTTP ni de React.
 */

export type UnidadPeriodo = 'MESES' | 'ANIOS';

export interface AbonoPuntual {
  id?: string;
  tipo: 'PUNTUAL';
  monto: number;
  numeroCuota?: number;
  fecha?: string;
}

export interface AbonoRecurrente {
  id?: string;
  tipo: 'RECURRENTE';
  monto: number;
  cada: number;
  unidad: UnidadPeriodo;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface AbonoGrupoRecurrenteItem {
  monto: number;
  cada: number;
  unidad: UnidadPeriodo;
  fechaInicio: string;
  fechaFin?: string | null;
}

export interface AbonoGrupoRecurrente {
  id?: string;
  tipo: 'GRUPO_RECURRENTE';
  nombre: string;
  items: AbonoGrupoRecurrenteItem[];
}

/**
 * Un "abono" es cualquiera de los 3 tipos. En el préstamo base se llama
 * "compromiso cuota extraordinaria"; en una simulación, "compromisos
 * adicionales" (se suman a los de la base, no los reemplazan).
 */
export type AbonoDefinition = AbonoPuntual | AbonoRecurrente | AbonoGrupoRecurrente;

export interface AmortizationRow {
  numeroCuota: number;
  saldoInicial: number;
  interes: number;
  capital: number;
  cuota: number;
  abonoExtra: number;
  saldoFinal: number;
  fecha: string;
}

export interface AnnualBalance {
  cuota: number;
  fecha: string;
  interesAcumulado: number;
}

export type EstadoPrestamo = 'NUEVO' | 'EN_EJECUCION';

export interface LoanSummary {
  monto: number;
  tasaEfectivaAnual: number;
  tasaMensual: number;
  numeroCuotasSolicitadas: number;
  numeroCuotasReales: number;
  numeroCuotaInicial: number;
  valorCuotaTeorica: number;
  valorCuota: number;
  esCuotaManual: boolean;
  mesInicioAmortizacion: string;
  totalIntereses: number;
  totalCapital: number;
  totalAbonosExtra: number;
  totalPagado: number;
}

export interface LoanListItem {
  id: number;
  nombre: string;
  estado: EstadoPrestamo;
  moneda: string;
  createdAt?: string;
  resumen?: LoanSummary;
  error?: string;
}

export interface LoanDetail {
  id: number;
  nombre: string;
  estado: EstadoPrestamo;
  moneda: string;
  createdAt?: string;
  compromisosCuotaExtraordinaria: AbonoDefinition[];
  resumen: LoanSummary;
  tabla: AmortizationRow[];
  saldosAnuales: AnnualBalance[];
}

export interface LoanInput {
  nombre: string;
  monto: number;
  tasaEfectivaAnual: number;
  numeroCuotas: number;
  mesInicioAmortizacion: string;
  valorCuotaManual?: number | null;
  compromisosCuotaExtraordinaria?: AbonoDefinition[];
  estado?: EstadoPrestamo;
  numeroCuotaInicial?: number;
  moneda?: string;
}

export type SimulateLoanInput = Omit<LoanInput, 'nombre'>;

export interface SimulatedPlan {
  resumen: LoanSummary;
  tabla: AmortizationRow[];
  saldosAnuales: AnnualBalance[];
}

/**
 * Simulación guardada: un escenario "qué pasaría si" sobre un préstamo ya
 * existente (la "base"). Hereda monto/tasa/plazo/fecha de la base — solo
 * agrega compromisos adicionales, que se suman a los de la base.
 */
export interface SimulationComparison {
  interesesAhorrados: number;
  cuotasAdelantadas: number;
  totalAbonado: number;
}

export interface SimulationListItem {
  id: number;
  nombre: string;
  createdAt?: string;
  resumen?: LoanSummary;
  comparacion?: SimulationComparison;
  error?: string;
}

export interface SimulationsList {
  base: LoanSummary;
  moneda: string;
  simulations: SimulationListItem[];
}

export interface SimulationDetail {
  id: number;
  loanId: number;
  nombre: string;
  moneda: string;
  createdAt?: string;
  valorCuotaManual: number | null;
  compromisosAdicionales: AbonoDefinition[];
  base: LoanSummary;
  comparacion: SimulationComparison;
  resumen: LoanSummary;
  tabla: AmortizationRow[];
  saldosAnuales: AnnualBalance[];
}

export interface SimulationInput {
  nombre: string;
  valorCuotaManual?: number | null;
  compromisosAdicionales?: AbonoDefinition[];
}

/**
 * Pago real: un registro de que un abono/cuota extra REALMENTE se pagó,
 * con su fecha real. Se acumulan en el tiempo (ledger), a diferencia de
 * una simulación que se edita como un todo. Sirven para llevar el plan
 * "real" del préstamo y compararlo contra la estimación y las simulaciones.
 */
export interface RealPaymentEntry {
  id: number;
  numeroCuota: number;
  monto: number;
  concepto: string;
  fechaPago: string;
  createdAt?: string;
}

export interface RealPaymentPlan {
  base: LoanSummary;
  moneda: string;
  comparacion: SimulationComparison;
  pagos: RealPaymentEntry[];
  resumen: LoanSummary;
  tabla: AmortizationRow[];
  saldosAnuales: AnnualBalance[];
}

export interface RealPaymentInput {
  numeroCuota: number;
  monto: number;
  concepto: string;
  fechaPago: string;
}
