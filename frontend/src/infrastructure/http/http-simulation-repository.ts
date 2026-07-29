import { SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { SimulationDetail, SimulationInput, SimulationsList } from '../../domain/entities/loan';
import { httpRequest } from './http-client';

export class HttpSimulationRepository implements SimulationRepositoryPort {
  constructor(private readonly getToken: () => string | null) {}

  list(loanId: number): Promise<SimulationsList> {
    return httpRequest<SimulationsList>(`/loans/${loanId}/simulations`, { token: this.getToken() });
  }

  getById(loanId: number, id: number): Promise<SimulationDetail> {
    return httpRequest<SimulationDetail>(`/loans/${loanId}/simulations/${id}`, { token: this.getToken() });
  }

  create(loanId: number, input: SimulationInput): Promise<{ id: number }> {
    return httpRequest<{ id: number }>(`/loans/${loanId}/simulations`, {
      method: 'POST',
      body: input,
      token: this.getToken(),
    });
  }

  update(loanId: number, id: number, input: SimulationInput): Promise<void> {
    return httpRequest<void>(`/loans/${loanId}/simulations/${id}`, {
      method: 'PUT',
      body: input,
      token: this.getToken(),
    });
  }

  remove(loanId: number, id: number): Promise<void> {
    return httpRequest<void>(`/loans/${loanId}/simulations/${id}`, { method: 'DELETE', token: this.getToken() });
  }
}
