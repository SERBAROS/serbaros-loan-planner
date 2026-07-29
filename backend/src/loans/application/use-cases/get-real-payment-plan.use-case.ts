import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { REAL_PAYMENT_REPOSITORY, RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';
import { PlanComparisonService } from '../../domain/services/plan-comparison.service';
import { RealPayment } from '../../domain/entities/real-payment.entity';
import { realPaymentToAbono } from './real-payment-to-abono';

@Injectable()
export class GetRealPaymentPlanUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(REAL_PAYMENT_REPOSITORY) private readonly realPaymentRepository: RealPaymentRepositoryPort,
  ) {}

  async execute(loanId: number, userId: number) {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const pagos = await this.realPaymentRepository.findAllByLoan(loanId, userId);
    const baseResumen = base.calcularPlan().resumen;

    const plan = base.calcularPlanConAbonosAdicionales(pagos.map(realPaymentToAbono));

    return {
      base: baseResumen,
      moneda: base.moneda,
      comparacion: PlanComparisonService.comparar(baseResumen, plan.resumen),
      pagos: pagos.map(serializePayment),
      ...plan,
    };
  }
}

function serializePayment(p: RealPayment) {
  return {
    id: p.id,
    numeroCuota: p.numeroCuota,
    monto: p.monto,
    concepto: p.concepto,
    fechaPago: p.fechaPago,
    createdAt: p.createdAt,
  };
}
