import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LOAN_REPOSITORY, LoanRepositoryPort } from '../../domain/ports/loan-repository.port';
import { SIMULATION_REPOSITORY, SimulationRepositoryPort } from '../../domain/ports/simulation-repository.port';
import { ResumenPlanPagos } from '../../domain/services/amortization.service';
import { ComparacionPlan, PlanComparisonService } from '../../domain/services/plan-comparison.service';

export interface SimulationListItem {
  id: number;
  nombre: string;
  createdAt?: string;
  resumen?: ResumenPlanPagos;
  comparacion?: ComparacionPlan;
  error?: string;
}

@Injectable()
export class ListSimulationsUseCase {
  constructor(
    @Inject(LOAN_REPOSITORY) private readonly loanRepository: LoanRepositoryPort,
    @Inject(SIMULATION_REPOSITORY) private readonly simulationRepository: SimulationRepositoryPort,
  ) {}

  async execute(
    loanId: number,
    userId: number,
  ): Promise<{ base: ResumenPlanPagos; moneda: string; simulations: SimulationListItem[] }> {
    const base = await this.loanRepository.findByIdAndUser(loanId, userId);
    if (!base) throw new NotFoundException('Préstamo no encontrado.');

    const baseResumen = base.calcularPlan().resumen;
    const simulations = await this.simulationRepository.findAllByLoan(loanId, userId);

    const items: SimulationListItem[] = simulations.map((sim) => {
      try {
        const { resumen } = sim.calcularPlan(base);
        return {
          id: sim.id as number,
          nombre: sim.nombre,
          createdAt: sim.createdAt,
          resumen,
          comparacion: PlanComparisonService.comparar(baseResumen, resumen),
        };
      } catch (err) {
        return { id: sim.id as number, nombre: sim.nombre, createdAt: sim.createdAt, error: (err as Error).message };
      }
    });

    return { base: baseResumen, moneda: base.moneda, simulations: items };
  }
}
