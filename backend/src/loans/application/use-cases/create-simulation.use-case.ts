import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Simulation } from '../../domain/entities/simulation.entity';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { SIMULATION_REPOSITORY, SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { AbonoDefinition } from '../../domain/services/amortization.service';

export interface SimulationInput {
  nombre: string;
  valorCuotaManual?: number | null;
  compromisosAdicionales?: AbonoDefinition[];
}

@Injectable()
export class CreateSimulationUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(SIMULATION_REPOSITORY) private readonly simulationRepository: SimulationRepositoryPort,
  ) {}

  async execute(loanId: number, userId: number, input: SimulationInput): Promise<{ id: number }> {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const simulation = new Simulation({
      loanId,
      userId,
      nombre: input.nombre,
      valorCuotaManual: input.valorCuotaManual ?? null,
      compromisosAdicionales: input.compromisosAdicionales ?? [],
    });

    // Valida que el escenario combinado con la base no explote antes de guardar
    simulation.calcularPlan(base);

    const id = await this.simulationRepository.create(simulation);
    return { id };
  }
}
