import { AbonoDefinition, AmortizationDomainService, PlanPagos } from '../services/amortization.service';

export type EstadoPrestamo = 'NUEVO' | 'EN_EJECUCION';

const CODIGO_MONEDA_REGEX = /^[A-Z]{3}$/;

export interface LoanProps {
  id?: number;
  userId: number;
  nombre: string;
  monto: number;
  tasaEfectivaAnual: number;
  numeroCuotas: number;
  mesInicioAmortizacion: string;
  valorCuotaManual: number | null;
  compromisosCuotaExtraordinaria?: AbonoDefinition[];
  estado?: EstadoPrestamo;
  numeroCuotaInicial?: number;
  moneda?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Entidad de dominio Loan (préstamo). Encapsula sus propios invariantes y
 * delega el cálculo del plan de pagos en el servicio de dominio.
 *
 * "compromisosCuotaExtraordinaria" es el conjunto de abonos extra que el
 * usuario configuró sobre ESTE préstamo (puntuales, recurrentes, o grupos
 * de recurrentes) — reemplaza los antiguos campos fijos "cuotaPrimas" /
 * "cuotaCesantias" (que asumían meses hardcodeados) por un sistema general
 * donde el usuario define la periodicidad y fecha de cada compromiso.
 *
 * "estado" distingue un préstamo NUEVO (arranca hoy, en la cuota 1) de uno
 * EN_EJECUCION (ya lleva tiempo corriendo) — ver Loan.calcularPlan().
 */
export class Loan {
  readonly id?: number;
  readonly userId: number;
  readonly nombre: string;
  readonly monto: number;
  readonly tasaEfectivaAnual: number;
  readonly numeroCuotas: number;
  readonly mesInicioAmortizacion: string;
  readonly valorCuotaManual: number | null;
  readonly compromisosCuotaExtraordinaria: AbonoDefinition[];
  readonly estado: EstadoPrestamo;
  readonly numeroCuotaInicial: number;
  readonly moneda: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;

  constructor(props: LoanProps) {
    if (!props.nombre?.trim()) throw new Error('El nombre del préstamo es obligatorio.');
    if (!(props.monto > 0)) throw new Error('El monto debe ser mayor a 0.');
    if (!(props.tasaEfectivaAnual >= 0)) throw new Error('La tasa efectiva anual debe ser un número válido.');
    if (!(props.numeroCuotas > 0)) throw new Error('El número de cuotas debe ser mayor a 0.');
    if (!props.mesInicioAmortizacion || isNaN(Date.parse(props.mesInicioAmortizacion))) {
      throw new Error('La fecha de inicio de amortización es inválida.');
    }
    const numeroCuotaInicial = props.numeroCuotaInicial ?? 1;
    if (!(numeroCuotaInicial > 0) || !Number.isInteger(numeroCuotaInicial)) {
      throw new Error('El número de cuota inicial debe ser un entero mayor a 0.');
    }
    const moneda = (props.moneda ?? 'COP').toUpperCase();
    if (!CODIGO_MONEDA_REGEX.test(moneda)) {
      throw new Error('El código de moneda debe tener 3 letras (ISO 4217), ej. COP, USD, EUR.');
    }

    this.id = props.id;
    this.userId = props.userId;
    this.nombre = props.nombre.trim();
    this.monto = props.monto;
    this.tasaEfectivaAnual = props.tasaEfectivaAnual;
    this.numeroCuotas = props.numeroCuotas;
    this.mesInicioAmortizacion = props.mesInicioAmortizacion;
    this.valorCuotaManual = props.valorCuotaManual ?? null;
    this.compromisosCuotaExtraordinaria = props.compromisosCuotaExtraordinaria ?? [];
    this.estado = props.estado ?? 'NUEVO';
    this.numeroCuotaInicial = numeroCuotaInicial;
    this.moneda = moneda;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /** Calcula el plan de pagos completo delegando en el servicio de dominio. */
  calcularPlan(): PlanPagos {
    return AmortizationDomainService.calcular({
      monto: this.monto,
      tasaEfectivaAnual: this.tasaEfectivaAnual,
      numeroCuotas: this.numeroCuotas,
      mesInicioAmortizacion: this.mesInicioAmortizacion,
      valorCuotaManual: this.valorCuotaManual,
      abonos: this.compromisosCuotaExtraordinaria,
      numeroCuotaInicial: this.numeroCuotaInicial,
    });
  }

  /**
   * Calcula el plan "real": el mismo préstamo, sumando a su compromiso de
   * cuota extraordinaria los abonos adicionales que efectivamente se
   * pagaron (histórico de pagos reales, cada uno tratado como PUNTUAL). No
   * cambia monto/tasa/plazo/cuota — solo agrega saldo abonado de más.
   */
  calcularPlanConAbonosAdicionales(abonosAdicionales: AbonoDefinition[]): PlanPagos {
    return AmortizationDomainService.calcular({
      monto: this.monto,
      tasaEfectivaAnual: this.tasaEfectivaAnual,
      numeroCuotas: this.numeroCuotas,
      mesInicioAmortizacion: this.mesInicioAmortizacion,
      valorCuotaManual: this.valorCuotaManual,
      abonos: [...this.compromisosCuotaExtraordinaria, ...abonosAdicionales],
      numeroCuotaInicial: this.numeroCuotaInicial,
    });
  }
}
