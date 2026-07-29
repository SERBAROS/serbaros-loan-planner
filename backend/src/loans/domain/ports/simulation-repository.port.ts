import { Simulation } from '../entities/simulation.entity';

export const SIMULATION_REPOSITORY = Symbol('SIMULATION_REPOSITORY');

export interface SimulationRepositoryPort {
  findAllByLoan(loanId: number, userId: number): Promise<Simulation[]>;
  findByIdAndLoan(id: number, loanId: number, userId: number): Promise<Simulation | null>;
  create(simulation: Simulation): Promise<number>;
  update(id: number, loanId: number, userId: number, simulation: Simulation): Promise<boolean>;
  delete(id: number, loanId: number, userId: number): Promise<boolean>;
}
