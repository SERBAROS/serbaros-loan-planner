import { RealPayment } from '../../domain/entities/real-payment.entity';
import { RealPaymentOrmEntity } from '../persistence/real-payment.orm-entity';

export class RealPaymentMapper {
  static toDomain(row: RealPaymentOrmEntity): RealPayment {
    return new RealPayment({
      id: row.id,
      loanId: row.loanId,
      userId: row.userId,
      numeroCuota: row.numeroCuota,
      monto: row.monto,
      concepto: row.concepto,
      fechaPago: row.fechaPago,
      createdAt: row.createdAt?.toISOString(),
    });
  }

  static toPersistence(payment: RealPayment): Partial<RealPaymentOrmEntity> {
    return {
      loanId: payment.loanId,
      userId: payment.userId,
      numeroCuota: payment.numeroCuota,
      monto: payment.monto,
      concepto: payment.concepto,
      fechaPago: payment.fechaPago,
    };
  }
}
