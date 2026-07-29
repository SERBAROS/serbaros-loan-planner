import { RealPayment } from '../../domain/entities/real-payment.entity';
import { AbonoPuntual } from '../../domain/services/amortization.service';

export function realPaymentToAbono(p: RealPayment): AbonoPuntual {
  return {
    id: `pago-real-${p.id ?? 'nuevo'}`,
    tipo: 'PUNTUAL',
    monto: p.monto,
    numeroCuota: p.numeroCuota,
  };
}
