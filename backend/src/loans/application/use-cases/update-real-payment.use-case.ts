import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RealPayment } from '../../domain/entities/real-payment.entity';
import { realPaymentToAbono } from './real-payment-to-abono';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { REAL_PAYMENT_REPOSITORY, RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';
import { RealPaymentInput } from './create-real-payment.use-case';

@Injectable()
export class UpdateRealPaymentUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(REAL_PAYMENT_REPOSITORY) private readonly realPaymentRepository: RealPaymentRepositoryPort,
  ) {}

  async execute(loanId: number, paymentId: number, userId: number, input: RealPaymentInput): Promise<{ ok: true }> {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const existing = await this.realPaymentRepository.findByIdAndLoan(paymentId, loanId, userId);
    if (!existing) throw new NotFoundException('Pago real no encontrado.');

    const payment = new RealPayment({
      id: paymentId,
      loanId,
      userId,
      numeroCuota: input.numeroCuota,
      monto: input.monto,
      concepto: input.concepto,
      fechaPago: input.fechaPago,
    });

    const otros = (await this.realPaymentRepository.findAllByLoan(loanId, userId)).filter((p) => p.id !== paymentId);
    base.calcularPlanConAbonosAdicionales([...otros, payment].map(realPaymentToAbono));

    const ok = await this.realPaymentRepository.update(paymentId, loanId, userId, payment);
    if (!ok) throw new NotFoundException('Pago real no encontrado.');
    return { ok: true };
  }
}
