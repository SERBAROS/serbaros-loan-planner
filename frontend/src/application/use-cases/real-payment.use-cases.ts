import { RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';
import { RealPaymentInput, RealPaymentPlan } from '../../domain/entities/loan';

export class GetRealPaymentPlanUseCase {
  constructor(private readonly realPaymentRepository: RealPaymentRepositoryPort) {}
  execute(loanId: number): Promise<RealPaymentPlan> {
    return this.realPaymentRepository.getPlan(loanId);
  }
}

export class CreateRealPaymentUseCase {
  constructor(private readonly realPaymentRepository: RealPaymentRepositoryPort) {}
  execute(loanId: number, input: RealPaymentInput): Promise<{ id: number }> {
    return this.realPaymentRepository.create(loanId, input);
  }
}

export class UpdateRealPaymentUseCase {
  constructor(private readonly realPaymentRepository: RealPaymentRepositoryPort) {}
  execute(loanId: number, id: number, input: RealPaymentInput): Promise<void> {
    return this.realPaymentRepository.update(loanId, id, input);
  }
}

export class DeleteRealPaymentUseCase {
  constructor(private readonly realPaymentRepository: RealPaymentRepositoryPort) {}
  execute(loanId: number, id: number): Promise<void> {
    return this.realPaymentRepository.remove(loanId, id);
  }
}
