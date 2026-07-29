import { SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { SimulationDetail, SimulationInput, SimulationsList } from '../../domain/entities/loan';

export class ListSimulationsUseCase {
  constructor(private readonly simulationRepository: SimulationRepositoryPort) {}
  execute(loanId: number): Promise<SimulationsList> {
    return this.simulationRepository.list(loanId);
  }
}

export class GetSimulationUseCase {
  constructor(private readonly simulationRepository: SimulationRepositoryPort) {}
  execute(loanId: number, id: number): Promise<SimulationDetail> {
    return this.simulationRepository.getById(loanId, id);
  }
}

export class CreateSimulationUseCase {
  constructor(private readonly simulationRepository: SimulationRepositoryPort) {}
  execute(loanId: number, input: SimulationInput): Promise<{ id: number }> {
    return this.simulationRepository.create(loanId, input);
  }
}

export class UpdateSimulationUseCase {
  constructor(private readonly simulationRepository: SimulationRepositoryPort) {}
  execute(loanId: number, id: number, input: SimulationInput): Promise<void> {
    return this.simulationRepository.update(loanId, id, input);
  }
}

export class DeleteSimulationUseCase {
  constructor(private readonly simulationRepository: SimulationRepositoryPort) {}
  execute(loanId: number, id: number): Promise<void> {
    return this.simulationRepository.remove(loanId, id);
  }
}
