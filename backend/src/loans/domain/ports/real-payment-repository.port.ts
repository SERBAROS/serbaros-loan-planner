import { RealPayment } from '../entities/real-payment.entity';

export const REAL_PAYMENT_REPOSITORY = Symbol('REAL_PAYMENT_REPOSITORY');

export interface RealPaymentRepositoryPort {
  findAllByLoan(loanId: number, userId: number): Promise<RealPayment[]>;
  findByIdAndLoan(id: number, loanId: number, userId: number): Promise<RealPayment | null>;
  create(payment: RealPayment): Promise<number>;
  update(id: number, loanId: number, userId: number, payment: RealPayment): Promise<boolean>;
  delete(id: number, loanId: number, userId: number): Promise<boolean>;
}
