import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { RealPayment } from '../../domain/entities/real-payment.entity';
import { realPaymentToAbono } from './real-payment-to-abono';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { REAL_PAYMENT_REPOSITORY, RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';

export interface RealPaymentInput {
  numeroCuota: number;
  monto: number;
  concepto: string;
  fechaPago: string;
}

@Injectable()
export class CreateRealPaymentUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(REAL_PAYMENT_REPOSITORY) private readonly realPaymentRepository: RealPaymentRepositoryPort,
  ) {}

  async execute(loanId: number, userId: number, input: RealPaymentInput): Promise<{ id: number }> {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const payment = new RealPayment({
      loanId,
      userId,
      numeroCuota: input.numeroCuota,
      monto: input.monto,
      concepto: input.concepto,
      fechaPago: input.fechaPago,
    });

    // Valida que sumado a los demás pagos reales existentes, el plan no explote
    const existentes = await this.realPaymentRepository.findAllByLoan(loanId, userId);
    base.calcularPlanConAbonosAdicionales(
      [...existentes, payment].map(realPaymentToAbono),
    );

    const id = await this.realPaymentRepository.create(payment);
    return { id };
  }
}
