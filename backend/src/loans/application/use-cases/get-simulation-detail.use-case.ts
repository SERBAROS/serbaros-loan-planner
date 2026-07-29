import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { SIMULATION_REPOSITORY, SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { PlanComparisonService } from '../../domain/services/plan-comparison.service';

@Injectable()
export class GetSimulationDetailUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(SIMULATION_REPOSITORY) private readonly simulationRepository: SimulationRepositoryPort,
  ) {}

  async execute(loanId: number, simulationId: number, userId: number) {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const simulation = await this.simulationRepository.findByIdAndLoan(simulationId, loanId, userId);
    if (!simulation) throw new NotFoundException('Simulación no encontrada.');

    const baseResumen = base.calcularPlan().resumen;
    const plan = simulation.calcularPlan(base);

    return {
      id: simulation.id,
      loanId: simulation.loanId,
      nombre: simulation.nombre,
      moneda: base.moneda,
      createdAt: simulation.createdAt,
      valorCuotaManual: simulation.valorCuotaManual,
      compromisosAdicionales: simulation.compromisosAdicionales,
      base: baseResumen,
      comparacion: PlanComparisonService.comparar(baseResumen, plan.resumen),
      ...plan,
    };
  }
}
