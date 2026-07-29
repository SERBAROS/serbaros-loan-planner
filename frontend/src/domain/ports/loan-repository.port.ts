import { LoanDetail, LoanInput, LoanListItem, SimulatedPlan, SimulateLoanInput } from '../entities/loan';

/**
 * Puerto de salida: lo que la aplicación necesita para trabajar con
 * préstamos, sin saber si detrás hay una API REST, GraphQL, o datos
 * locales. La infraestructura implementa este contrato.
 */
export interface LoanRepositoryPort {
  list(): Promise<LoanListItem[]>;
  getById(id: number): Promise<LoanDetail>;
  create(input: LoanInput): Promise<{ id: number }>;
  update(id: number, input: LoanInput): Promise<void>;
  remove(id: number): Promise<void>;
  simulate(input: SimulateLoanInput): Promise<SimulatedPlan>;
}
