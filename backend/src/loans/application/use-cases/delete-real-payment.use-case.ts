import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { REAL_PAYMENT_REPOSITORY, RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';

@Injectable()
export class DeleteRealPaymentUseCase {
  constructor(@Inject(REAL_PAYMENT_REPOSITORY) private readonly realPaymentRepository: RealPaymentRepositoryPort) {}

  async execute(loanId: number, paymentId: number, userId: number): Promise<{ ok: true }> {
    const ok = await this.realPaymentRepository.delete(paymentId, loanId, userId);
    if (!ok) throw new NotFoundException('Pago real no encontrado.');
    return { ok: true };
  }
}
