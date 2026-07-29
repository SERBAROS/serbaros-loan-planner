import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Simulation } from '../../domain/entities/simulation.entity';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { SIMULATION_REPOSITORY, SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { SimulationInput } from './create-simulation.use-case';

@Injectable()
export class UpdateSimulationUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(SIMULATION_REPOSITORY) private readonly simulationRepository: SimulationRepositoryPort,
  ) {}

  async execute(loanId: number, simulationId: number, userId: number, input: SimulationInput): Promise<{ ok: true }> {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const existing = await this.simulationRepository.findByIdAndLoan(simulationId, loanId, userId);
    if (!existing) throw new NotFoundException('Simulación no encontrada.');

    const simulation = new Simulation({
      id: simulationId,
      loanId,
      userId,
      nombre: input.nombre,
      valorCuotaManual: input.valorCuotaManual ?? null,
      compromisosAdicionales: input.compromisosAdicionales ?? [],
    });

    simulation.calcularPlan(base);

    const ok = await this.simulationRepository.update(simulationId, loanId, userId, simulation);
    if (!ok) throw new NotFoundException('Simulación no encontrada.');
    return { ok: true };
  }
}
