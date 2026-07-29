import { RealPaymentInput, RealPaymentPlan } from '../entities/loan';

export interface RealPaymentRepositoryPort {
  getPlan(loanId: number): Promise<RealPaymentPlan>;
  create(loanId: number, input: RealPaymentInput): Promise<{ id: number }>;
  update(loanId: number, id: number, input: RealPaymentInput): Promise<void>;
  remove(loanId: number, id: number): Promise<void>;
}
