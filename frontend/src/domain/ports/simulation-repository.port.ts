import { SimulationDetail, SimulationInput, SimulationsList } from '../entities/loan';

export interface SimulationRepositoryPort {
  list(loanId: number): Promise<SimulationsList>;
  getById(loanId: number, id: number): Promise<SimulationDetail>;
  create(loanId: number, input: SimulationInput): Promise<{ id: number }>;
  update(loanId: number, id: number, input: SimulationInput): Promise<void>;
  remove(loanId: number, id: number): Promise<void>;
}
