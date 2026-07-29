export interface RealPaymentProps {
  id?: number;
  loanId: number;
  userId: number;
  numeroCuota: number;
  monto: number;
  concepto: string;
  fechaPago: string;
  createdAt?: string;
}

/**
 * Entidad de dominio RealPayment: un registro de que un abono/cuota extra
 * REALMENTE se pagó, con su fecha real. A diferencia de Simulation (un
 * escenario hipotético que se edita como un todo), RealPayment es un
 * histórico de eventos que se van agregando en el tiempo a medida que
 * ocurren pagos reales — un ledger, no una configuración.
 *
 * "concepto" es una etiqueta libre del usuario (ej. "Prima", "Cesantías",
 * "Abono voluntario") para que pueda identificar cada pago real, aunque
 * para el cálculo todos se tratan igual: reducen el saldo en la cuota
 * indicada, igual que un abono a capital.
 */
export class RealPayment {
  readonly id?: number;
  readonly loanId: number;
  readonly userId: number;
  readonly numeroCuota: number;
  readonly monto: number;
  readonly concepto: string;
  readonly fechaPago: string;
  readonly createdAt?: string;

  constructor(props: RealPaymentProps) {
    if (!(props.numeroCuota > 0) || !Number.isInteger(props.numeroCuota)) {
      throw new Error('El número de cuota debe ser un entero mayor a 0.');
    }
    if (!(props.monto > 0)) {
      throw new Error('El monto del pago real debe ser mayor a 0.');
    }
    if (!props.concepto?.trim()) {
      throw new Error('El concepto del pago real es obligatorio.');
    }
    if (!props.fechaPago || isNaN(Date.parse(props.fechaPago))) {
      throw new Error('La fecha de pago es inválida.');
    }

    this.id = props.id;
    this.loanId = props.loanId;
    this.userId = props.userId;
    this.numeroCuota = props.numeroCuota;
    this.monto = props.monto;
    this.concepto = props.concepto.trim();
    this.fechaPago = props.fechaPago;
    this.createdAt = props.createdAt;
  }
}
