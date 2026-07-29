import { RealPaymentRepositoryPort } from '../../domain/ports/real-payment-repository.port';
import { RealPaymentInput, RealPaymentPlan } from '../../domain/entities/loan';
import { httpRequest } from './http-client';

export class HttpRealPaymentRepository implements RealPaymentRepositoryPort {
  constructor(private readonly getToken: () => string | null) {}

  getPlan(loanId: number): Promise<RealPaymentPlan> {
    return httpRequest<RealPaymentPlan>(`/loans/${loanId}/real-payments`, { token: this.getToken() });
  }

  create(loanId: number, input: RealPaymentInput): Promise<{ id: number }> {
    return httpRequest<{ id: number }>(`/loans/${loanId}/real-payments`, {
      method: 'POST',
      body: input,
      token: this.getToken(),
    });
  }

  update(loanId: number, id: number, input: RealPaymentInput): Promise<void> {
    return httpRequest<void>(`/loans/${loanId}/real-payments/${id}`, {
      method: 'PUT',
      body: input,
      token: this.getToken(),
    });
  }

  remove(loanId: number, id: number): Promise<void> {
    return httpRequest<void>(`/loans/${loanId}/real-payments/${id}`, { method: 'DELETE', token: this.getToken() });
  }
}
