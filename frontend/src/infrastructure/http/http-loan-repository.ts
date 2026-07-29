import { LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { LoanDetail, LoanInput, LoanListItem, SimulatedPlan, SimulateLoanInput } from '../../domain/entities/loan';
import { httpRequest } from './http-client';

/**
 * Adaptador HTTP del puerto de préstamos. Recibe una función `getToken`
 * en vez de depender directamente del contexto de React o de localStorage,
 * así se mantiene independiente de cómo se gestione la sesión.
 */
export class HttpLoanRepository implements LoanRepositoryPort {
  constructor(private readonly getToken: () => string | null) {}

  list(): Promise<LoanListItem[]> {
    return httpRequest<{ loans: LoanListItem[] }>('/loans', { token: this.getToken() }).then((r) => r.loans);
  }

  getById(id: number): Promise<LoanDetail> {
    return httpRequest<LoanDetail>(`/loans/${id}`, { token: this.getToken() });
  }

  create(input: LoanInput): Promise<{ id: number }> {
    return httpRequest<{ id: number }>('/loans', { method: 'POST', body: input, token: this.getToken() });
  }

  update(id: number, input: LoanInput): Promise<void> {
    return httpRequest<void>(`/loans/${id}`, { method: 'PUT', body: input, token: this.getToken() });
  }

  remove(id: number): Promise<void> {
    return httpRequest<void>(`/loans/${id}`, { method: 'DELETE', token: this.getToken() });
  }

  simulate(input: SimulateLoanInput): Promise<SimulatedPlan> {
    return httpRequest<SimulatedPlan>('/loans/simulate', { method: 'POST', body: input, token: this.getToken() });
  }
}
