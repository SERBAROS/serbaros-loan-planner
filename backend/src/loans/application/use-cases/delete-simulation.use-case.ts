import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SIMULATION_REPOSITORY, SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';

@Injectable()
export class DeleteSimulationUseCase {
  constructor(@Inject(SIMULATION_REPOSITORY) private readonly simulationRepository: SimulationRepositoryPort) {}

  async execute(loanId: number, simulationId: number, userId: number): Promise<{ ok: true }> {
    const ok = await this.simulationRepository.delete(simulationId, loanId, userId);
    if (!ok) throw new NotFoundException('Simulación no encontrada.');
    return { ok: true };
  }
}
